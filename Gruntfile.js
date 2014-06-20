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

        neuter :{

            options: {
                template: '{%= src %}'
            },

            'build/scripts/application.js':'app/scripts/application.js',

            'build/scripts/worker.js':'app/scripts/worker.js'

        },

        concat_sourcemap: {

            unittest: {
                files: {
                    'build/scripts/sfmunittest.js': [
                        '<%= pathConfig.venders %>/numericjs/src/numeric.js',
                        '<%= pathConfig.venders %>/numericjs/src/svd.js',
                        'app/scripts/SFM/**/*.js',
                        'unittest/headers/SfmUnittestHeader.js'
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
    grunt.loadNpmTasks('grunt-neuter');

    grunt.registerTask('build', [
        'neuter',
        'concat_sourcemap:unittest',
        'emberTemplates:build',
        'compass:build',
        'copy:build'
    ]);

    grunt.registerTask('dist', ['build', 'uglify:dist']);

};

