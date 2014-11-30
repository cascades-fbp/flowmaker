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

    this.on('scroll', function(){
        console.log(arguments);
    });
  },

  scrollTopLeft: function() {
    this.scrollArea.scrollTop(0);
    this.scrollArea.scrollLeft(0);
  }

});