/**
 * Custom connection
 */
flowmaker.Connection = draw2d.Connection.extend({

  NAME: "flowmaker.Connection",

  init: function(attr) {
    this._super(attr);

    this.userData = {}

    this.setRouter(new draw2d.layout.connection.SplineConnectionRouter());
    this.setOutlineStroke(1);
    this.setOutlineColor("#303030");
    this.setStroke(3);
    this.setRadius(5);
    this.setColor('#00A8F0');

    this.label = new draw2d.shape.basic.Label({
      stroke: 1,
      bgColor: '#ffffff'
    });
    this.label.setAlpha(0);
    this.add(this.label, new draw2d.layout.locator.ManhattanMidpointLocator());
    //this.add(this.label, new draw2d.layout.locator.ParallelMidpointLocator());

    this.labelEditor = new draw2d.ui.LabelEditor({
      text: "Set connection capacity integer value",
      onCommit: $.proxy(function(value) {
        this.setCapacity(value);
      }, this),
      onCancel: function() {}
    });
    this.label.installEditor(this.labelEditor);

    this.setCapacity(null);
  },

  /**
   * Called by the framework if the figure should show the contextmenu.
   * The strategy to show the context menu depends on the plattform.
   * Either loooong press or right click with the mouse.
   */
  onContextMenu: function(x, y) {
    this.select();

    var self = this;

    $.contextMenu({
      selector: 'body',
      events: {
        hide: function() {
          $.contextMenu('destroy');
        }
      },
      callback: $.proxy(function(key, options) {
        switch (key) {
          case "capacity":
            this.labelEditor.start(this.label);
            break;
          case "capacity-reset":
            this.setCapacity(null);
            break;
          case "edit-up-port":
            this.editUpstreamPort();
            break;
          case "edit-down-port":
          this.editDownstreamPort();
            break;
          case "red":
            this.setColor('#f3546a');
            break;
          case "green":
            this.setColor('#b9dd69');
            break;
          case "blue":
            this.setColor('#00A8F0');
            break;
          case "yellow":
            this.setColor('#f0c000');
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
        "capacity": {
          name: "Set capacity"
        },
        "capacity-reset": {
          name: "Reset capacity"
        },
        "sep": "---------",
        "edit-up-port": {
          name: "Edit upstream port",
          disabled: function() {
            return self.getSource().getParent().NAME != "flowmaker.Component";
          }
        },
        "edit-down-port": {
          name: "Edit downstream port",
          disabled: function() {
            return self.getTarget().getParent().NAME != "flowmaker.Component";
          }
        },
        "sep1": "---------",
        "red": {
          name: "Red",
        },
        "green": {
          name: "Green",
        },
        "blue": {
          name: "Blue",
        },
        "yellow": {
          name: "Yellow",
        },
        "sep2": "---------",
        "delete": {
          name: "Delete",
        }
      }
    });
  },

  setCapacity: function(capacity) {
    if (capacity == undefined) {
      capacity = null
    }
    if (capacity != null && capacity < 0) {
      capacity = 0;
    }
    this.userData.capacity = capacity;
    if (this.userData.capacity != null) {
      this.label.setText(capacity);
      this.label.setAlpha(1);
    } else {
      this.label.setAlpha(0);
    }
  },

  editUpstreamPort: function() {
    var port = this.getSource();
    var name = prompt("Change upstream port name:", port.getName());
    if (name == null || name == "") {
      return;
    }
    port.setName(name);
    var label = port.getChildren().get(0);
    label.setText(name);
  },

  editDownstreamPort: function() {
    var port = this.getTarget();
    var name = prompt("Change downstream port name:", port.getName());
    if (name == null || name == "") {
      return;
    }
    port.setName(name);
    var label = port.getChildren().get(0);
    label.setText(name);
  },

  setPersistentAttributes: function(memento) {
    this._super(memento);
    this.setCapacity(this.userData.capacity);
  }

});

/*
 * Return a special kind of connection
 */
draw2d.Connection.createConnection = function(sourcePort, targetPort) {
  return new flowmaker.Connection();
};