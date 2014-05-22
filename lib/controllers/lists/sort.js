/**
 * Created by vivaldi on 20.5.2014.
 */

var ok			= require('okay');
var log			= require('npmlog');
var q			= require('q');
var mysql		= require('mysql');
var _			= require('underscore');
var products	= require('../products');
var lists		= require('./index.js');
var locations	= require('../locations');
var db			= null;



function _getListPrices(shops, products, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql =  "SELECT " +
			"p1.ID as price_id, p1.productId as product_id, p1.shopID as shop_id, p1.created, p1.price " +
			"FROM prices p1 " +
			"INNER JOIN " +
			"(SELECT * FROM prices " +
			"WHERE shopID IN(?) AND productId IN(?) " +
			"ORDER BY created DESC " +
			") p2 " +
			"ON p1.ID = p2.ID " +
			"GROUP BY p1.productId, p1.shopID";

		conn.query(sql, [shops, products], ok(next, function(result) {
			conn.release();
			dfd.resolve(result);
		}));
	}));
	return dfd.promise;
}

function _getShopList(uid, next, lat, long) {
	var dfd = q.defer();
	var savedLocations = locations.intSurroundingStores(lat, long, next);
	var nearbyLocations = locations.intSavedLocations(uid, next);

	q.all(savedLocations, nearbyLocations)
		.then(function(result) {
			dfd.resolve(result);
		});
	return dfd.promise;
}

function _getListProducts(uid, next) {
	//log.info('Sort', "list items", lists.intUserList(uid, next));
	var dfd = q.defer();
	lists.intUserListId(uid, next)
		.then(function(id) {
			log.info('Sort', "list id", id);
			return lists.intUserListContents(id, next);
		},
		function(reason) {
			log.warn('Sort', "list id failed", reason);
			dfd.reject(reason);
		})
		.then(function(result) {
			log.info('Sort', "list items", result);
			dfd.resolve(result);
		});
	return dfd.promise;
}

/*
 ** EXPORTS **
 */

/**
 * Set the DB variable to the pool created in server.js
 * @param pool
 */
exports.conn = function (pool) {
	db = pool;
};

exports.sort = function(req, res, next) {

	req.assert('lat', "missing latitude coordinate").notEmpty();
	req.assert('lat', "invalid latitude coordinate").matches(/\d+\.\d+/);

	req.assert('long', "missing longitude coordinate").notEmpty();
	req.assert('long', "invalid longitude coordinate").matches(/\d+\.\d+/);

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {

		var lat		= req.params.lat;
		var long	= req.params.long;
		var uid		= req.signedCookies.onIdent;
		var token	= require('crypto').createHash('md5').update(lat+long).digest("hex");

		var shopIds;
		var shopObjects;
		var listItems;
		var prices;

		var data = {
			"shops": [],
			"attrs": {
				"num_list_products": 0,
				"num_shops": 0,
				"token": token
			}
		};

		// get list of shops, both user saved and surrounding
		_getShopList(uid, next, lat, long)
			.then(function(result) {

				// create an object, with shop_id as the key
				shopObjects	= _.groupBy(result, function(shop) {return shop.shop_id});

				// create an array of shop_ids
				shopIds		= _.map(result, function(location) {
					return location.shop_id;
				});

				return _getListProducts(uid, next);
			})

			// Get the user's shopping list products
			.then(function(result) {
				// create an object of products, with product_id as key
				listItems			= _.groupBy(result, function(item) {return item.product_id});

				//create an array of product_ids
				var listItemIdArr	= _.map(result, function(product) {
					return product.product_id;
				});

				// use the length of product_id array to define the number of products in list
				data.attrs.num_list_products = listItemIdArr.length;
				return _getListPrices(shopIds, listItemIdArr, next);

			})
			// use the shop_id and product_id array to get prices for all products, at all locations
			.then(function(result) {
				// Make object of prices, with shop_id as the key
				prices = _.groupBy(result, function(price) {return price.shop_id});

				// Cycle the shops, create an object and fill it with prices with corresponding shop_ids
				_.each(shopObjects, function(shop) {
					shop = shop[0];
					var shopData = {
						"products": [],
						"attrs": shop
					};

					shopData.attrs.num_products	= 0;
					shopData.attrs.total_price	= 0.0;

					_.each(prices[shop.shop_id], function(price) {

						// merge the product information and price information into a single object
						var merge			= {};
						var productContext	= listItems[price.product_id][0];

						// add properties for unit price, and total price calculated by quantity of products
						merge.price_unit	= price.price;
						price.price			= price.price * productContext.quantity;

						// add the calculated price to the running total for the current shop context, and increment the number of
						// products that are available there
						shopData.attrs.num_products++;
						shopData.attrs.total_price += price.price;

						for(var attr in price)			{merge[attr] = price[attr]}
						for(var attr in productContext)	{merge[attr] = productContext[attr]}
						shopData.products.push(merge);

					});

					// only include shops that have any products in them
					if(shopData.products.length>0) {
						data.shops.push(shopData);
					}

					data.attrs.num_shops = data.shops.length;
				});

				res.json(200, data);
			});
	}



};