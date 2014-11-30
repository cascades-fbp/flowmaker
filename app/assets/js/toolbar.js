flowmaker.Toolbar = Class.extend({

  init: function(app, view) {
    this.view = view;
    this.app = app;

    var self = this;

    $('#toolbar-new').on('click', function(){
      self.app.newFlow();
    });

    $('#toolbar-open').on('click', function(){
      self.app.openFlow();
    });

    $('#toolbar-save').on('click', function(){
      self.app.saveFlow();
    });

    $('#toolbar-zoomin').on('click', function(){
      self.view.setZoom(self.view.getZoom()*0.7, true);
      self.app.layout();
    });

    $('#toolbar-zoomout').on('click', function(){
      self.view.setZoom(self.view.getZoom()*1.3, true);
      self.app.layout();
    });

    $('#toolbar-zoomreset').on('click', function(){
      self.view.setZoom(1.0, true);
      self.app.layout();
    });

    $('#toolbar-upload').on('click', function(){
      var localStorage = new draw2d.storage.LocalFileStorage();
      localStorage.promptForFilename(function(){
        console.log("success()");
        console.log(arguments);
      }, function(){
        console.log("abort()");
        console.log(arguments);
      });
    });

  }

});