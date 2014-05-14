/**
 * Created by vivaldi on 8.5.2014.
 */

var ok = require('okay');
var log = require('npmlog');
var q = require('q');
var bcrypt = require('bcrypt');
var mysql = require('mysql');
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

function _emailExists(email, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function (conn) {
		var sql = "SELECT id, passhash FROM users WHERE ?";
		conn.query(sql, {email: email}, ok(next, function (result) {
			conn.release();
			if(result.length) {
				dfd.resolve(result[0]);
			} else {
				dfd.reject();
			}
		}));
	}));

	return dfd.promise;
}


function _updateUserRow(id, ip, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		//var ip	= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
		conn.query('UPDATE users SET ? WHERE ?', [{last_login_date: new Date(), last_login_ip: ip}, id], ok(next, function(result) {
			dfd.resolve();
		}));
	}));

	return dfd.promise;
}

function _createUserList(uid, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "INSERT INTO shoppinglists SET ?";
		var vals = {userID: uid, name: "shopping list"};

		conn.query(sql, [vals], ok(next, function(result) {
			dfd.resolve(result.insertId);
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

/**
 * Check session exists via cookies
 * @param req
 * @param res
 * @param next
 */
exports.session = function (req, res, next) {
	var uid = null;
	// check for cookies

	uid = req.signedCookies.onIdent;
	/*if (!!req.signedCookies.onIdent) {
	}*/

	// get user info
	if (!!uid) {
		var promises = [_getUserInfo(uid, next), _getStats(uid, next)];
		q.all(promises)
			.then(
			function (result) {
				// format user data
				var data = {
					"user_info": result[0],
					"user_stats": result[1]
				};
				res.json(200, data);
				var ip	= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
				_updateUserRow(uid, ip, next);
				log.info('DEBUG', result);

			},
			function (err) {
				res.send(500);
			}
		);
	} else {
		res.send(204, "no session");
	}
};


exports.login = function (req, res, next) {
	// validate login info
	log.info('LOGIN', "email", req.body);

	req.assert('email', "no email entered").notEmpty();
	req.assert('email', "invalid email").isEmail();

	req.assert('password', "no password entered").notEmpty();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {

		// check email exists
		_emailExists(req.body.email, next)
			.then(
				function(result) {
					// reconstruct password hash
					bcrypt.compare(req.body.password, result.passhash, ok(next, function(err) {
						console.log(err);
						var uid = result.id;
						var ip	= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

						res.cookie('onIdent', result.id, {maxAge: 1000*60*60*24*180, signed: true});

						var promises = [_getUserInfo(uid, next), _getStats(uid, next)];
						q.all(promises)
							.then(function (result) {
								// format user data
								var data = {
									"user_info": result[0],
									"user_stats": result[1]
								};
								res.json(200, data);
								var ip	= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
								_updateUserRow(uid, ip, next);
								log.info('DEBUG', result);

							},
							function (err) {
								res.send(500);
							});


						_updateUserRow(uid, ip, next);
						// update user row with latest login ID and date
					}));
					//res.send(201, "login is a-ok");
				},
				function() {
					res.send(400, "email not found");
				}
			);
	}

};

exports.register = function (req, res, next) {


	log.info('REGISTER', "email", req.body);

	// validate required inputs
	req.assert('email', "email missing").notEmpty();
	req.assert('email', "email not valid").notEmpty().isEmail();

	req.assert('password', "password missing").notEmpty();
	req.assert('password', "password too short (min 6 characters)").len(6, 255);

	req.assert('name', "name missing").notEmpty();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {
		// check for existing user
		_emailExists(req.body.email, next)
			.then(
				function(success) {
					log.info('REGISTER', "email exists");
					res.json(400, {err: "ERR_EMAIL_EXISTS"});

				},
				function() {
					// create password hash
					var salt		= bcrypt.genSaltSync(10);
					var passhash	= bcrypt.hashSync(req.body.password, salt);
					var ip 			= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
					log.info('REGISTER', "password hash", passhash, salt, ip);

					// insert user

					var sql = "INSERT INTO users SET ?";
					var vals = {
						id: null,
						email: req.body.email,
						passhash: passhash,
						salt: salt,
						created: null,
						firstname: req.body.name,
						lastname: "",
						last_login_date: new Date(),
						reg_ip: ip,
						last_login_ip: ip,
						must_validate: 1,
						facebook: 0
					};

					db.getConnection(ok(next, function(conn) {
						conn.query(sql, vals, ok(next, function(result) {
							conn.release();
							// create a list for the new user
							_createUserList(result.insertId, next)
								.then(function(listId) {
									res.cookie('onIdent', result.insertId, {maxAge: 1000*60*60*24*180, signed: true});

									// use process.nextTick to avoid 'already sent headers' error
									process.nextTick(function() {
										res.send(201);
									});
								});
						}));
					}));
					// log user in using insert ID, which would be the user's ID anyway
				}
			);
	}





};

exports.logout = function (req, res, next) {
	if(!!req.signedCookies.onIdent) {
		res.cookie('onIdent', false);
		res.send(201);
	}
};

