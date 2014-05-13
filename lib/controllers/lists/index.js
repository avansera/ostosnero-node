/**
 * Created by vivaldi on 13.5.2014.
 */

var ok		= require('okay');
var log		= require('npmlog');
var q		= require('q');
var mysql	= require('mysql');
var db		= null;

function _getUserListId(uid, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "SELECT id FROM shoppinglists WHERE shoppinglists.userID = ?";
		conn.query(sql, [uid], ok(next, function(result) {
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
			"products.categoryID, " +
			"shoppinglistproducts.id AS list_item_id, " +
			"shoppinglistproducts.quantity " +
			"FROM products, shoppinglists, shoppinglistproducts, users " +
			"WHERE users.id = shoppinglists.userID " +
			"AND shoppinglistproducts.shoppinglistID = shoppinglists.id " +
			"AND shoppinglists.id = ? " +
			"AND shoppinglistproducts.productID = products.id " +
			"ORDER BY shoppinglistproducts.id DESC";

		conn.query(sql, [listId], ok(next, function(result) {
			log.info('list', result);
			dfd.resolve(result);
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
				_getUserListItems(listId, next)
					.then(function(result) {
						if(!result.length) {
							res.send(204);
						} else {
							res.send(200, result);
						}
					});
			},
			function() {
				res.send(204);
			});
	}
};