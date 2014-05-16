/**
 * Created by vivaldi on 13.5.2014.
 */

var ok			= require('okay');
var log			= require('npmlog');
var q			= require('q');
var mysql		= require('mysql');
var _			= require('underscore');
var products	= require('../products');
var db			= null;

function _getUserListId(uid, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "SELECT id FROM shoppinglists WHERE shoppinglists.userID = ?";
		conn.query(sql, [uid], ok(next, function(result) {
			conn.release();
			log.info('list', result);
			if(!result.length) {
				dfd.reject();
			}  else {
				dfd.resolve(result[0].id);
			}
		}));
	}));

	return dfd.promise;
}

function _getUserListItems(listId, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "SELECT " +
			"products.id AS product_id, " +
			"products.name AS product_name, " +
			"products.picUrl AS product_thumb, " +
			"products.barcode AS barcode, " +
			"products.categoryID AS product_category, " +
			"shoppinglistproducts.id AS list_item_id, " +
			"shoppinglistproducts.quantity " +
			"FROM products, shoppinglists, shoppinglistproducts, users " +
			"WHERE users.id = shoppinglists.userID " +
			"AND shoppinglistproducts.shoppinglistID = shoppinglists.id " +
			"AND shoppinglists.id = ? " +
			"AND shoppinglistproducts.productID = products.id " +
			"ORDER BY shoppinglistproducts.id DESC";

		conn.query(sql, [listId], ok(next, function(result) {
			conn.release();
			log.info('list', result);
			dfd.resolve(result);
		}));
	}));

	return dfd.promise;
}

function _addProductToList(listId, productId, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "INSERT INTO shoppinglistproducts SET ?";
		var data = {
			"id": null,
			"shoppinglistID": listId,
			"productID": productId,
			"quantity": 1
		};
		conn.query(sql, [data], ok(next, function(result) {
			data.id = result.insertId;
			conn.release();
			dfd.resolve(data);
		}));
	}));

	return dfd.promise;
}

/**
 * query shoppinglistproducts table to see if user has a list item already.
 * If so, return it's data for further use, else return falsy something
 *
 * @param productId
 * @param listId
 * @param next
 * @returns {Promise.promise|*}
 * @private
 */
function _hasListItem(productId, listId, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "SELECT id, quantity FROM shoppinglistproducts WHERE ? AND ?";
		conn.query(sql, [{"shoppingListID": listId}, {"ProductID": productId}], ok(next, function(result) {
			conn.release();
			if(result.length > 0) {
				dfd.resolve({"has_list_item": true, "list_item_id": result[0].id, "quantity": result[0].quantity});
			} else {
				dfd.resolve({"has_list_item": false});
			}
		}));
	}));

	return dfd.promise;
}

function _updateListItemQuantity(listItemId, quantity, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "UPDATE shoppinglistproducts SET ? WHERE ?";
		var vals = [{quantity: quantity}, {id: listItemId}];
		conn.query(sql, vals, ok(next, function(result) {
			conn.release();
			dfd.resolve();
		}));
	}));

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


exports.userList = function(req, res, next) {
	var uid = req.signedCookies.onIdent;
	if(!uid) {
		res.send(403);
	} else {
		_getUserListId(uid, next)
			.then(function(listId) {
				return _getUserListItems(listId, next);
			},
			function() {
				res.send(204);
			})
			.then(function(result) {
				if(!result.length) {
					res.send(204);
				} else {

					var data = {
						"attrs": null,
						"products": {}
					};
					_.each(result, function(product) {
						data.products[product.list_item_id] = product;
					});
					res.send(200, data);
				}
			});
	}
};

exports.addToList = function(req, res, next) {
	var uid = req.signedCookies.onIdent;

	if(!uid) {
		res.json(403, {err: "ERR_NO_SESSION"});
	} else {

		var productId = parseInt(req.body.product_id);
		var listId = null;
		var listItemId = null;

		_getUserListId(uid, next)
			.then(function(argListId) {
				listId = argListId;
				return _hasListItem(productId, listId, next);
				//return _addProductToList(listId, productId, next);
			},
			function() {
				res.send(204);
			})
			.then(function(result) {
				if(!!result.has_list_item) {

					log.info('lists', "add item update quantity", result.quantity);
					result.quantity++;
					_updateListItemQuantity(result.list_item_id, result.quantity, next)
						.then(function() {
							res.json(201, {quantity: result.quantity});
						});
				} else {
					_addProductToList(listId, productId, next)
						.then(function(listItemInfo) {
							log.info('lists', "new list item info", listItemInfo);
							listItemId = listItemInfo.id;
							return products.intProductInfo(productId, next);
						})
						.then(
							function(productInfo) {
								log.info('lists', "get info on added product", productInfo);
								productInfo = productInfo[0];
								var data = {
									"product_id": productInfo.product_id,
									"product_name": productInfo.product_name,
									"product_thumb": productInfo.product_thumb,
									"barcode": productInfo.barcode,
									"product_category": productInfo.product_category,
									"list_item_id": listItemId,
									"quantity": 1

								};

								res.json(201, data);
							},
							function(err) {
								res.send(410);
							});
				}
			});
	}

};

exports.removeFromList = function(req, res, next) {

	var listItemId = req.params.listItemId;
	db.getConnection(ok(next, function(conn) {
		var sql = "DELETE FROM shoppinglistproducts WHERE ?";

		conn.query(sql, [{id: listItemId}], ok(next, function(result) {
			conn.release();
			res.send(200);
		}));
	}));
};

exports.updateQuantity = function(req, res, next) {

	req.assert('quantity', "no quantity given").notEmpty();
	req.assert('quantity', "quantity must be a number").isInt();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {
		var listItemId 	= req.body.list_item_id;
		var newQuant	= req.body.quantity;

		res.send(202);
		_updateListItemQuantity(listItemId, newQuant, next);
	}

};