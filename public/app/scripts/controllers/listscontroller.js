/**
 * controller for handling the user lists and related processes
 */
angular.module('App.Controllers')
	.controller('ListCtrl', function ($q, $http, $rootScope, $scope, $location, $log, $timeout, storage, listService, scroller, AlertService) {

	$scope.location 	= $location.url();
	$rootScope.alert 	= false;
	$scope.successes 	= [];
	/*	$rootScope.error 		= false;

	$timeout(function() {
		$rootScope.error = {
			"type": "warning",
			"message": "comes from controller crap"
		};
		$log.debug('DEBUG:', "error should appear");
	}, 1000);*/


	NProgress.start();

	listService.getList()
		.then(
			function (status) {
				NProgress.done();
				$scope.refreshing = false;
			},
			function(reason) {
				NProgress.done();
				console.log("couldnt get list: " + reason);
			});


	$scope.getLists = function () {
		NProgress.start();
		/*
		 * once the data has been set, construct the
		 * list scroller using FT Scroller
		 *
		 * Must be done after the ng-repeat because ng-repeat
		 * cant add elements to the ft-scroller's generated elements.
		 */



		/**
		 * function to retrieve the user's shopping lists from the server and then
		 * store them in local storage for future use.
		 *
		 * @returns deferred promise: data retrieved from getUserList API call.
		 */

		/*

		 }*/
		scroller.construct(document.getElementById('list-container'));
		$scope.refreshing = true;
		listService.getList()
			.then(
			function (status) {
				NProgress.done();
				AlertService.set('info', "List updated");
				$scope.refreshing = false;
			},
			function(reason) {
				NProgress.done();
				AlertService.set('error', "couldn't  get your list, try again");
				console.log("couldnt get list: " + reason);
			});
	};

	$scope.showMenu = function (listElem) {
		console.log(listElem);

		if ($scope.openItem == null) {
			$scope.openItem = listElem;
		} else {
			$scope.openItem = null;
		}
	};

	$scope.changeQuantity = function(listItemId, quantDiff) {
		$log.info('DEBUG:', "Change list item quantity", [listItemId, quantDiff]);
		var quantity;
		$rootScope.list.products[listItemId].quantity = parseInt($rootScope.list.products[listItemId].quantity) + quantDiff;
		quantity = $rootScope.list.products[listItemId].quantity;
		listService.changeQuantity(listItemId, quantity)
			.then(
				function(success) {
					//$scope.successes.push("Quantity changed");
					AlertService.set('success', "quantity changed to " + quantity);
				},
				function(reason) {
					// TODO: make errors relate to reason's error message
					$log.warn('ERR: "Quantity change failed', reason);
					//$scope.errors.push("Could not change quantity");
					AlertService.set('warning', "could not change quantity");
				}
			);
	};

	$scope.productInfo = function (listItemID) {
		$location.url('/list/' + listItemID);
	};


	/**
	 * Remove the list item from the list.
	 * First remove it locally from the list global variable
	 * followed by the localstorage.
	 *
	 * After which send an asynchronous call to the API to remove
	 * the list item from the active list.
	 *
	 * @param listItemId: Row ID of the list item to be removed.
	 * @param element: the reference to the element from ng-repeat.
	 */
	$scope.removeFromList = function (listItemId, element) {
		delete $rootScope.list.products[listItemId];
		AlertService.set('info', "removed '" + element.product_name + "'");
		listService.removeFromList(listItemId)
			.then(function() {
				$scope.getLists();
			});
	};

	$scope.sort = function () {
		$location.url('/sort');
	};

});