
// flowmaker.PropertyPane = Class.extend({

//   init: function(elementId, view) {
//     this.html = $("#" + elementId);
//     this.view = view;

//     // Databinding: helper attributes for the databinding
//     this.selectedFigure = null;
//     this.updateCallback = null;

//     view.on("select", $.proxy(this.onSelectionChanged, this));

//     console.log("PropertyPane.init(" + elementId + ", ...)");
//   },

//   /**
//    * @method
//    * Called if the selection in the canvas has been changed. You must register this
//    * on the canvas to receive this event.
//    *
//    * @param {draw2d.Figure} figure
//    */
//   onSelectionChanged: function(emitter, figure) {
//     console.log("PropertyPane.onSelectionChanged()")
//     // Databinding: deregister the old update listener
//     if (this.selectedFigure !== null && this.updateCallback !== null) {
//       this.selectedFigure.off(this.updateCallback);
//     }

//     this.selectedFigure = figure;

//     this.html.html("");
//     if (figure instanceof draw2d.shape.node.Node) {
//       this.showPropertiesOpAmp(figure);
//     }
//   },


//   /**
//    * @method
//    * Called if the selection in the canvas has been changed. You must register this
//    * on the canvas to receive this event.
//    *
//    * @param {draw2d.Figure} figure
//    */
//   showPropertiesOpAmp: function(figure) {
//     console.log("showPropertiesOpAmp()");
//     // Set some good defaults
//     // (better you create  new class and set the defaults in the init method)
//     var userData = figure.getUserData();
//     if (userData === null) {
//       figure.setUserData(userData = {
//         name: ""
//       });
//     }

//     console.log(">>>>");
//     console.log(figure.getUserData());

//     // simple x/y coordinate display
//     //
//     this.html.append(
//       '<div id="property_position_container" class="panel panel-default">' +
//       ' <div class="panel-heading " >' +
//       '     Position' +
//       '</div>' +
//       ' <div class="panel-body" id="position_panel">' +
//       '   <div class="form-group">' +
//       '       <div class="input-group" ></div> ' +
//       '       x <input id="property_position_x" type="text" class="form-control"/><br>' +
//       '       y <input id="property_position_y" type="text" class="form-control"/>' +
//       '   </div>' +
//       ' </div>' +
//       '</div>' +

//       '<div id="property_position_container" class="panel panel-default">' +
//       ' <div class="panel-heading " >' +
//       '     User Property' +
//       '</div>' +
//       ' <div class="panel-body" id="userdata_panel">' +
//       '   <div class="form-group">' +
//       '       <div class="input-group" ></div> ' +
//       '       Type <input id="property_name" type="text" class="form-control" value="' + figure.getUserData().name + '"/>' +
//       '   </div>' +
//       ' </div>' +
//       '</div>');

//     // Databinding: Figure --> UI
//     //
//     var isInUpdate = false;
//     figure.on("move", function() {
//       if (isInUpdate) return;
//       isInUpdate = true; // avoid recursion
//       $("#property_position_x").val(figure.getPosition().x);
//       $("#property_position_y").val(figure.getPosition().y);
//       isInUpdate = false;
//     });

//     // Databinding: UI --> Figure
//     //
//     $("#position_panel input").on("change", function() {
//       // with undo/redo support
//       var cmd = new draw2d.command.CommandMove(figure);
//       cmd.setPosition(parseInt($("#property_position_x").val()), parseInt($("#property_position_y").val()));
//       figure.getCanvas().getCommandStack().execute(cmd);
//     });
//     $("#property_name").on("change", function() {
//       figure.getUserData().name = $("#property_name").val();
//     });

//   }
// });