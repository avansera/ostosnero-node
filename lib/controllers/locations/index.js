/**
 * Created by vivaldi on 12.5.2014.
 */
var ok		= require('okay');
var log		= require('npmlog');
var q		= require('q');
var _		= require('underscore');
var db		= null;






function _getSurroundingStores(lat, long, next) {
	var dfd = q.defer();


	db.getConnection(ok(next, function(conn) {

		var sql = "SELECT  shops.id as shop_id,  shops.name AS shop_location,  shops.address,  shops.city,  shops.latitude,  shops.longitude,  chains.name AS shop_chain," +
			"truncate ((( 6371 * acos( cos( radians( " + conn.escape(lat) + ") ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians( " + conn.escape(long) + " ) ) + sin( radians( " + conn.escape(lat) + " ) ) * sin( radians( latitude ) ) ) )*1000),2) AS distance " +
			"FROM shops, chains " +
			"WHERE longitude is not null " +
			"AND chains.id = shops.chainID " +
			"ORDER BY distance asc " +
			"LIMIT 50";

		conn.query(sql, ok(next, function(result) {
			conn.release();
			dfd.resolve(result);
		}));
	}));

	return dfd.promise;
}

function _getSavedLocations(user, next) {
	var dfd = q.defer();

	db.getConnection(ok(next, function(conn) {
		var sql = "SELECT shops.id as shop_id, chains.name as shop_chain, shops.name as shop_location, " +
			"shops.address, shops.city, shops.latitude, shops.longitude, shops.zipcode " +
			"FROM locations, shops, chains " +
			"WHERE chains.id = shops.chainID " +
			"AND locations.shopid = shops.id " +
			"AND locations.userid = " + conn.escape(user) + " " +
			"AND locations.active = 1";

		conn.query(sql, ok(next, function(result) {
			conn.release();
			dfd.resolve(result);
		}));
	}));

	return dfd.promise;
}

function _hasLocation(uid, shopId, next) {
	var dfd = q.defer();
	db.getConnection(ok(next, function(conn) {
		conn.query("SELECT id FROM locations WHERE shopid = ? AND userid = ? AND active = 1", [shopId, uid], ok(next, function(result) {
			conn.release();
			if(result.length) dfd.resolve(result[0]);
			else dfd.resolve(false);
		}));
	}));
	return dfd.promise;
}


function _saveLocation(uid, shopId, next) {
	var dfd = q.defer();
	db.getConnection(ok(next, function(conn) {
		conn.query("INSERT INTO locations SET ?", [{shopid: shopId, userid: uid, active: 1}], ok(next, function(result) {
			conn.release();
			dfd.resolve();
		}));
	}));
	return dfd.promise;
}



exports.conn = function(pool) {
	db = pool;
};

exports.intSurroundingStores = function(lat, long, next) {
	return _getSurroundingStores(lat, long, next);
};

exports.surroundingStores = function(req, res, next) {
	req.assert('lat', "missing latitude coordinate").notEmpty();
	req.assert('lat', "invalid latitude coordinate").matches(/\d+\.\d+/);

	req.assert('long', "missing longitude coordinate").notEmpty();
	req.assert('long', "invalid longitude coordinate").matches(/\d+\.\d+/);

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {
		_getSurroundingStores(req.params.lat, req.params.long, next)
			.then(function(result) {
				res.send(200, result);
			});
	}
};

exports.intSavedLocations = function(uid, next) {
	log.info('Locations', "intSavedLocations");
	return _getSavedLocations(uid, next);
};

exports.savedLocations = function(req, res, next) {
	if(!req.signedCookies.onIdent) {
		log.info("forbüden");
		res.send(403);
	} else {
		_getSavedLocations(req.signedCookies.onIdent, next)
			.then(function(result) {
				res.send(200, result);
			},
			function() {
				res.send(204);
			});
	}
};


exports.searchLocations = function(req, res, next) {
	req.assert("term", "no search terms").notEmpty();
	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {

		db.getConnection(ok(next, function(conn) {
			var keywords = req.params.term.split(" ");
			var likeStatements = [];
			var likeStatementsString;
			_.each(keywords, function(word) {
				var likeString = "(shops.name LIKE \"%" + word + "%\" OR " +
					"shops.address LIKE \"%" + word + "%\" OR " +
					"shops.city LIKE \"%" + word + "%\" OR " +
					"shops.zipcode LIKE \"%" + word + "%\" OR " +
					"chains.name LIKE \"%" + word + "%\")";
				likeStatements.push(likeString);
			});

			likeStatementsString = likeStatements.join(" AND ");

			var sql = "SELECT  shops.id,  shops.name AS shop_location,  shops.address,  shops.city,  shops.latitude,  shops.longitude,  chains.name AS shop_chain " +
				"FROM shops, chains " +
				"WHERE " + likeStatementsString +
			" AND shops.chainID = chains.id";
			conn.query(sql, ok(next, function(result) {
				conn.release();
				if(result.length>0) {
					res.json(200, result);
				} else {
					res.send(204);
				}
			}));
		}));
	}
};

exports.addLocation = function(req, res, next) {
	var uid		= req.signedCookies.onIdent;
	var shopId	= req.body.shopId;
	_hasLocation(uid, shopId, next)
		.then(function(result) {

			if(result) {
				res.send(304);
			} else {
				_saveLocation(uid, shopId, next)
					.then(function() {
						res.send(201);
					});
			}
		});
};


exports.removeLocation = function(req, res, next) {
	var uid		= req.signedCookies.onIdent;
	var shopId	= req.params.id;
	_hasLocation(uid, shopId, next)
		.then(function(result) {

			if(!result) {
				res.send(304);
			} else {
				db.getConnection(ok(next, function(conn) {
					conn.query("UPDATE locations SET ? WHERE ?", [{active: 0}, result], ok(next, function() {
						res.send(200);
					}));
				}));
			}
		});
};
exports.locationInfo = function(req, res, next) {};
