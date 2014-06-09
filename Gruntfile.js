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
                    'app/scripts/**/*.js',
                    'app/templates/**/*.hbs',
                    'app/styles/scss/**/*.scss'
                ],
                tasks: ['build']
            }

        },

        concat_sourcemap: {

            unittest: {
                files: {
                    'build/scripts/sfmunittest.js': [
                        '<%= pathConfig.venders %>/numericjs/src/numeric.js',
                        '<%= pathConfig.venders %>/numericjs/src/svd.js',
                        '<%= pathConfig.venders %>/underscore/underscore.js',
                        'app/scripts/SFM/**/*.js',
                        'unittest/headers/SfmUnittestHeader.js'
                    ]
                }
            },

            scripts: {
                files: {
                    'build/scripts/application.js': [
                        'app/scripts/SFM/**/*.js',
                        'app/scripts/ember/**/*.js'
                    ],

                    'build/scripts/sfm.js': 'app/scripts/SFM/**/*.js',

                    'build/scripts/worker.js': [
                        'venders/numericjs/src/numeric.js',
                        'venders/numericjs/src/svd.js',
                        'venders/underscore/underscore.js',
                        'app/scripts/threads/worker.js',
                        'app/scripts/SFM/**/*.js'
                    ]

                }
            },

            libs: {
                files: {
                    'build/scripts/libs.js': [
                        '<%= pathConfig.venders %>/jquery/dist/jquery.js',
                        '<%= pathConfig.venders %>/handlebars/handlebars.js',
                        '<%= pathConfig.venders %>/ember/ember.js',
                        '<%= pathConfig.venders %>/threejs/build/three.js',
                        '<%= pathConfig.venders %>/underscore/underscore.js',
                        '<%= pathConfig.venders %>/numericjs/src/numeric.js',
                        '<%= pathConfig.venders %>/numericjs/src/svd.js',
                        '<%= pathConfig.venders %>/vis/dist/vis.js'
                    ],

                    'build/scripts/baselibs.js': [
                        '<%= pathConfig.venders %>/numericjs/src/numeric.js',
                        '<%= pathConfig.venders %>/numericjs/src/svd.js',
                        '<%= pathConfig.venders %>/jquery/dist/jquery.js',
                        '<%= pathConfig.venders %>/underscore/underscore.js',
                        '<%= pathConfig.venders %>/threejs/build/three.js'
                    ],

                    'build/scripts/threadlibs.js': [
                        '<%= pathConfig.venders %>/numericjs/src/numeric.js',
                        '<%= pathConfig.venders %>/numericjs/src/svd.js',
                        '<%= pathConfig.venders %>/underscore/underscore.js',
                    ]

                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/main.js': [
                        '<%= pathConfig.build %>/application.js',
                        '<%= pathConfig.build %>/libs.js'
                    ]
                }
            }
        },

        emberTemplates: {
            options: {
                templateName: function (tName) {
                    return tName.replace('app/templates/', '');
                }
            },

            build: {
                files: {
                    'build/scripts/templates.js': 'app/templates/**/*.hbs'
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
                sassDir: 'app/styles/scss'
            },

            build: {
                options: {
                    cssDir: '<%= pathConfig.build %>/styles'
                }
            }

        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-ember-templates');

    grunt.registerTask('build', [
        'concat_sourcemap:scripts',
        'concat_sourcemap:libs',
        'concat_sourcemap:unittest',
        'emberTemplates:build',
        'compass:build',
        'copy:build'
    ]);

    grunt.registerTask('dist', ['build', 'uglify:dist']);

};

