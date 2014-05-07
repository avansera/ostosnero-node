'use strict';

//new FastClick(document.body);

angular.module('App.Routes', []);
angular.module('App.Controllers', []);
angular.module('App.Services', []);
angular.module('App.Directives', []);

angular.module('ostosNero', [
		'AngularGM',
		'ngTouch',
		'ngRoute',
		'ngAnimate',
		'App.Routes',
		'App.Controllers',
		'App.Services',
		'App.Directives'
	])
	.factory('storage', function () {
		return {
			add: function (index, value) {
				return localStorage.setItem(index, JSON.stringify(value));
			},
			retrieve: function (index) {
				if (localStorage[index] !== undefined) {
					return JSON.parse(localStorage[index]);
				}
				else {
					return false;
				}
			},
			set: function (index, value) {
				var entry = localStorage[index];
				if (entry !== undefined) {
					localStorage[index] = JSON.stringify(value);
					return true;
				} else {
					return false;
				}
			},
			exists: function (index) {
				var exists = false;
				if (localStorage[index] !== undefined) {
					exists = true;
				}

				return exists;
			}

		};
	})
	.factory('scroller', function () {
		return {
			construct: function (element) {
				console.log("scroller service");
				console.log(element);

				if (~navigator.userAgent.indexOf('MSIE') === 0) {

					if (element === undefined) {
						return false;
					}

					var listScroller = new FTScroller(element, {
						scrollbars: true,
						scrollingX: false,
						updateOnChanges: true,
						updateOnWindowResize: true
					});
				}

				return true;
			}
		};
	})
	.factory('spinner', function () {
		var spinner;
		return {
			init: function (parentElement, invert) {

				var invert = invert || false;

				var spinnerOpts = {
					lines: 12, // The number of lines to draw
					length: 5, // The length of each line
					width: 3, // The line thickness
					radius: 10, // The radius of the inner circle
					corners: 1, // Corner roundness (0..1)
					rotate: 0, // The rotation offset
					direction: 1, // 1: clockwise, -1: counterclockwise
					color: invert ? '#444' : '#fff', // #rgb or #rrggbb
					speed: 1, // Rounds per second
					trail: 60, // Afterglow percentage
					shadow: false, // Whether to render a shadow
					hwaccel: false, // Whether to use hardware acceleration
					className: 'spinner', // The CSS class to assign to the spinner
					zIndex: 2e9, // The z-index (defaults to 2000000000)
					top: 'auto', // Top position relative to parent in px
					left: 'auto' // Left position relative to parent in px
				};


				var target = 'loadCont';
				//var spinnerTarget = document.getElementById(target);
				spinner = new Spinner(spinnerOpts).spin(parentElement);
			},
			stop: function () {
				spinner.stop();
			}
		};
	})

/**
 * Method to check whether the user is logged in.
 * Function to run on application start and will show a spinner while the ajax request is
 * waiting for data.
 */
	.run(function ($rootScope, $location, $q, $http, $log, $accountsService, storage, locationService) {
		$rootScope.loaded = false;
		var spinner;

		var spinnerOpts = {
			lines: 12, // The number of lines to draw
			length: 5, // The length of each line
			width: 3, // The line thickness
			radius: 10, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#fff', // #rgb or #rrggbb
			speed: 1, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};


		var target = 'loadCont',
			spinnerTarget = document.getElementById(target);
		spinner = new Spinner(spinnerOpts).spin(spinnerTarget);


		// APPCACHE UPDATING =============
		// Check if a new cache is available on page load.
		window.addEventListener('load', function (e) {
			window.applicationCache.addEventListener('updateready', function (e) {
				if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
					// Browser downloaded a new app cache.
					if (confirm('A new version of this site is available. Load it?')) {
						window.location.reload();
					}
				} else {
					// Manifest didn't changed. Nothing new to server.
				}
			}, false);

		}, false);


		// TODO load existing list data if any exists
		if (!window.navigator.onLine) {
			$rootScope.connError = "No network access, check wifi and/or packet data is enabled";
			$rootScope.loaded = true;
			spinner.stop();
		}
		/**
		 * devices settings allow network access,
		 * now to check if there is actually any connection
		 */
		else {


			/**
			 * run the checkLogin function as a deferred function to determine the login status of the user,
			 * set this status in the root scope.
			 *
			 */
				//loggedIn = checkLogin();
			$accountsService.session()
				.then(
					function () {

						/**
						 * if user is logged in, redirect them to their list(s)
						 */
						console.log('redir to list');
						$location.path('/list/');
						spinner.stop();
						$rootScope.loaded = true;


						/*
						 * once the login sequence has been completed, find the user's location.
						 */

						/*
						 *  when the current location has been found (asynchronously as it happens)
						 *  store the recovered latitude and longitude in the localstorage
						 */
						locationService.getCurrentLocation();


					}, function (reason) {
						$location.path('/');
						$log.warn('ERR:', 'check login failed: ', reason);
						$rootScope.loaded = true;
						spinner.stop();
					});
		}
	});

