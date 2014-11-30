flowmaker.IIP = draw2d.shape.basic.Text.extend({

  NAME: "flowmaker.IIP",
  DEFAULT_COLOR : new draw2d.util.Color("#ffffff"),

  init: function(content) {
    this._super({text: content});
    this.createPort("output");
    //this.installEditPolicy(new draw2d.policy.figure.SlimSelectionFeedbackPolicy());
  },

  onContextMenu: function(x, y) {
    console.log("flowmaker.IIP.onContextMenu()");
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
          icon: "delete"
        }
      }
    });
  }

});