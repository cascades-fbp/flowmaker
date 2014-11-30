flowmaker.Legend = draw2d.shape.note.PostIt.extend({

  NAME: "flowmaker.Legend",

  init: function(content) {
    this._super({text: content});
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