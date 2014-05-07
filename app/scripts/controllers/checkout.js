angular.module('App.Controllers').controller('CheckoutCtrl', function($scope, sortService) {


	$scope.checked = sortService.checked;
	$scope.$on('$viewContentLoaded', function () {
		console.log($(window).innerHeight()-$('.checkout-sums').outerHeight());

		var scrollOpts = {
			scrollingX: false,
			scrollResponseBoundary: 1, // This is the default response boundary, spelt out for reference
			scrollBoundary: 15,
			updateOnChanges: true
		};
		//var checkoutScroll = new FTScroller(document.querySelector('#shop-checkout-summary'), scrollOpts);
	});


	function _formatPrice(price) {
		//console.log('price is: ' + price);
		if (price === false) {
			return false;
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
	}

	$scope.sum = function listSum() {
		var sum = 0;
		//console.log(sortService.checked);
		for(var shop in sortService.checked) {
			//console.log(shop);
			//console.log(sortService.checked[shop].products);
			//console.log(sortService.checked[shop]['products'].length);

			for(var product in sortService.checked[shop].products) {
				//if(sortService.checked[shop].products.length > 0)

				sum += parseFloat(sortService.checked[shop].products[product].price) * parseFloat(sortService.checked[shop].products[product].quantity);
				//console.log(product);
				//console.log(sum);
				//console.log(_formatPrice(sum));
			}
		}

		return _formatPrice(sum);
	};


	$scope.saved = function() {
		var sum = 0;
		//console.log(sortService.checked);
		for(var shop in sortService.checked) {
			//console.log(shop);
			//console.log(sortService.checked[shop].products);

			for(var product in sortService.checked[shop].products) {
				//if(sortService.checked[shop].products.length > 0)

				sum += parseFloat(sortService.checked[shop].products[product].saved) * parseFloat(sortService.checked[shop].products[product].quantity);
				//console.log(product);
				//console.log(sum);
				//console.log(_formatPrice(sum));
			}
		}

		return _formatPrice(sum);
	};

	/**
	 * Expand the checkout summary list,
	 * adding a value to the 'shop' object hash
	 * passed into the function via angular to determine
	 * whether if is declared open or not.
	 *
	 * @param list(boolean): shop object from angular
	 */
	$scope.toggle = function(list) {
		if (list.open === undefined) {
			list.open = false;
		}

		// invert the list-open boolean value
		list.open = !list.open;
	};

	//$scope.sum = listSum();
	//console.log(sortService.checked);
});
