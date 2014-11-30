/**
 * Custom connection
 */
flowmaker.Connection = draw2d.Connection.extend({

  NAME: "flowmaker.Connection",

  init: function(attr) {
    this._super(attr);

    this.setRouter(new draw2d.layout.connection.SplineConnectionRouter());
    this.setOutlineStroke(1);
    this.setOutlineColor("#303030");
    this.setStroke(3);
    this.setRadius(5);
    this.setColor('#00A8F0');
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
        "red": {
          name: "Red",
          icon: "edit"
        },
        "green": {
          name: "Green",
          icon: "cut"
        },
        "blue": {
          name: "Blue",
          icon: "copy"
        },
        "sep1": "---------",
        "delete": {
          name: "Delete",
          icon: "delete"
        }
      }
    });
  }

});

/*
 * Return a special kind of connection
 */
draw2d.Connection.createConnection = function(sourcePort, targetPort) {
  return new flowmaker.Connection();
};
