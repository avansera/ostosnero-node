/**
 * Created by vivaldi on 06/12/13.
 */
angular.module('App.Services').factory('sortService', function ($http, $q, $rootScope, storage, listService) {
	return {
		data: {},
		checked: {},
		sort: function () {

			var lat,
				long,
				list,
				dfd,
				self = this;

			list 	= $rootScope.list;
			lat 	= storage.retrieve('location.lat');
			long 	= storage.retrieve('location.long');

			dfd = $q.defer();

			if (!list) {
				dfd.reject("there is no list data in teh list service variable");
			}
			$http({
				url: '../../api/lists/sort/' + lat + '/' + long,
				method: 'GET'
			})
				.success(function (data) {
					console.log(data);
					if (typeof data === "string") {
						console.log(data.match(/^conn error: (.*)/) !== null);
					}

					// if no error is there, all should be well...
					if (data.error === undefined) {
						self.data = data;
						mixpanel.track("User sorted their list", {
							"list_total_price": data.attributes.listtotal,
							"list_shops": data.attributes.num_shops,
							"list_id": list.attributes.id
						});
						dfd.resolve(data);
					}
					// ...but if it is there, fuuuuck!
					else if(typeof data === "string" && data.match(/^conn error: (.*)/) !== null) {
						console.warn(data);
						dfd.reject(data.replace(/^conn error: (.*)/, "$1"));
					}
					else {
						console.warn(data.error);
						dfd.reject(data.error);
					}
				})
				.error(function (msg) {
					console.warn(msg);
					dfd.reject(msg);
				});

			return dfd.promise;
		},
		checkout: function (token, productId, quantity, listItemId, listId, shopId, price, saved) {
			var dfd = $q.defer(),
				self = this,
				sort = self.data;

			$http({
				url: '../../api/checkout-item/',
				method: 'GET',
				params: {productid: productId, quantity: quantity, listid: listId, shopid: shopId, price: price, saved: saved, token: token}
			})
				.success(function(data) {
					if (data.success === 1) {


						// check if the product is checked out on the server, to handle UI notifications.
						if (data.checked === 1) {

							mixpanel.track("Product checked out", {
								"product_id": productId,
								"sort_token": token,
								"shop_id": shopId,
								"price": price
							});

							sort.shops[shopId].listItems[listItemId]['checkedOut'] = 1;
						} else {
							sort.shops[shopId].listItems[listItemId]['checkedOut'] = 0;
						}
						dfd.resolve(data);
					} else {
						dfd.reject(data.message);
					}
				})
				.error(function(e) {
					dfd.reject(e);
				});
			return dfd.promise;
		}
	};
});