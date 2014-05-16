/**
 * Created by vivaldi on 06/12/13.
 */
/**
 * service for managing lists,
 * including adding and removing products.
 *
 * @variable data: the user list in JSON format
 * @method: add: add a product to the user list
 * @method: remove: remove a product from the user list
 */
angular.module('App.Services').factory('listService', function ($rootScope, $http, $q, $log, storage) {
	console.log('list service');

	$rootScope.list = false;

	function _getList() {
		var dfd = $q.defer();

		$http({
			url: '/api/list',
			method: 'GET'
		})
			.success(function(data) {

				$rootScope.list = data;
				dfd.resolve(data.message);
			})
			.error(function(reason) {
				$log.warn('ERR:', "Getting list failed", reason);
				dfd.reject(reason);
			});
		return dfd.promise;
	}

	function _addToList(productId) {
		var dfd = $q.defer();

		$http({
			url: '/api/list/add',
			method: 'PUT',
			data: {product_id: productId}
		})
			.success(function (data) {
				if(!data.success) dfd.reject(data.error);
				mixpanel.track("User added a product to their list", {
					"product_id": productId
				});
				dfd.resolve();

			})
			.error(function (msg) {
				$log.warn('ERR:', 'adding to list failed', msg);
				dfd.reject(msg);
			});

		return dfd.promise;
	}

	function _removeFromList(listItemId) {
		var dfd = $q.defer();

		$http({
			url: '/api/list/remove/' + listItemId,
			method: 'DELETE'
		})
			.success(function(data) {
				if(!data.success) dfd.reject(data.error);
				dfd.resolve();
			})
			.error(function(reason) {
				dfd.reject(reason);
			});

		return dfd.promise;
	}

	function _changeQuantity(listItemId, quantity) {
		var dfd = $q.defer();
		$http({
			url: '/api/list/quantity',
			method: 'PUT',
			data: {quantity: quantity, list_item_id: listItemId}
		})
			.success(function(status) {
				dfd.resolve();
			})
			.error(function(reason) {
				dfd.reject(reason);
			});
		return dfd.promise;
	}

	return {
		getList: _getList,
		addToList: _addToList,
		removeFromList: _removeFromList,
		changeQuantity: _changeQuantity
	};
});