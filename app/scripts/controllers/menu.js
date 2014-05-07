angular.module('App.Controllers').controller('MenuCtrl', function ($scope, $http, $q, $location, $accountsService)
{
	var width = window.innerWidth - 46;

	$('#menu').width(width);

	$scope.go = function (path)
	{
		console.log(path);
		$location.url(path);


		console.log('menu!');
		var page = $('.app-page'),
			trans = window.innerWidth - 46,
			transString = 'translate3d(' + trans + 'px, 0, 0)';

		console.log('menu button clicked');
		console.log(transString);


		if (page.hasClass('nav-active')) {
			if (isIE()) {
				page.css({
					left: 'auto'
				});
			}
			else {
				page.css({
					'-webkit-transform': 'translate3d(0, 0, 0)',
					'-moz-transform': 'translate3d(0, 0, 0)',
					'transform': 'translate3d(0, 0, 0)'
				});
			}
			page.removeClass('nav-active');
		}
		else {
			if (isIE()) {
				page.css({
					left: trans
				});
			} else {
				page.css({
					'-webkit-transform': transString,
					'-moz-transform': transString,
					'transform': transString
				});
			}
			page.addClass('nav-active');
		}

	};

	$scope.closeMenu = function() {

	};

	$scope.logout = function ()
	{
		$accountsService.logout();
		$location.path('/');
	};


})
	.controller('MenuLocationCtrl', function ($scope, locationService)
	{
		$scope.location = {
			current: locationService.location.string
		}
	})
	.controller('MenuProfileCtrl', function ($scope, $http, $q, $accountsService)
	{

		if ($scope.user.email === "update@ostosnero.com") {
			$scope.user.avatar_url = "./images/mikko.jpg";
		} else {
			$scope.user.avatar_url = "./images/avatar-placeholder.png";
		}
	});