flowmaker.Component = draw2d.shape.basic.Rectangle.extend({

  NAME: "flowmaker.Component",
  DEFAULT_BACKGROUND_COLOR: "#efefef",

  init: function(name, component, inNum, outNum) {
    this._super({
      "resizable": false,
      "bgColor": this.DEFAULT_BACKGROUND_COLOR
    });

    var maxNum = Math.max(inNum, outNum);

    this.setWidth(90);
    this.setHeight(65 * (maxNum > 1 ? maxNum * 0.55 : 1));

    this.userData = {
      'name': name,
      'component': component
    };

    var port;
    for (var i = 0; i < inNum; i++) {
      port = this.createPort("input");
      //port.add(new draw2d.shape.basic.Label({text:"IN"}), new draw2d.layout.locator.InputPortLocator())
      //this.node.addPort(new draw2d.InputPort(), new draw2d.layout.locator.LeftLocator());
    };
    for (var i = 0; i < outNum; i++) {
      port = this.createPort("output");
      //port.add(new draw2d.shape.basic.Label({text:"OUT"}), new draw2d.layout.locator.OutputPortLocator())
      //this.node.addPort(new draw2d.OutputPort(), new draw2d.layout.locator.RightLocator());
    };

    // Icon
    //this.add(new draw2d.shape.icon.Acw(), new draw2d.layout.locator.CenterLocator());

    // labels setup
    this.nameLabel = new draw2d.shape.basic.Label({
      text: this.userData.name,
      bold: true
    });
    this.componentLabel = new draw2d.shape.basic.Label({
      text: this.userData.component
    });
    this.add(this.nameLabel, new draw2d.layout.locator.TopLocator());
    this.add(this.componentLabel, new draw2d.layout.locator.BottomLocator());

    // policies
    this.installEditPolicy(new draw2d.policy.figure.SlimSelectionFeedbackPolicy());

  },

  /**
   * Called by the framework if the figure should show the contextmenu.
   * The strategy to show the context menu depends on the plattform.
   * Either loooong press or right click with the mouse.
   */
  onContextMenu: function(x, y) {
    console.log("flowmaker.Component.onContextMenu()");
    this.select();
    $.contextMenu({
      selector: 'body',
      events: {
        hide: function() {
          $.contextMenu('destroy');
        }
      },
      callback: $.proxy(function(key, options) {
        console.log(key, options);
        switch (key) {
          case "bg-style-red":
            this.setBackgroundColor('#f3546a');
            break;
          case "bg-style-green":
            this.setBackgroundColor('#b9dd69');
            break;
          case "bg-style-blue":
            this.setBackgroundColor('#00A8F0');
            break;
          case "bg-style-reset":
            this.setBackgroundColor(this.DEFAULT_BACKGROUND_COLOR);
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
        "bg-style": {
          name: "Background",
          items: {
            "bg-style-red": {
              name: "Red"
            },
            "bg-style-green": {
              name: "Green"
            },
            "bg-style-blue": {
              name: "Blue"
            },
            "bg-style-sep": "---------",
            "bg-style-reset": {
              name: "Reset"
            }
          }
        },
        "sep2": "---------",
        "delete": {
          name: "Delete",
          icon: "delete"
        }
      }
    });
  },

  /**
   * Return an objects with all important attributes for XML or JSON serialization
   */
  getPersistentAttributes: function() {
    var memento = this._super();

    // add all decorations to the memento
    //
    /*
    memento.labels = [];
    this.children.each(function(i, e) {
      memento.labels.push({
        id: e.figure.getId(),
        label: e.figure.getText(),
        locator: e.locator.NAME
      });
    });
    */

    return memento;
  },

  /**
   * Read all attributes from the serialized properties and transfer them into the shape.
   */
  setPersistentAttributes: function(memento) {
    this._super(memento);

    this.nameLabel.setText(this.userData.name);
    this.componentLabel.setText(this.userData.component);

    /*
    // remove all decorations created in the constructor of this element
    //
    this.resetChildren();

    // and restore all children of the JSON document instead.
    //
    $.each(memento.labels, $.proxy(function(i, e) {
      var label = new draw2d.shape.basic.Label({
        text: e.label
      });
      var locator = eval("new " + e.locator + "()");
      this.add(label, locator);
    }, this));
    */
  }

});