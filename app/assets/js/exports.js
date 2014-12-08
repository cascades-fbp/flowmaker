flowmaker.ExportedInput = draw2d.shape.icon.Import.extend({

  NAME: "flowmaker.ExportedInput",

  init: function(name) {
    this._super();

    this.userData = {}

    this.createPort("output");

    this.label = new draw2d.shape.basic.Label({
      bold: true,
      stroke: 0
    });
    this.add(this.label, new draw2d.layout.locator.BottomLocator());

    this.setName(name);
  },

  onContextMenu: function(x, y) {
    this.select();
    $.contextMenu({
      selector: 'body',
      events: {
        hide: function() {
          $.contextMenu('destroy');
        }
      },
      callback: $.proxy(function(key, options) {
        switch (key) {
          case "edit":
            this.editPortName();
            break;
          case "delete":
            var cmd = new draw2d.command.CommandDelete(this);
            this.getCanvas().getCommandStack().execute(cmd);
          default:
            break;
        }

      }, this),
      x: x,
      y: y,
      items: {
        "edit": {
          name: "Edit",
        },
        "sep1": "---------",
        "delete": {
          name: "Delete",
        }
      }
    });
  },

  setName: function(name) {
    this.userData.name = name;

    var port = this.getOutputPort(0)
    port.setName(this.userData.name);

    this.label.setText(this.userData.name);
  },

  editPortName: function() {
    var port = this.getOutputPorts().get(0);
    var name = prompt("Change exported port name:", port.getName());
    if (name == null || name == "") {
      return;
    }
    this.setName(name);
  },

  /**
   * Read all attributes from the serialized properties and transfer them into the shape.
   */
  setPersistentAttributes: function(memento) {
    this._super(memento);
    this.setName(this.userData.name);
   }

});


flowmaker.ExportedOutput = draw2d.shape.icon.Export.extend({

  NAME: "flowmaker.ExportedOutput",

  init: function(name) {
    this._super();

    this.userData = {}

    this.createPort("input");

    this.label = new draw2d.shape.basic.Label({
      bold: true,
      stroke: 0
    });
    this.add(this.label, new draw2d.layout.locator.BottomLocator());

    this.setName(name);
  },

  /**
   * Called by the framework if the figure should show the contextmenu.
   * The strategy to show the context menu depends on the plattform.
   * Either loooong press or right click with the mouse.
   */
  onContextMenu: function(x, y) {
    this.select();
    $.contextMenu({
      selector: 'body',
      events: {
        hide: function() {
          $.contextMenu('destroy');
        }
      },
      callback: $.proxy(function(key, options) {
        switch (key) {
          case "edit":
            this.editPortName();
            break;
          case "delete":
            var cmd = new draw2d.command.CommandDelete(this);
            this.getCanvas().getCommandStack().execute(cmd);
          default:
            break;
        }

      }, this),
      x: x,
      y: y,
      items: {
        "edit": {
          name: "Edit",
        },
        "sep1": "---------",
        "delete": {
          name: "Delete",
        }
      }
    });
  },

  setName: function(name) {
    this.userData.name = name;

    var port = this.getInputPort(0)
    port.setName(this.userData.name);

    this.label.setText(this.userData.name);
  },

  editPortName: function() {
    var port = this.getInputPorts().get(0);
    var name = prompt("Change exported port name:", port.getName());
    if (name == null || name == "") {
      return;
    }
    this.setName(name);
  },

  /**
   * Read all attributes from the serialized properties and transfer them into the shape.
   */
  setPersistentAttributes: function(memento) {
    this._super(memento);
    this.setName(this.userData.name);
  }


});