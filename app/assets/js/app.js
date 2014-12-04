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

    var inputPorts = figure.getInputPorts()
    var diff = inputPorts.getSize() - form.find('#node-inputs').val();
    console.log("INPUT DIFF = ", diff);
    if (diff < 0) {
      for (var i = 0; i < Math.abs(diff); i++) {
        console.log("Adding IN#", i);
        figure.createPort("input");
      };
    } else if (diff > 0) {
      for (var i = inputPorts.getSize(); i >= diff; i--) {
        console.log("Deleting IN#", i-1);
        figure.removePort(inputPorts.get(i-1))
      };
    }

    outputPorts = figure.getOutputPorts()
    diff = outputPorts.getSize() - form.find('#node-outputs').val()
    console.log("OUTPUT DIFF = ", diff);
    if (diff < 0) {
      for (var i = 0; i < Math.abs(diff); i++) {
        console.log("Adding OUT#", i);
        figure.createPort("output");
      };
    } else if (diff > 0) {
      for (var i = outputPorts.getSize(); i >= diff; i--) {
        console.log("Deleting OUT#", i-1);
        figure.removePort(outputPorts.get(i-1))
      };
    }

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
  /*
  $(window).resize(function() {
    console.log(this);
  });
  */

  app.load([{
    "type": "flowmaker.IIP",
    "id": "f86736d5-9cb3-0685-ceb5-24b8b665d48a",
    "x": 190,
    "y": 110,
    "width": 80,
    "height": 21.421875,
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
    "text": "some info",
    "outlineStroke": 0,
    "outlineColor": "none",
    "fontSize": 12,
    "fontColor": "#080808",
    "fontFamily": null
  }, {
    "type": "flowmaker.Component",
    "id": "32bf007c-43b2-a450-f7ef-6be5c2d77c20",
    "x": 490,
    "y": 220,
    "width": 90,
    "height": 71.5,
    "alpha": 1,
    "userData": {
      "name": "readfile",
      "component": "reader"
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
    }, {
      "name": "output1",
      "port": "draw2d.OutputPort",
      "locator": "draw2d.layout.locator.OutputPortLocator"
    }],
    "bgColor": "#EFEFEF",
    "color": "#1B1B1B",
    "stroke": 1,
    "radius": 0
  }, {
    "type": "flowmaker.Component",
    "id": "3fb90ed2-cb10-654d-5615-a11f82b4e094",
    "x": 690,
    "y": 110,
    "width": 90,
    "height": 65,
    "alpha": 1,
    "userData": {
      "name": "error",
      "component": "console"
    },
    "cssClass": "flowmaker_Component",
    "ports": [{
      "name": "input0",
      "port": "draw2d.InputPort",
      "locator": "draw2d.layout.locator.InputPortLocator"
    }],
    "bgColor": "#F3546A",
    "color": "#1B1B1B",
    "stroke": 1,
    "radius": 0
  }, {
    "type": "flowmaker.ExportedOutput",
    "id": "f7b65c94-01d2-b2e1-049b-52b8d91d15f8",
    "x": 700,
    "y": 380,
    "width": 50,
    "height": 50,
    "alpha": 1,
    "userData": {
      "name": "LINES"
    },
    "cssClass": "flowmaker_ExportedOutput",
    "ports": [{
      "name": "LINES",
      "port": "draw2d.InputPort",
      "locator": "draw2d.layout.locator.InputPortLocator"
    }],
    "bgColor": "#333333",
    "color": "#1B1B1B",
    "stroke": 0,
    "radius": 0
  }, {
    "type": "flowmaker.Component",
    "id": "19215c0d-770f-2c4d-ad0e-9d428c4f2ba7",
    "x": 330,
    "y": 340,
    "width": 90,
    "height": 71.5,
    "alpha": 1,
    "userData": {
      "name": "pass",
      "component": "core/pass"
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
    }, {
      "name": "output1",
      "port": "draw2d.OutputPort",
      "locator": "draw2d.layout.locator.OutputPortLocator"
    }],
    "bgColor": "#00A8F0",
    "color": "#1B1B1B",
    "stroke": 1,
    "radius": 0
  }, {
    "type": "flowmaker.ExportedInput",
    "id": "97ab2adb-f770-13f9-ab84-ae23857dc87a",
    "x": 150,
    "y": 290,
    "width": 50,
    "height": 50,
    "alpha": 1,
    "userData": {
      "name": "DEBUG"
    },
    "cssClass": "flowmaker_ExportedInput",
    "ports": [{
      "name": "DEBUG",
      "port": "draw2d.OutputPort",
      "locator": "draw2d.layout.locator.OutputPortLocator"
    }],
    "bgColor": "#333333",
    "color": "#1B1B1B",
    "stroke": 0,
    "radius": 0
  }, {
    "type": "flowmaker.Component",
    "id": "724e3794-3af3-ca92-4fc1-f79c2c587a62",
    "x": 350,
    "y": 110,
    "width": 90,
    "height": 65,
    "alpha": 1,
    "userData": {
      "name": "Pass",
      "component": "core/pass"
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
    "type": "flowmaker.Connection",
    "id": "229a586d-e044-0199-d755-f07118d6e4f1",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#00A8F0",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "f86736d5-9cb3-0685-ceb5-24b8b665d48a",
      "port": "output0"
    },
    "target": {
      "node": "724e3794-3af3-ca92-4fc1-f79c2c587a62",
      "port": "input0"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "79b20766-c273-fd8f-19c8-f0f03dc1ee2e",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#F3546A",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "32bf007c-43b2-a450-f7ef-6be5c2d77c20",
      "port": "output0"
    },
    "target": {
      "node": "3fb90ed2-cb10-654d-5615-a11f82b4e094",
      "port": "input0"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "1e9e4052-d505-fccc-121a-e849464738d5",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#B9DD69",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "32bf007c-43b2-a450-f7ef-6be5c2d77c20",
      "port": "output1"
    },
    "target": {
      "node": "f7b65c94-01d2-b2e1-049b-52b8d91d15f8",
      "port": "LINES"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "aee8f748-f79b-f440-aa86-d5676528b39d",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#00A8F0",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "19215c0d-770f-2c4d-ad0e-9d428c4f2ba7",
      "port": "output1"
    },
    "target": {
      "node": "f7b65c94-01d2-b2e1-049b-52b8d91d15f8",
      "port": "LINES"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "4484c9a2-9c2b-3287-a6db-9525971c81d3",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#B9DD69",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "19215c0d-770f-2c4d-ad0e-9d428c4f2ba7",
      "port": "output0"
    },
    "target": {
      "node": "32bf007c-43b2-a450-f7ef-6be5c2d77c20",
      "port": "input0"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "d9c67738-6a87-3858-8d21-2da7090db958",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#00A8F0",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "97ab2adb-f770-13f9-ab84-ae23857dc87a",
      "port": "DEBUG"
    },
    "target": {
      "node": "19215c0d-770f-2c4d-ad0e-9d428c4f2ba7",
      "port": "input0"
    }
  }, {
    "type": "flowmaker.Connection",
    "id": "9eb15086-d905-b458-f9da-53e2bc4c842f",
    "alpha": 1,
    "userData": {},
    "cssClass": "flowmaker_Connection",
    "stroke": 3,
    "color": "#00A8F0",
    "outlineStroke": 1,
    "outlineColor": "#303030",
    "policy": "draw2d.policy.line.LineSelectionFeedbackPolicy",
    "router": "draw2d.layout.connection.SplineConnectionRouter",
    "radius": 5,
    "source": {
      "node": "724e3794-3af3-ca92-4fc1-f79c2c587a62",
      "port": "output0"
    },
    "target": {
      "node": "32bf007c-43b2-a450-f7ef-6be5c2d77c20",
      "port": "input0"
    }
  }]);
});