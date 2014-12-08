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
      if (base64 == null) {
        alert("Failed to create PNG from the current diagram!");
        return;
      }

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
  app.load(
    [{
      "type": "flowmaker.IIP",
      "id": "54d133e2-6e48-cfbf-cf1e-064a21cad54b",
      "x": 160,
      "y": 260,
      "width": 70,
      "height": 23.421875,
      "alpha": 1,
      "userData": {},
      "cssClass": "flowmaker_IIP",
      "ports": [{
        "name": "output0",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }],
      "bgColor": "none",
      "color": "#1B1B1B",
      "stroke": 1,
      "radius": 0,
      "text": "{...}",
      "outlineStroke": 0,
      "outlineColor": "none",
      "fontSize": 12,
      "fontColor": "#080808",
      "fontFamily": null
    }, {
      "type": "flowmaker.Component",
      "id": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
      "x": 370,
      "y": 290,
      "width": 110,
      "height": 180,
      "alpha": 1,
      "userData": {
        "name": "demo",
        "component": "core/demo"
      },
      "cssClass": "flowmaker_Component",
      "ports": [{
        "name": "ALEX",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }, {
        "name": "OUT",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }, {
        "name": "DEMO[3]",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }, {
        "name": "output1",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }, {
        "name": "output2",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }],
      "bgColor": "#B9DD69",
      "color": "#1B1B1B",
      "stroke": 1,
      "radius": 0
    }, {
      "type": "flowmaker.Component",
      "id": "c434dabc-3bf0-82ed-6783-b22498807a2b",
      "x": 180,
      "y": 410,
      "width": 90,
      "height": 65,
      "alpha": 1,
      "userData": {
        "name": "123",
        "component": "qwe"
      },
      "cssClass": "flowmaker_Component",
      "ports": [{
        "name": "input0",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }, {
        "name": "output0",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }],
      "bgColor": "#EFEFEF",
      "color": "#1B1B1B",
      "stroke": 1,
      "radius": 0
    }, {
      "type": "flowmaker.ExportedOutput",
      "id": "2af42740-ab3a-01eb-16c9-61b268cc6489",
      "x": 620,
      "y": 490,
      "width": 50,
      "height": 50,
      "alpha": 1,
      "userData": {
        "name": "ERR"
      },
      "cssClass": "flowmaker_ExportedOutput",
      "ports": [{
        "name": "ERR",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }],
      "bgColor": "#333333",
      "color": "#1B1B1B",
      "stroke": 0,
      "radius": 0
    }, {
      "type": "flowmaker.ExportedInput",
      "id": "ff514d40-4c70-1bfa-050a-b697119eb1c7",
      "x": 50,
      "y": 320,
      "width": 50,
      "height": 50,
      "alpha": 1,
      "userData": {
        "name": "IN"
      },
      "cssClass": "flowmaker_ExportedInput",
      "ports": [{
        "name": "IN",
        "port": "draw2d.OutputPort",
        "locator": "draw2d.layout.locator.OutputPortLocator"
      }],
      "bgColor": "#333333",
      "color": "#1B1B1B",
      "stroke": 0,
      "radius": 0
    }, {
      "type": "flowmaker.Component",
      "id": "59d4f3e1-e84c-5ccb-b6b0-228ff41f2261",
      "x": 600,
      "y": 230,
      "width": 90,
      "height": 65,
      "alpha": 1,
      "userData": {
        "name": "console",
        "component": "core/console"
      },
      "cssClass": "flowmaker_Component",
      "ports": [{
        "name": "IN",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }],
      "bgColor": "#F0C000",
      "color": "#1B1B1B",
      "stroke": 1,
      "radius": 0
    }, {
      "type": "flowmaker.ExportedOutput",
      "id": "97eff5e0-743c-f34a-d572-c207b12afd03",
      "x": 610,
      "y": 360,
      "width": 50,
      "height": 50,
      "alpha": 1,
      "userData": {
        "name": "OUT"
      },
      "cssClass": "flowmaker_ExportedOutput",
      "ports": [{
        "name": "OUT",
        "port": "draw2d.InputPort",
        "locator": "draw2d.layout.locator.InputPortLocator"
      }],
      "bgColor": "#333333",
      "color": "#1B1B1B",
      "stroke": 0,
      "radius": 0
    }, {
      "type": "flowmaker.Connection",
      "id": "01594026-d8c6-1ee8-4a59-e35759b15274",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#00A8F0",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "54d133e2-6e48-cfbf-cf1e-064a21cad54b",
        "port": "output0"
      },
      "target": {
        "node": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
        "port": "ALEX"
      }
    }, {
      "type": "flowmaker.Connection",
      "id": "b6d2b4b6-25ef-daf2-1e45-d8318a01cda8",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#00A8F0",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "c434dabc-3bf0-82ed-6783-b22498807a2b",
        "port": "output0"
      },
      "target": {
        "node": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
        "port": "DEMO[3]"
      }
    }, {
      "type": "flowmaker.Connection",
      "id": "6b3f4a72-f119-5e3a-0d33-3f998ba74d02",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#00A8F0",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "ff514d40-4c70-1bfa-050a-b697119eb1c7",
        "port": "IN"
      },
      "target": {
        "node": "c434dabc-3bf0-82ed-6783-b22498807a2b",
        "port": "input0"
      }
    }, {
      "type": "flowmaker.Connection",
      "id": "161f01cf-1e9a-4edb-a683-829fc5acbe97",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#F3546A",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
        "port": "output2"
      },
      "target": {
        "node": "2af42740-ab3a-01eb-16c9-61b268cc6489",
        "port": "ERR"
      }
    }, {
      "type": "flowmaker.Connection",
      "id": "a024d728-cace-360b-bfb7-746828dc9fd1",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#F0C000",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
        "port": "OUT"
      },
      "target": {
        "node": "59d4f3e1-e84c-5ccb-b6b0-228ff41f2261",
        "port": "IN"
      }
    }, {
      "type": "flowmaker.Connection",
      "id": "e77f2561-514d-3399-12a4-9a8703591ecf",
      "alpha": 1,
      "userData": {
        "capacity": null
      },
      "cssClass": "flowmaker_Connection",
      "stroke": 3,
      "color": "#B9DD69",
      "outlineStroke": 1,
      "outlineColor": "#303030",
      "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
      "router": "draw2d.layout.connection.SplineConnectionRouter",
      "radius": 5,
      "source": {
        "node": "c3f3c880-af22-01c9-9cfe-eebd0c6221b3",
        "port": "output1"
      },
      "target": {
        "node": "97eff5e0-743c-f34a-d572-c207b12afd03",
        "port": "OUT"
      }
    }]
  );
});