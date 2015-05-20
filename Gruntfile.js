'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

        pathConfig: {
            app: 'app',
            dist: 'dist',
            build: 'build',
            venders: 'venders'
        },

        pkg: grunt.file.readJSON('package.json'),

        watch: {

            all: {
                files: [
                    'src/**/*.js',
                    'src/app/templates/**/*.hbs',
                    'src/app/styles/scss/**/*.scss'
                ],
                tasks: ['build']
            }

        },

        browserify: {

            build: {
                files: {
                    'build/scripts/application.js': 'src/app/application.js'
                }
            }

        },

        emberTemplates: {
            options: {
                templateName: function (tName) {
                    return tName.replace('src/app/templates/', '');
                },
                handlebarsPath: 'venders/handlebars/handlebars.js',
                templateCompilerPath: 'venders/ember/ember-template-compiler.js'
            },

            build: {
                files: {
                    'build/scripts/templates.js': 'src/app/templates/**/*.hbs'
                }
            }

        },

        compass: {

            options: {
                sassDir: 'src/app/styles/scss'
            },

            build: {
                options: {
                    cssDir: '<%= pathConfig.build %>/styles'
                }
            }

        },

        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    'dist/application.min.js': [
                        'venders/jquery/dist/jquery.min.js',
                        'venders/jquery-ui-1.11.3.custom/jquery-ui.js',
                        'venders/ember/ember.min.js',
                        '/home/sheep/Code/Project/web-sfm/build/scripts/templates.js',
                        '/home/sheep/Code/Project/web-sfm/build/scripts/application.js'
                    ]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-ember-templates');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', [
        'browserify:build',
        'emberTemplates:build',
        'compass:build'
    ]);

    grunt.registerTask('dist', [
        'build',
        'uglify:dist'
    ]);

};

