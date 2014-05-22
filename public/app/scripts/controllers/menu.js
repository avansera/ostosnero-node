angular.module('App.Controllers').controller('MenuCtrl', function ($scope, $http, $q, $location, $accountsService)
{
	//document.getElementById('menu').style.width = window.innerWidth - 46;

	$scope.go = function (path)
	{
		$location.url(path);

		var page = $('.app-page'),
			trans = window.innerWidth - 46,
			transString = 'translate3d(' + trans + 'px, 0, 0)';


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