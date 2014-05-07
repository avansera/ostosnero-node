/**
 * Created by vivaldi on 06/12/13.
 */
angular.module('App.Routes')
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/start-screen.html',
				controller: 'MainCtrl',
				resolve: {
					redirect: function ($route, $location) {
						if ($route.current.params.editMode == '1') {
							$location.path('edit');
						}
					}
				}
			})

			/*
			 * ROUTE CONFIG
			 */
			.when('/start', {
				templateUrl: 'views/start-screen.html',
				controller: 'MainCtrl'
			})
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/register', {
				templateUrl: 'views/signup.html',
				controller: 'RegisterCtrl'
			})
			.when('/register/pic', {
				templateUrl: 'views/signup-pic.html',
				controller: 'RegisterCtrl'
			})
			.when('/register/profile', {
				templateUrl: 'views/signup-profile.html',
				controller: 'RegisterCtrl'
			})
			.when('/search', {
				templateUrl: 'views/search.html',
				controller: 'SearchCtrl'
			})
			.when('/list', {
				templateUrl: 'views/list.html',
				controller: 'ListCtrl'
			})
			/*.when('/list/:listID', {
			 templateUrl: 'views/list.html',
			 controller: 'ListCtrl'
			 })*/
			.when('/list/:listItemID', {
				templateUrl: 'views/productPage.html',
				controller: 'ProductPageCtrl'
			})
			.when('/product/:productID', {
				templateUrl: 'views/productPage.html',
				controller: 'ProductPageCtrl'
			})
			.when('/location', {
				templateUrl: 'views/location.html',
				controller: 'LocationCtrl'
			})
			.when('/location/search/:term', {
				templateUrl: 'views/location-search.html',
				controller: 'LocationSearchCtrl'
			})
			.when('/location/map/:lat/:long', {
				templateUrl: "views/map.html",
				controller: 'MapCtrl'
			})
			.when('/sort/', {
				templateUrl: "views/sort.html",
				controller: 'SortCtrl'
			})
			.when('/404/', {
				templateUrl: 'views/404.html',
				controller: 'NotFoundCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
