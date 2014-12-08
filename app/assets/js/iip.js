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
            this.editContent();
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

  editContent: function() {
    var modal = $('#singleFieldModal');

    modal.find('.modal-title').text("Edit IIP");
    modal.find('.btn-primary').text("Save changes");
    modal.find('.control-label').text("Change payload of the IIP");
    modal.find('#single-content').val(this.getText());

    modal.find('.btn-primary').off('click');
    modal.find('.btn-primary').on('click', $.proxy(function() {
      if (this.handleEditContent()) {
        modal.modal('hide');
      }
    }, this));

    modal.modal('show');
    modal.find('#single-content').focus();
  },

  handleEditContent: function() {
    var form = $('#singleFieldModal');

    // Validate input
    if (form.find('#single-content').val() == '') {
      form.find('.form-group:first').addClass('has-error');
      form.find('#single-content').focus();
      return false;
    } else {
      form.find('.form-group:first').removeClass('has-error');
    }

    this.setText(form.find('#single-content').val());

    return true;
  }

});