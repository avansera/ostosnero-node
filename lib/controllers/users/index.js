/**
 * Created by vivaldi on 8.5.2014.
 */

var ok		= require('okay');
var log		= require('npmlog');
var q		= require('q');
var db		= null;


function _getUserInfo(id, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		conn.query("SELECT email, firstname, lastname, passhash FROM users WHERE ?", {id: id}, ok(next, function(result) {
			log.info('DEBUG', "getUserInfo", result);
			if(!!result && result.length > 0) {
				dfd.resolve(result[0]);
			} else {
				dfd.reject('user not found');
			}
		}));
	}));

	return dfd.promise;
}


exports.conn = function(pool) {
	db = pool;
};

exports.userInfo = function(req, res, next) {
	_getUserInfo(req.params.id, next)
		.then(
		function(result) {
			// format user data
			var data = {

			};

		},
		function(err) {

		}
	);
};

exports.session = function(req, res, next) {
	var uid = null;
	// check for cookies

	if(!!req.signedCookies.onIdent) {
		uid = req.signedCookies.onIdent;
	}

	// get user info
	if(!!uid) {
		_getUserInfo(uid, next)
			.then(
				function(result) {
					// format user data
					var data = {

					}

				},
				function(err) {

				}
			);
	}
};

exports.login = function(req, res, next) {

};

exports.register = function(req, res, next) {

};

exports.logout = function(req, res, next) {

};

