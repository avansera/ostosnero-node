angular.module('App.Controllers').controller('GlobalCtrl', ['$scope', '$location', function ($scope, $location)
{
	console.log('global ctrl');

	/**
	 * global function to excecute history.back()
	 */
	$scope.back = function ()
	{
		console.log('back function');
		window.history.back();
	};

	$scope.$loading = function (status)
	{
		return !!status;
	};

	/**
	 * close on-screen alerts
	 */
	$scope.$close = function ()
	{
		$('.alert').fadeOut(200);
	};

	$scope.$path = function(path) {
		$location.path(path);
	};


	/**
	 * open app menu
	 */
	$scope.$toggleMenu = function ()
	{
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

	/**
	 * format a price correctly
	 * @param {float}price
	 * @returns {string}formatted price string
	 */
	$scope.$formatPrice = function(price) {
		//console.log('price is: ' + price);
		if (!price) {
			return '0,00';
		}

		// force float to have 2 decimals
		price = parseFloat(price).toFixed(2);
		var formattedPrice, regexInt, regexOneDecimal, regexTwoDecimals;

		regexInt = /^(\d+)(?!\.+)$/;
		regexOneDecimal = /(\d+)\.([0-9]?)(?!\d)/;
		regexTwoDecimals = /(\d)(\.)([0-9]{2})\d/;

		formattedPrice = price.toString();
		if (formattedPrice.match(regexInt)) {
			//console.log("price has no decimals");
			formattedPrice = formattedPrice.replace(regexInt, "$1,00");
		}
		else if(formattedPrice.match(regexOneDecimal)) {
			//console.log("price has one decimal");
			formattedPrice = formattedPrice.replace(regexOneDecimal, "$1,$20");
		}
		else if(formattedPrice === "0") {
			formattedPrice = "0,00";
		}
		else {
			//console.log("don't worry 'bout it");
			formattedPrice = formattedPrice.replace(regexTwoDecimals, "$1,$3");
		}

		return formattedPrice;
	};

	$scope.$showPass = function(inputId) {
		var elem = $("#" + inputId.$name);
		console.log(elem);
		if (elem.attr('type') === 'password') {
			elem.attr('type', 'text');

			elem.parent().find('.icon-eye-close').addClass('icon-eye-open').removeClass('icon-eye-close');
		} else {
			elem.attr('type', 'password');
			elem.parent().find('.icon-eye-open').addClass('icon-eye-close').removeClass('icon-eye-open');
		}
	};

	$scope.$go = function(path) {
		/**
		 * TODO : add path validation
		 */
	  $location.path(path);
	};

	$scope.$link = function(address) {
		window.location = address;
	}

}]);
