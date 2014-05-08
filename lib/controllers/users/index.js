/**
 * Created by vivaldi on 8.5.2014.
 */

var ok = require('okay');
var log = require('npmlog');
var q = require('q');
var db = null;


function _getUserInfo(id, next) {
	console.log('getUserInfo');
	var dfd = q.defer();

	db.getConnection(ok(next, function (conn) {
		conn.query("SELECT email, firstname, lastname, passhash FROM users WHERE ?", {id: id}, ok(next, function (result) {
			conn.release();
			log.info('DEBUG', "getUserInfo", result);
			if (!!result && result.length > 0) {
				dfd.resolve(result[0]);
			} else {
				dfd.reject('user not found');
			}
		}));
	}));

	return dfd.promise;
}

function _getStats(id, next) {
	console.log('getStats');
	var dfd = q.defer();

	db.getConnection(ok(next, function (conn) {
		var sql = "SELECT sum(shoppingListProductsHistory.saved) AS total_saved, count(DISTINCT token) AS shopping_trips, sum(shoppingListProductsHistory.price) AS total_spent " +
			"FROM users, shoppinglists, shoppingListProductsHistory " +
			"WHERE users.id = ? " +
			"AND shoppinglists.userID = users.id " +
			"AND shoppingListProductsHistory.shoppingListID = shoppinglists.id " +
			"GROUP BY shoppinglists.id";
		conn.query(sql, [id], ok(next, function (result) {
			conn.release();
			dfd.resolve(result[0]);
		}));
	}));


	return dfd.promise;
}


exports.conn = function (pool) {
	db = pool;
};

exports.userInfo = function (req, res, next) {

	var id = req.params.id;
	var promises = [_getUserInfo(id, next), _getStats(id, next)];
	q.all(promises)
		.then(
		function (result) {
			// format user data
			var data = {
				"user_info": result[0],
				"user_stats": result[1]
			};
			res.json(200, data);

		},
		function (err) {
			res.send(400, err);
		}
	);
};

exports.session = function (req, res, next) {
	var uid = null;
	// check for cookies

	if (!!req.signedCookies.onIdent) {
		uid = req.signedCookies.onIdent;
	}

	// get user info
	if (!!uid) {
		var promises = [_getUserInfo(uid, next), _getStats(uid, next)];
		q.all(promises)
			.then(
			function (result) {
				// format user data
				log.info('DEBUG', result);

			},
			function (err) {

			}
		);
	}
};

exports.login = function (req, res, next) {

};

exports.register = function (req, res, next) {

};

exports.logout = function (req, res, next) {

};

