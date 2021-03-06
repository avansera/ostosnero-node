// Generated on 2014-04-10 using generator-angular-fullstack 1.3.3
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./lib/config/config');

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		yeoman: {
			// configurable paths
			app: require('./bower.json').appPath || 'public/app',
			dist: 'dist'
		},
		express: {
			options: {
				port: config.port
			},
			dev: {
				options: {
					script: 'server.js',
					debug: true
				}
			},
			prod: {
				options: {
					script: 'dist/server.js',
					node_env: 'production'
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= express.options.port %>'
			}
		},
		watch: {
			js: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: true
				}
			},
			mochaTest: {
				files: ['test/server/{,*/}*.js'],
				tasks: ['mochaTest']
			},
			jsTest: {
				files: ['test/client/spec/{,*/}*.js'],
				tasks: ['newer:jshint:test', 'karma']
			},
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				files: [
					'<%= yeoman.app %>/views/{,*//*}*.{html,jade}',
					'{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css',
					'{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js',
					'<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
				],

				options: {
					livereload: true
				}
			},
			express: {
				files: [
					'server.js',
					'lib/**/*.{js,json}'
				],
				tasks: ['newer:jshint:server', 'express:dev', 'wait'],
				options: {
					livereload: true,
					nospawn: true //Without this option specified express won't be reloaded
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			server: {
				options: {
					jshintrc: 'lib/.jshintrc'
				},
				src: [ 'lib/{,*/}*.js']
			},
			all: [
				'<%= yeoman.app %>/scripts/{,*/}*.js'
			],
			test: {
				options: {
					jshintrc: 'test/client/.jshintrc'
				},
				src: ['test/client/spec/{,*/}*.js']
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: [
							'.tmp',
							'<%= yeoman.dist %>/*',
							'!<%= yeoman.dist %>/.git*',
							'!<%= yeoman.dist %>/Procfile'
						]
					}
				]
			},
			heroku: {
				files: [
					{
						dot: true,
						src: [
							'heroku/*',
							'!heroku/.git*',
							'!heroku/Procfile'
						]
					}
				]
			},
			server: '.tmp'
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/styles/',
						src: '{,*/}*.css',
						dest: '.tmp/styles/'
					}
				]
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/public/app/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/public/app/styles/{,*/}*.css',
						'<%= yeoman.dist %>/public/app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'<%= yeoman.dist %>/public/app/styles/fonts/*'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: ['<%= yeoman.app %>/views/index.html',
				'<%= yeoman.app %>/views/index.jade'],
			options: {
				dest: '<%= yeoman.dist %>/public/app'
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['<%= yeoman.dist %>/public/app/views/{,*/}*.html',
				'<%= yeoman.dist %>/public/app/views/{,*/}*.jade'],
			css: ['<%= yeoman.dist %>/public/app/styles/{,*/}*.css'],
			options: {
				assetsDirs: ['<%= yeoman.dist %>/public/app']
			}
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			options: {
				cache: false
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.{png,jpg,jpeg,gif}',
						dest: '<%= yeoman.dist %>/public/app/images'
					}
				]
			}
		},

		svgmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.svg',
						dest: '<%= yeoman.dist %>/public/app/images'
					}
				]
			}
		},

		htmlmin: {
			dist: {
				options: {
					//collapseWhitespace: true,
					//collapseBooleanAttributes: true,
					//removeCommentsFromCDATA: true,
					//removeOptionalTags: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/views',
						src: ['*.html', 'partials/**/*.html'],
						dest: '<%= yeoman.dist %>/public/app/views'
					}
				]
			}
		},

		// Allow the use of non-minsafe AngularJS files. Automatically makes it
		// minsafe compatible so Uglify does not destroy the ng references
		ngmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/concat/scripts',
						src: '*.js',
						dest: '.tmp/concat/scripts'
					}
				]
			}
		},

		// Replace Google CDN references
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/public/app/views/*.html']
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= yeoman.app %>',
						dest: '<%= yeoman.dist %>/public/app',
						src: [
							'*.{ico,png,txt}',
							'.htaccess',
							'bower_components/**/*',
							'images/{,*/}*.{webp}',
							'fonts/**/*'
						]
					},
					{
						expand: true,
						dot: true,
						cwd: '<%= yeoman.app %>/views',
						dest: '<%= yeoman.dist %>/public/app/views',
						src: '**/*.jade'
					},
					{
						expand: true,
						cwd: '.tmp/images',
						dest: '<%= yeoman.dist %>/public/app/images',
						src: ['generated/*']
					},
					{
						expand: true,
						dest: '<%= yeoman.dist %>',
						src: [
							'package.json',
							'server.js',
							'lib/**/*'
						]
					}
				]
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			server: [
				'copy:styles'
			],
			test: [
				'copy:styles'
			],
			debug: {
				tasks: [
					'nodemon',
					'node-inspector'
				],
				options: {
					logConcurrentOutput: true
				}
			},
			dist: [
				//'copy:styles',
				'imagemin',
				'svgmin',
				'htmlmin'
			]
		},


		manifest: {
			generate: {
				options: {
					basePath: '<%= yeoman.dist %>/public/app',
					cache: ["index.html"],
					network: ["*"],
					timestamp: true,
					hash: true
				},
				src: ['**/*.html', '**/*.js', '**/*.css', 'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}', '!bower_components/**/*'],
				dest: "<%= yeoman.dist %>/public/app/on.appcache"
			}
		},

		/*cssmin: {
			dist: {
				files: {
					'<%= yeoman.dist %>/public/app/styles/app.css': [
						'.tmp/styles/{,*//*}*.css',
						'<%= yeoman.app %>/styles/{,*//*}*.css'
					]
				}
			}
		},*/

		// By default, your `index.html`'s <!-- Usemin block --> will take care of
		// minification. These next options are pre-configured if you do not wish
		// to use the Usemin blocks.
		// cssmin: {
		//   dist: {
		//     files: {
		//       '<%= yeoman.dist %>/styles/main.css': [
		//         '.tmp/styles/{,*/}*.css',
		//         '<%= yeoman.app %>/styles/{,*/}*.css'
		//       ]
		//     }
		//   }
		// },
		// uglify: {
		//   dist: {
		//     files: {
		//       '<%= yeoman.dist %>/scripts/scripts.js': [
		//         '<%= yeoman.dist %>/scripts/scripts.js'
		//       ]
		//     }
		//   }
		// },
		// concat: {
		//   dist: {}
		// },

		// Test settings
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},

		mochaTest: {
			options: {
				reporter: 'spec'
			},
			src: ['test/server/**/*.js']
		},

		env: {
			test: {
				NODE_ENV: 'test'
			}
		}
	});


	grunt.loadNpmTasks('grunt-manifest');


	// Used for delaying livereload until after server has restarted
	grunt.registerTask('wait', function () {
		grunt.log.ok('Waiting for server reload...');

		var done = this.async();

		setTimeout(function () {
			grunt.log.writeln('Done waiting!');
			done();
		}, 500);
	});

	grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
		this.async();
	});

	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'express:prod', 'open', 'express-keepalive']);
		}

		if (target === 'debug') {
			return grunt.task.run([
				'clean:server',
				'bower-install',
				'concurrent:server',
				'autoprefixer',
				'concurrent:debug'
			]);
		}

		grunt.task.run([
			'clean:server',
			'bower-install',
			'concurrent:server',
			'autoprefixer',
			'express:dev',
			'open',
			'watch'
		]);
	});

	grunt.registerTask('server', function () {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run(['serve']);
	});

	grunt.registerTask('test', function (target) {
		if (target === 'server') {
			return grunt.task.run([
				'env:test',
				'mochaTest'
			]);
		}

		else if (target === 'client') {
			return grunt.task.run([
				'clean:server',
				'concurrent:test',
				'autoprefixer',
				'karma'
			]);
		}

		else grunt.task.run([
				'test:server',
				'test:client'
			]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		'concat',
		'ngmin',
		'copy:dist',
		'cdnify',
		'cssmin',
		'uglify',
		'rev',
		'usemin',
		'manifest'
	]);

	grunt.registerTask('heroku', function () {
		grunt.log.warn('The `heroku` task has been deprecated. Use `grunt build` to build for deployment.');
		grunt.task.run(['build']);
	});

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);
};
