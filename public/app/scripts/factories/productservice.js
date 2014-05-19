/**
 * Created by vivaldi on 06/12/13.
 */
// Teach the injector how to build a 'greeter'
	// Notice that greeter itself is dependent on '$window'
angular.module('App.Services').factory('ProductService', function ($http, $q, $log) {
	// This is a factory function, and is responsible for
	// creating the 'greet' service.




	function _getSearchResults(term) {
			var dfd = $q.defer();
			$http({
				url: '/api/product/search/' + term,
				method: 'get'
			})
				.success(function (data) {
					console.log(data);

					dfd.resolve(data);
					mixpanel.track("User searched for products", {
						"term": term
					});
				})
				.error(function (reason) {
					$log.warn('ERR:', "Product search failed", reason);
					dfd.reject(reason);
				});

			return dfd.promise;

	}

	function _updatePrice(productId, shopId, price) {
		var dfd = $q.defer();
		$http({
			url: '../../api/product/prices/update/' + productId + '/' + shopId + '/' + price,
			method: 'GET'
		})
			.success(function(success){
				if(!success.success) dfd.reject(success.error);
				dfd.resolve();
			})
			.error(function(reason) {
				dfd.reject(reason);
			});

		return dfd.promise;
	}


		return {
			listItem: function (listID, listItemID) {
				if (window.localStorage && window.localStorage.userLists) {
					var lists = JSON.parse(window.localStorage.userLists),
						product = lists.lists[listID].products[listItemID];

					if (product !== undefined) {
						return product;
					} else {
						return false;
					}

				} else {
					return false;
				}

			},
			product: function (productId) {
				var dfd = $q.defer();

				$http({
					method: 'GET',
					url: '/api/product/' + productId
				})
					.success(function (data) {
						dfd.resolve(data);
					})
					.error(function (reason) {
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			getSearchResults: _getSearchResults,
			getLocalPrices: function(id, location) {
				var dfd = $q.defer();
				if(!!location.lat && !!location.long) {
					//console.o
					$http({
						url: '/api/product/prices/' + id + '/' + location.lat + '/' + location.long,
						method: 'GET'
					})
						.success(function(data, status) {
							console.log(data);
							if(status === 204) {
								dfd.reject('no price information available');
							}
							dfd.resolve(data);
						})
						.error(function(reason) {
							dfd.reject(reason);
						});

				} else {
					dfd.reject("no location set");
				}
				return dfd.promise;
			},
			updatePrice: _updatePrice
		};
	});