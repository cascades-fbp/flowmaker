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

    for (var i = 0; i < inNum; i++) {
      this.createPort("input");
    };
    for (var i = 0; i < outNum; i++) {
      this.createPort("output");
    };
    this.configurePorts();

    // Icon
    //this.add(new draw2d.shape.icon.Acw(), new draw2d.layout.locator.CenterLocator());

    // labels setup
    this.nameLabel = new draw2d.shape.basic.Label({
      text: this.userData.name,
      bold: true,
      stroke: 0
    });
    this.componentLabel = new draw2d.shape.basic.Label({
      text: this.userData.component,
      stroke: 0
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
            $(document).trigger("editComponent", [this.getId()]);
            break;
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
          name: "Delete"
        }
      }
    });
  },

  configurePorts: function() {
    var port, ports, label;
    ports = this.getInputPorts();
    for (var i = 0; i < ports.getSize(); i++) {
      port = ports.get(i);
      label = new draw2d.shape.basic.Label({
        text: port.getName().toUpperCase(),
        stroke: 0
      });
      port.add(label, new draw2d.layout.locator.InputPortLocator());
    };
    ports = this.getOutputPorts();
    for (var i = 0; i < ports.getSize(); i++) {
      port = ports.get(i);
      label = new draw2d.shape.basic.Label({
        text: port.getName().toUpperCase(),
        stroke: 0
      });
      port.add(label, new draw2d.layout.locator.OutputPortLocator());
    };
  },

  setName: function(name) {
    this.userData.name = name;
    this.nameLabel.setText(this.userData.name);
  },

  getName: function() {
    return this.userData.name;
  },

  setComponent: function(component) {
    this.userData.component = component;
    this.componentLabel.setText(this.userData.component);
  },

  getComponent: function() {
    return this.userData.component;
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

    this.configurePorts();

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