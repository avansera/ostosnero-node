'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// elapsed time of grunt operation
	require('time-grunt')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

	var secret = grunt.file.readJSON('secret.json'),
		privateKey = secret.keyDir;

	 grunt.log.write(secret.host);


    try {
        yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
    } catch (e) {}

    grunt.initConfig({
        yeoman: yeomanConfig,
		secret: secret,

        watch: {

            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
				// set port to avoid interfering with eclipse
                port: 8888,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js'
            ]
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/components',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '.tmp/scripts/{,*/}*.js',
                        '<%= yeoman.app %>/scripts/{,*/}*.js'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/app.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            },
			minify: {
				expand: true,
				cwd: '<%= yeoman.dist %>/styles/',
				src: ['*.css'],
				dest: '<%= yeoman.dist %>/styles/',
				ext: '.css'
			}
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                     // https://github.com/yeoman/grunt-usemin/issues/44
                     //collapseWhitespace: true,
                     collapseBooleanAttributes: true,
                     removeAttributeQuotes: true,
                     removeRedundantAttributes: true,
                     useShortDoctype: true,
                     removeEmptyAttributes: true,
                     removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.html', 'views/*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>/scripts',
                    src: '*.js',
                    dest: '<%= yeoman.dist %>/scripts'
                }]
            }
        },
        /*uglify: {
         dist: {
         files: {
         '<%= yeoman.dist %>/scripts/scripts.js': ['<%= yeoman.dist %>/scripts/scripts.js'],
         }
         }
         },*/
        uglify: {
            build: {
                files: [{
                    expand: true,
                    src: '*.js',
                    dest: './',
                    cwd: '<%= yeoman.dist %>/scripts'
                }]
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '!<%= yeoman.dist %>/images/mikko.jpg',
                        '!<%= yeoman.dist %>/images/avatar-placeholder.png',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/**/*',
                        'styles/fonts/*',
                        'font/*'
                    ]
                }]
            },
			nprogress: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>/bower_components/nprogress',
					dest: '<%= yeoman.dist %>/styles',
					src: [
						'nprogress.css'
					]
				}]
			}
        },
        removelogging: {
            dist: {
				expand: true,
                cwd: '<%= yeoman.dist %>',
                dest: '<%= yeoman.dist %>',
                src: ['scripts/*.app.js'],

                options: {
					namespace: '[^window.]console'
                }
            }
        },
		sass: {
			dist: {
				files: {
					'<%= yeoman.dist %>/styles/app.css': '<%= yeoman.app %>/styles/app.scss'
				}
			}
		},
		manifest: {
			generate: {
				options: {
					basePath: '<%= yeoman.dist %>',
					cache: ["index.html"],
					network: ["*"],
					timestamp: true,
					hash: true
				},
				src: ['**/*.html', '**/*.js', '**/*.css', 'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'],
				dest: "<%= yeoman.dist %>/on.appcache"
			}
		},
		sftp: {
			apidemo: {
				files: {
					"./": "../api/**"
				},
				options: {
					path: '/home/vivaldi/demo.ostosnero.fi/api/',
					srcBasePath: "../api/",
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					createDirectories: true
				}
			},
			demo: {
				files: {
					"./": "dist/**"
				},
				options: {
					path: '/home/vivaldi/demo.ostosnero.fi/ng/',
					srcBasePath: "dist/",
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					createDirectories: true
				}
			},
			production: {
				files: {
					"./": "dist/**"
				},
				options: {
					path: '/home/vivaldi/ostosnero.fi/mobile/',
					srcBasePath: "dist/",
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					createDirectories: true
				}
			},
			martat: {
				files: {
					"./": "dist/**"
				},
				options: {
					path: '/home/vivaldi/demo.ostosnero.fi/martat/',
					srcBasePath: "dist/",
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					createDirectories: true
				}
			},
			muntalous: {
				files: {
					"./": "dist/**"
				},
				options: {
					path: '/home/vivaldi/demo.ostosnero.fi/muntalous/',
					srcBasePath: "dist/",
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					createDirectories: true
				}
			}
		},
		sshexec: {
			cleandemo: {
				command: 'cd ~/demo.ostosnero.fi/ng && rm -fr ./*',
				options: {
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					suppressRemoteErrors: true
				}
			},
			cleandemoapi: {
				command: 'cd ~/demo.ostosnero.fi/api && rm -fr ./*',
				options: {
					host: '<%= secret.host %>',
					username: '<%= secret.username %>',
					privateKey: grunt.file.read(privateKey),
					passphrase: '<%= secret.passphrase %>',
					suppressRemoteErrors: true
				}
			}
		}
    });


    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-manifest');
	grunt.loadNpmTasks('grunt-ssh');
    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', [
        'clean:server',
        //'compass:server',
        'livereload-start',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'compass',
        'connect:test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'test',
        //'compass:dist',
        'useminPrepare',
        'imagemin',
        'cssmin:minify',
        'htmlmin',
        'concat',
        'copy',
		'sass',
        'cdnify',
        'ngmin',
		//'uglify',
        'rev',
        'usemin',
		'manifest',
		'removelogging'
    ]);

    grunt.registerTask('min', [
        'uglify'
    ]);
	grunt.registerTask('removelog', [
		'removelogging'
	]);

	grunt.registerTask('deploy-api-demo', [
		//'sshexec:cleandemo',
		'sftp:apidemo'
	]);

	grunt.registerTask('deploy-demo', [
		'sshexec:cleandemoapi',
		'sftp:apidemo',
		'sshexec:cleandemo',
		'sftp:demo'
	]);
	grunt.registerTask('deploy-production', [
		'sftp:production'
	]);

	grunt.registerTask('cleandemo', [
		'sshexec:cleandemo'
	]);
    grunt.registerTask('default', ['build']);
};
