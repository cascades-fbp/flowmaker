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

    this.setCapacity(null);
  },

  /**
   * Called by the framework if the figure should show the contextmenu.
   * The strategy to show the context menu depends on the plattform.
   * Either loooong press or right click with the mouse.
   */
  onContextMenu: function(x, y) {
    console.log("flowmaker.Connection.onContextMenu()");
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
          case "capacity":
            var editor = new draw2d.ui.LabelEditor({
              onCommit: $.proxy(function(value) {
                this.setCapacity(value);
              }, this),
              onCancel: function() {}
            });
            editor.start(this.label);
            break;
          case "capacity-reset":
            this.setCapacity(null);
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
        "red": {
          name: "Red",
        },
        "green": {
          name: "Green",
        },
        "blue": {
          name: "Blue",
        },
        "sep1": "---------",
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
  }

});

/*
 * Return a special kind of connection
 */
draw2d.Connection.createConnection = function(sourcePort, targetPort) {
  return new flowmaker.Connection();
};