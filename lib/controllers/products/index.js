/**
 * Created by vivaldi on 9.5.2014.
 */
var ok = require('okay');
var log = require('npmlog');
var q = require('q');
var db = null;

function _getProductInfo(productIdArr, next) {
	var dfd = q.defer();

	var sql = "SELECT products.id AS product_id, " +
		"products.name AS product_name, " +
		"products.picUrl AS product_thumb, " +
		"products.barcode AS product_barcode, " +
		"products.categoryID AS product_category " +
		"FROM products WHERE id IN(?)";

	db.getConnection(ok(next, function(conn) {
		conn.query(sql, productIdArr, ok(next, function(result) {
			conn.release();

			if(result.length > 0) {
				dfd.resolve(result);
			} else {
				dfd.reject();
			}
		}));
	}));

	return dfd.promise;
}


exports.conn = function(pool) {
	db = pool;
};


exports.productInfo = function(req, res, next) {
	_getProductInfo(req.params.id, next)
		.then(
			function(result) {
				res.send(200, result[0]);
			},
			function() {
				res.send(204);
			}
		);
};



