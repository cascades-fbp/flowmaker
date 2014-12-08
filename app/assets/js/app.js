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

    // Keeps the last mouse event
    this.lastMouseEvent = null;

    // Handle to currently opened local file
    this.currentFlowFile = null;

    // Update the preview
    this.updatePreview();

    // Register this class as event listener for the canvas CommandStack
    this.view.getCommandStack().addEventListener(this);

    // Setup main view handlers
    this.view.on("contextmenu", $.proxy(this.onContextMenu, this));
    this.view.on("dblclick", $.proxy(this.onDoubleClick, this));
    this.view.on("select", $.proxy(this.onSelectionChanged, this));

    // It's ugly but ok for the prototype like this (use document as event bus)
    $(document).on("editComponent", $.proxy(function(event, id) {
      this.editComponent(id);
    }, this));
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

  exportPNG: function() {
    this.view.generatePNG(function(png, base64) {
      var binaryData = new Buffer(base64, 'base64').toString('binary');

      $('#saveDialog').attr('accept', '.png');
      saveToFile('#saveDialog', 'Untitled', binaryData);
    });
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

    $("body").scrollTop(0).scrollLeft(0);

    var reader = new draw2d.io.json.Reader();
    reader.unmarshal(this.view, jsonDocument);
    this.updatePreview();
  },

  /**
   * Shows confirm dialog and resets the canvas if confirmed
   */
  newFlow: function() {
    if (confirm("You are creating a new flow.\nAny unsaved changes in the current flow will be lost.\n\nAre you sure?")) {
      this.view.setZoom(1.0, true);
      this.view.clear();
    }
  },

  /**
   * Open a new flow from local file system
   */
  openFlow: function() {
    if (confirm("You are about to load a flow from file. Any unsaved changes in the current flow will be lost!\n\nAre you sure?")) {
      this.view.clear();
      chooseFile('#openDialog', $.proxy(function(data) {
        this.load(data);
      }, this));
    }
  },

  /*
   * Show save flow as local file dialog and handle the actions
   */
  saveFlow: function() {
    var writer = new draw2d.io.json.Writer();
    writer.marshal(this.view, function(json) {
      $('#saveDialog').attr('accept', '.json,.flow');
      saveToFile('#saveDialog', 'Untitled', JSON.stringify(json, null, 2));
    });
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
   * Show modal dialog to edit a component by its id
   */
  editComponent: function(id) {
    var figure = this.view.getFigure(id);
    if (figure == null) {
      return;
    }

    var modal = $('#addComponentModal');

    modal.find('.modal-title').text("Edit Component");
    modal.find('.btn-primary').text("Save changes");
    modal.find('#node-name').val(figure.getName());
    modal.find('#node-component').val(figure.getComponent());
    modal.find('#node-inputs').val(figure.getInputPorts().getSize());
    modal.find('#node-outputs').val(figure.getOutputPorts().getSize());

    modal.find('.btn-primary').off('click');
    modal.find('.btn-primary').on('click', $.proxy(function() {
      if (this.handleEditComponent(id)) {
        modal.modal('hide');
      }
    }, this));

    modal.modal('show');
    modal.find('#node-name').focus();
  },

  /**
   * Handle changing component details
   */
  handleEditComponent: function(id) {
    var figure = this.view.getFigure(id);
    if (figure == null) {
      alert("Component not found by ID: " + id);
      return false;
    }

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

    // Update component
    figure.setName(form.find('#node-name').val());
    figure.setComponent(form.find('#node-component').val());

    // Do the port magic
    console.log("======= MAGIC =======");
    var inputPorts = figure.getInputPorts()
    var diff = inputPorts.getSize() - form.find('#node-inputs').val();
    if (diff < 0) {
      for (var i = 0; i < Math.abs(diff); i++) {
        figure.createPort("input");
      };
    } else if (diff > 0) {
      var size = inputPorts.getSize();
      for (var i = 1; i <= diff; i++) {
        figure.removePort(inputPorts.get(size - i));
      };
    }

    outputPorts = figure.getOutputPorts()
    diff = outputPorts.getSize() - form.find('#node-outputs').val()
    if (diff < 0) {
      for (var i = 0; i < Math.abs(diff); i++) {
        figure.createPort("output");
      };
    } else if (diff > 0) {
      var size = outputPorts.getSize();
      for (var i = 1; i <= diff; i++) {
        figure.removePort(outputPorts.get(size - i));
      };
    }

    // Update the labels
    figure.configurePorts();

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
});
