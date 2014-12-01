flowmaker.View = draw2d.Canvas.extend({

  init: function(id) {
    this._super(id);

    // Set grid edit policy
    var policy = new draw2d.policy.canvas.SnapToGridEditPolicy();
    policy.setGrid(10);
    policy.setGridColor('#efefef');
    this.installEditPolicy(policy);

    // Set scrolling area
    this.setScrollArea($("#" + id));

    this.on('scroll', function() {
      console.log(arguments);
    });
  },

  previewPNG: function(callback) {
    // convert the canvas into a PNG image source string
    var xCoords = [];
    var yCoords = [];
    var figures = this.getFigures();

    if (figures.getSize() == null || figures.getSize() == 0) {
      callback(null);
      return;
    }

    figures.each(function(i, f) {
      var b = f.getBoundingBox();
      xCoords.push(b.x, b.x + b.w);
      yCoords.push(b.y, b.y + b.h);
    });
    var minX = Math.min.apply(Math, xCoords) - 20;
    var minY = Math.min.apply(Math, yCoords) - 20;
    var width = Math.max.apply(Math, xCoords) - minX + 20;
    var height = Math.max.apply(Math, yCoords) - minY + 20;

    var writer = new draw2d.io.png.Writer();
    writer.marshal(this, function(png){
      callback(png, width, height);
    }, new draw2d.geo.Rectangle(minX, minY, width, height));
  }

});