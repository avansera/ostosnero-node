angular.module('App.Controllers').controller('SortCtrl', function ($scope, sortService, listService, scroller, storage) {
	console.log('sort controller');
	$scope.sortedProducts = "optimizing your list&hellip;";
	$scope.loading = true;
	$scope.currentList = -1;
	$scope.back = function () {
		history.back();
	};

	var shopListWrapper,
		shopListPage,
		numShops = 0,
		windowWidth,
		listScroll,
		listNav,
		listPages;

	$scope.$on('$viewContentLoaded', function () {
		console.log('sort loaded');

		$('#checkout-lists').height(document.height-($('.checkout-sums').outerHeight()));
		NProgress.start();
	});

	$scope.checkoutObj = sortService.checked;

	$scope.checkout = function (item, token) {
		console.log(item);
		var product = item.id,
			list = listService.data['attributes']['id'],
			listItem = item.listItemId,
			shop = item.shopid,
			quantity = item.quantity,
			price = item.price,
			saved = item.saved;


		item.checking = 1;
		$scope.checkedOut = null;
		sortService.checkout(token, product, quantity, listItem, list, shop, price, saved).then(
			function (status) {


				item.checking = 0;
				console.log(status);
				console.log(sortService.checked);
				console.log(sortService.checked[shop].quantity);
				if (status.checked === 1) {
					item.checkedOut = 1;



					console.log(sortService.checked[shop].quantity);
					sortService.checked[shop].quantity++;

					sortService.checked[shop]['products'][product] = {
						productName: item.name,
						price: price,
						saved: saved,
						quantity: quantity
					};

				} else {
					delete sortService.checked[shop]['products'][product];
					sortService.checked[shop].quantity--;
					item.checkedOut = 0;
				}
			},
			function (reason) {

				item.checking = 0;
				console.warn(reason);

			});
	};

	$scope.navLinkScrollTo = function(listNum) {
		console.log(listNum);
		var distance = $(window).innerWidth() * listNum; // horizontal position to scroll to

		listPages.scrollTo(distance, false, true);
	};

	function updateNavPos(pos) {
		console.log(pos);
		$scope.$apply(function() {
			$scope.currentList = pos.segmentX;
		});
		console.log(listNav.scrollWidth);

		var listPos;
		if(pos.segmentX > 0) {
			listPos = listNav.scrollWidth/pos.segmentX;
		} else {
			listPos = 0;
		}
		console.log(listPos);

		listNav.scrollTo(listPos, false, true);
	}



	sortService.sort()
		.then(
		function (sortedData) {
			NProgress.set(0.3);
			console.log(sortedData);
			$scope.currentList = 0;
			shopListWrapper = $('.sorted-list-wrapper');

			// number of shops in the sorted list and an extra for the checkout page
			numShops = sortedData.attributes.num_shops + 1;
			shopListWrapper.width($(window).innerWidth() * numShops);
			windowWidth = $(window).innerWidth();

			storage.add('sort', sortedData);

			$scope.sortedProducts = sortedData;



			/**
			 * preload the checked variable with the shop objects
			 * to fill them with products when checkin occurs.
			 */
			var shopNumber = 0;
			for (var shop in sortedData.shops) {
				console.log("shopNumber: " + shopNumber + "\nshop: " + shop);
				$scope.sortedProducts.shops[shop].shopNumber = shopNumber;

				console.log(shop);
				var shopObj = sortedData.shops[shop];


				sortService.checked[shop] = {
					shopId: shopObj.attributes.id,
					shopName: shopObj.attributes.chainName,
					shopLocation: shopObj.attributes.chainLocation,
					quantity: 0,
					open: true,
					products: {

					}
				};
				shopNumber++;
			}

			console.log(sortService.checked);




			setTimeout(function () {

				$('.sorted-list-nav').css({
					width: 80 * numShops + 'pt'
				});

				// Set up the horizontal scroller, enabling snapping and disabling bouncing
				var panningOpts = {
					scrollingX: true,
					scrollingY: false,
					scrollbars: false,
					contentHeight: $(window).innerHeight()-(40+40+40),
					snapping: true,
					paginatedSnap: true,
					scrollResponseBoundary: 8,
					scrollBoundary: 20,
					bouncing: false
				};

				var scrollOpts = {
					scrollingX: false,
					scrollResponseBoundary: 1, // This is the default response boundary, spelt out for reference
					scrollBoundary: 15,
					updateOnChanges: true
				};

				var navOpts = {
					scrollingY: false,
					scrollbars: false,
					/*scrollResponseBoundary: 8,
					 scrollBoundary: 20,*/
					bouncing: false
				};
				$('.sorted-list-shop-wrapper').each(function (i) {
					console.log(i);
					//var checkOpts = scrollOpts;

					//checkOpts.updateOnWindow
					$(this).width($(window).innerWidth());
					$(this).css({
						left:$(window).innerWidth() * i
					});
					if($(this).attr('id') !== "shop-checkout-summary") {
						listScroll = new FTScroller(document.querySelector('#' + $(this).attr('id')), scrollOpts);
					}
				});
				listPages = new FTScroller(document.querySelector('#sorted-list-content'), panningOpts);
				listPages.addEventListener('segmentdidchange', updateNavPos);
				listNav = new FTScroller(document.querySelector('.sorted-list-nav-wrapper'), navOpts);
				NProgress.done();

			}, 300);



			//scroller.construct(document.getElementById('sort-container'));
		},
		function (error) {
			console.log("there's been a problem: " + error);
			$scope.loading = false;
			NProgress.done();
		}
	);


});


