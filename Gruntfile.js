/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        // define a string to put between each file in the concatenated output
        separator: ';',
        stripBanners: true
      },
      js_frontend: {
        src: [
          './vendors/draw2d_GPL_5/lib/jquery-1.10.2.min.js',
          './vendors/draw2d_GPL_5/lib/jquery.autoresize.js',
          './vendors/draw2d_GPL_5/lib/jquery-touch_punch.js',
          './vendors/draw2d_GPL_5/lib/jquery.contextmenu.js',
          './vendors/draw2d_GPL_5/lib/shifty.js',
          './vendors/draw2d_GPL_5/lib/raphael.js',
          './vendors/draw2d_GPL_5/lib/rgbcolor.js',
          './vendors/draw2d_GPL_5/lib/canvg.js',
          './vendors/draw2d_GPL_5/lib/Class.js',
          './vendors/draw2d_GPL_5/lib/json2.js',
          './vendors/draw2d_GPL_5/lib/pathfinding-browser.min.js',
          './vendors/draw2d_GPL_5/src/draw2d.js',
          './bower_components/jquery.browser/dist/jquery.browser.min.js',
          './bower_components/FileSaver.js/FileSaver.min.js',
          './bower_components/bootstrap/dist/js/bootstrap.min.js',
          './app/assets/js/app.js',
          './app/assets/js/view.js',
          './app/assets/js/toolbar.js',
          './app/assets/js/properties.js',
          './app/assets/js/connection.js',
          './app/assets/js/component.js',
          './app/assets/js/iip.js',
          './app/assets/js/exports.js',
          './app/assets/js/legend.js',
        ],
        dest: './public/assets/js/frontend.js',
      },
      css_fronend: {
        src: [
          './vendors/draw2d_GPL_5/css/contextmenu.css',
          './bower_components/bootstrap/dist/css/bootstrap.min.css',
          './app/assets/css/frontend.css'
        ],
        dest: './public/assets/css/frontend.css',
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: true // Use if you want the names of your functions and variables unchanged
      },
      frontend: {
        files: {
          './public/assets/js/frontend.js': './public/assets/js/frontend.js',
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    /*
    browserify: {
      dist: {
        files: {
          './public/assets/javascript/frontend.js': './public/assets/javascript/frontend.js',
        },
        options: {
          //transform: ['coffeeify']
        }
      }
    },
    */
    connect: {
      public: {
        options:{
          base: 'public',
          port: 9000,
          hostname: "0.0.0.0",
          // Prevents Grunt to close just after the task (starting the server) completes
          // This will be removed later as `watch` will take care of that
          keepalive: false,
          livereload: true
        }
      },
      root: {
        options:{
          port: 9000,
          hostname: "0.0.0.0",
          // Prevents Grunt to close just after the task (starting the server) completes
          // This will be removed later as `watch` will take care of that
          keepalive: true,
          livereload: false
        }
      },
    },
    /*
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js_frontend: {
        files: [
          //watched files
          './app/assets/js/frontend.js'
          ],
        tasks: ['concat:js_frontend'], //tasks to run
        options: {
          livereload: true //reloads the browser
        }
      },
      css_frontend: {
        files: [
          //watched files
          './app/assets/css/frontend.css'
          ],
        tasks: ['concat:css_frontend'], //tasks to run
        options: {
          livereload: true //reloads the browser
        }
      },
    },
    */
    nodewebkit: {
      options: {
        platforms: ['osx'],
        buildDir: './webkitbuilds',
      },
      src: ['./public/**/*']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Default task.
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
  //grunt.registerTask('default', ['build', 'connect:public', 'watch']);
  grunt.registerTask('default', ['connect:root']);
  // Build the desktop app
  grunt.registerTask('app', ['build', 'nodewebkit']);
};
