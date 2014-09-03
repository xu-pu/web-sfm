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
                    'src/templates/**/*.hbs',
                    'src/styles/scss/**/*.scss'
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

        neuter :{

            options: {
                template: '{%= src %}'
            },

            'build/scripts/application.js':'app/scripts/application.js',

            'build/scripts/worker.js':'app/scripts/worker.js',

            'build/scripts/sfm.js':'app/scripts/sfm.js'

        },

        emberTemplates: {
            options: {
                templateName: function (tName) {
                    return tName.replace('src/templates/', '');
                }
            },

            build: {
                files: {
                    'build/scripts/templates.js': 'src/templates/**/*.hbs'
                }
            }

        },

        copy: {
            build: {
                files: {
                    'build/index.html': 'app/index.build.html'
                }
            }
        },

        compass: {

            options: {
                sassDir: 'src/styles/scss'
            },

            build: {
                options: {
                    cssDir: '<%= pathConfig.build %>/styles'
                }
            }

        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-ember-templates');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('build', [
        'browserify:build',
        'emberTemplates:build',
        'compass:build',
        'copy:build'
    ]);

//    grunt.registerTask('dist', ['build', 'uglify:dist']);

};

