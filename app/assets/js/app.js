/**
 * Declare the namespace for this example
 */
var flowmaker = {};

/**
 * Main application class
 */
flowmaker.Application = Class.extend({

  NAME: "flowmaker.Application",

  /**
   * Constructor
   */
  init: function() {
    this.view = new flowmaker.View("canvas");
    this.toolbar = new flowmaker.Toolbar(this, this.view);
    /*
    this.appLayout = $('#main').layout({
      north: {
        resizable: false,
        closable: false,
        spacing_open: 0,
        spacing_closed: 0,
        size: 50,
        paneSelector: "nav"
      },
      center: {
        resizable: false,
        closable: false,
        spacing_open: 0,
        spacing_closed: 0,
        paneSelector: "#canvas"
      }
    });
    */

    // Keeps the last mouse event
    this.lastMouseEvent = null;

    // Handle to currently opened local file
    this.currentFlowFile = null;

    // Update the preview
    this.updatePreview();

    // Register this class as event listener for the canvas CommandStack
    this.view.getCommandStack().addEventListener(this);

    // Setup main view handler
    this.view.on("contextmenu", $.proxy(this.onContextMenu, this));
    this.view.on("dblclick", $.proxy(this.onDoubleClick, this));
    this.view.on("select", $.proxy(this.onSelectionChanged, this));
  },

  /**
   * Update diagram layout
   */
  layout: function() {
    //this.appLayout.resizeAll();
  },

  updatePreview: function() {
    /*
    this.view.previewPNG(function(png, width, height) {
      if (png == null) {
        return;
      }
      $("#preview").css("width", "150px").css("height", Math.round((150*height/width)) + "px");
      $("#preview").attr("src", png);
    });
    */
  },

  /**
   * Canvas' contextmenu event handler
   */
  onContextMenu: function(view, e) {
    var figure = this.view.getBestFigure(e.x, e.y);
    if (figure != null) {
      return false;
    }

    // remember the mouse event (for placing new stuff on canvas)
    this.lastMouseEvent = e;

    $.contextMenu({
      selector: '#canvas',
      events: {
        hide: function() {
          $.contextMenu('destroy');
        }
      },
      callback: $.proxy(function(key, options) {
        switch (key) {
          case "add-component":
            this.addComponent();
            break;
          case "add-iip":
            this.addIIP();
            break;
          case "add-export-input":
            this.addExportInput();
            break;
          case "add-export-output":
            this.addExportOutput();
            break;
          case "add-legend":
            this.addLegend();
            break;
          case "delete":
            // without undo/redo support
            //     this.getCanvas().remove(this);

            // with undo/redo support
            var cmd = new draw2d.command.CommandDelete(this);
            this.getCanvas().getCommandStack().execute(cmd);
          default:
            break;
        }

      }, this),
      x: e.x,
      y: e.y,
      items: {
        "add-component": {
          name: "Add Component"
        },
        "add-iip": {
          name: "Add Initial IP"
        },
        "add-export-input": {
          name: "Add Exported Input port"
        },
        "add-export-output": {
          name: "Add Exported Output port"
        },
        "add-legend": {
          name: "Add Legend"
        },
        "sep1": "---------",
        "close": {
          name: "Close",
        }
      }
    });
  },

  /**
   * Canvas' dblclick event handler
   */
  onDoubleClick: function(emitterFunction) {},

  /**
   * Called if the selection in the cnavas has been changed. You must register this
   * class on the canvas to receive this event.
   */
  onSelectionChanged: function(emitter, figure) {},

  /**
   * Sent when an event occurs on the command stack. draw2d.command.CommandStackEvent.getDetail()
   * can be used to identify the type of event which has occurred.
   **/
  stackChanged: function(e) {
    if (e.isPostChangeEvent()) {
      this.updatePreview();
    }
  },

  /**
   * Load the JSON data into the view/canvas
   */
  load: function(jsonDocument) {
    this.view.setZoom(1.0, true);
    this.view.clear();

    var reader = new draw2d.io.json.Reader();
    reader.unmarshal(this.view, jsonDocument);
    this.updatePreview();
  },

  /**
   * Shows confirm dialog and resets the canvas if confirmed
   */
  newFlow: function() {
    var modal = $('#confirmModal');
    modal.find('.modal-title').text("Create New Flow");
    modal.find('.modal-body').html("Are you sure to reset the canvas and start a new flow?<br/><br/>Any unsaved changes in the current flow will be lost!");

    modal.find('.btn-primary').hide();

    var btn = modal.find('.btn-danger');
    btn.show();
    btn.text("Confirm");
    btn.off('click');
    btn.on('click', $.proxy(function() {
      modal.modal('hide');
      this.view.setZoom(1.0, true);
      this.view.clear();
    }, this));

    modal.modal('show');
  },

  /**
   * Open a new flow from local file system
   */
  openFlow: function() {
    var modal = $('#confirmModal');
    modal.find('.modal-title').text("Open New Flow");
    modal.find('.modal-body').html('<input type="file" class="form-control" id="storage_files" name="files" /><br/><span>Any unsaved changes in the current flow will be lost!</span>');

    modal.find('.btn-danger').hide();
    modal.find('.btn-primary').hide();

    /*
    var btn = modal.find('.btn-primary');
    btn.show();
    btn.addClass('disabled');
    btn.text("Load");
    btn.off('click');
    btn.on('click', $.proxy(function() {
      modal.modal('hide');

      var f = $('#storage_files').prop('files')[0];
      f.title = f.name;
      var reader = new FileReader();
      reader.onload = $.proxy(function(e) {
        this.currentFlowFile = f;
        this.load(e.target.result);
        e.target.result
      }, this);
      reader.readAsText(f);

    }, this));
    */

    $('#storage_files').on('change', $.proxy(function(e) {
      //btn.removeClass('disabled');

      modal.find('.modal-title').text("Please wait. Loading...");

      var f = $('#storage_files').prop('files')[0];
      f.title = f.name;
      var reader = new FileReader();
      reader.onload = $.proxy(function(e) {
        this.currentFlowFile = f;
        this.load(e.target.result);
        modal.modal('hide');
      }, this);

      //modal.find('.modal-body').append('Loading flow...');
      reader.readAsText(f);

    }, this));

    modal.modal('show');
  },

  /*
   * Show save flow as local file dialog and handle the actions
   */
  saveFlow: function() {
    this._openSingleInputModal("Save Flow to File",
      "Filename",
      "Save",
      $.proxy(function() {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(this.view, function(json) {
          /*
          var storage = new draw2d.storage.LocalFileStorage();
          storage.saveFile("~/demo.json", JSON.stringify(json, null, 2), "", function(data){
            console.log("OK");
            console.log(data);
          });
          */
          var blob = new Blob([JSON.stringify(json, null, 2)], {
            type: "application/json"
          });
          saveAs(blob, $('#single-content').val());

        });
        return true;
      }, this));
  },

  /**
   * Show modal dialog to create a new component
   */
  addComponent: function() {
    var modal = $('#addComponentModal');

    modal.find('.modal-title').text("New Component");
    modal.find('.btn-primary').text("Add to network");
    modal.find('#node-name').val('');
    modal.find('#node-component').val('');
    modal.find('#node-inputs').val(1);
    modal.find('#node-outputs').val(1);

    modal.find('.btn-primary').off('click');
    modal.find('.btn-primary').on('click', $.proxy(function() {
      if (this.handleAddComponent()) {
        modal.modal('hide');
      }
    }, this));

    modal.modal('show');
    modal.find('#node-name').focus();
  },

  /**
   * Handle adding new component
   */
  handleAddComponent: function() {
    var form = $('#addComponentModal');

    // Validate input
    if (form.find('#node-name').val() == '') {
      form.find('.form-group:first').addClass('has-error');
      form.find('#node-name').focus();
      return false;
    } else {
      form.find('.form-group:first').removeClass('has-error');
    }
    if (form.find('#node-component').val() == '') {
      form.find('.form-group:nth-child(2)').addClass('has-error');
      form.find('#node-component').focus();
      return false;
    } else {
      form.find('.form-group:nth-child(2)').removeClass('has-error');
    }

    // Create component
    var n = new flowmaker.Component(
      form.find('#node-name').val(),
      form.find('#node-component').val(),
      form.find('#node-inputs').val(),
      form.find('#node-outputs').val()
    );

    if (this.lastMouseEvent == null) {
      this.lastMouseEvent = {
        "x": 300,
        "y": 300
      };
    }

    // Add to canvas
    this.view.add(n, this.lastMouseEvent.x, this.lastMouseEvent.y);

    return true;
  },

  /**
   * A common function to open modal dialog with a single input field
   */
  _openSingleInputModal: function(title, inputLabel, saveTitle, handler) {
    var modal = $('#singleFieldModal');

    modal.find('.modal-title').text(title);
    modal.find('.btn-primary').text(saveTitle);
    modal.find('.control-label').text(inputLabel);
    modal.find('#single-content').val('');

    modal.find('.btn-primary').off('click');
    modal.find('.btn-primary').on('click', $.proxy(function() {
      if (handler()) {
        modal.modal('hide');
      }
    }, this));

    modal.modal('show');
    modal.find('#single-content').focus();
  },

  /**
   * A common handler to process save event from a single input field modal
   */
  _handleSingleInputModalSave: function(figureClass) {
    var form = $('#singleFieldModal');

    // Validate input
    if (form.find('#single-content').val() == '') {
      form.find('.form-group:first').addClass('has-error');
      form.find('#single-content').focus();
      return false;
    } else {
      form.find('.form-group:first').removeClass('has-error');
    }

    if (this.lastMouseEvent == null) {
      this.lastMouseEvent = {
        "x": 300,
        "y": 300
      };
    }

    var figure = new figureClass(form.find('#single-content').val());
    this.view.add(figure, this.lastMouseEvent.x, this.lastMouseEvent.y);

    return true;
  },

  /**
   * Show modal dialog to create IIP
   */
  addIIP: function() {
    this._openSingleInputModal("New Initial IP",
      "Payload",
      "Add to network",
      $.proxy(function() {
        return this._handleSingleInputModalSave(flowmaker.IIP);
      }, this));
  },

  /**
   * Show modal dialog to create exported Input port
   */
  addExportInput: function() {
    this._openSingleInputModal("New Exported Input Port",
      "External Name",
      "Add to network",
      $.proxy(function() {
        return this._handleSingleInputModalSave(flowmaker.ExportedInput);
      }, this));
  },

  /**
   * Show modal dialog to create exported Output port
   */
  addExportOutput: function() {
    this._openSingleInputModal("New Exported Output Port",
      "External Name",
      "Add to network",
      $.proxy(function() {
        return this._handleSingleInputModalSave(flowmaker.ExportedOutput);
      }, this));
  },

  /**
   * Show modal dialog to create legend
   */
  addLegend: function() {
    this._openSingleInputModal("New Legend",
      "Text",
      "Add to network",
      $.proxy(function() {
        return this._handleSingleInputModalSave(flowmaker.Legend);
      }, this));
  },

  /*
   * Show modal dialog with a brief help
   */
  showHelp: function() {
    var modal = $('#helpModal');
    modal.modal('show');
  }

});

$(window).load(function() {
  var app = new flowmaker.Application();
  $(window).resize(function() {
    console.log(this);
  });
});