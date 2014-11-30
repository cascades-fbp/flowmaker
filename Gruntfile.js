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
          './bower_components/jquery/dist/jquery.js',
          './bower_components/jquery-ui/jquery-ui.js',
          './bower_components/jsPlumb/dist/js/dom.jsPlumb-1.7.2.js',
          './app/assets/js/frontend.js'
        ],
        dest: './public/assets/js/frontend.js',
      },
      css_fronend: {
        src: [
          './bower_components/jsPlumb/dist/css/jsplumb.css',
          './app/assets/css/frontend.css'
        ],
        dest: './public/assets/css/frontend.css',
      }
      //dist: {
      //  src: ['lib/<%= pkg.name %>.js'],
      //  dest: 'dist/<%= pkg.name %>.js'
      //}
    },
    /*
    copy: {
      fonts: {
        expand: true,
        cwd: './bower_components/jsPlumb/dist/css',
        src: 'OpenSans*.*',
        dest: './public/assets/css/',
        flatten: true,
        filter: 'isFile',
      }
    },
    */
    /*
    less: {
      development: {
        options: {
          compress: true, // minifying the result
        },
        files: {
          //compiling frontend.less into frontend.css
          "./public/assets/stylesheets/frontend.css": "./app/assets/stylesheets/frontend.less"
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: false // Use if you want the names of your functions and variables unchanged
      },
      frontend: {
        files: {
          './public/assets/javascript/frontend.js': './public/assets/javascript/frontend.js',
        }
      }
      //dist: {
      //  src: '<%= concat.dist.dest %>',
      //  dest: 'dist/<%= pkg.name %>.min.js'
      //}
    },
    */
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
      /*
      less: {
        files: ['./app/assets/stylesheets/frontend.css'],  //watched files
        //tasks: ['less'],                          //tasks to run
        options: {
          livereload: true                        //reloads the browser
        }
      },
      */
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('build', ['jshint', 'concat']);
  //grunt.registerTask('default', ['build', 'connect:public', 'watch']);
  grunt.registerTask('default', ['connect:root']);
};
