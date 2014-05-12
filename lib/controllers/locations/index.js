/**
 * Created by vivaldi on 12.5.2014.
 */
var ok		= require('okay');
var log		= require('npmlog');
var q		= require('q');
var _		= require('underscore');
var db		= null;



exports.conn = function(pool) {
	db = pool;
};


function _getSurroundingStores(lat, long, next) {
	var dfd = q.defer();


	db.getConnection(ok(next, function(conn) {

		var sql = "SELECT  shops.id,  shops.name AS shop_location,  shops.address,  shops.city,  shops.latitude,  shops.longitude,  chains.name AS shop_chain," +
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
		var sql = "SELECT shops.id, chains.name as shop_chain, shops.name as shop_location, " +
			"shops.address, shops.city, shops.latitude, shops.longitude, shops.zipcode " +
			"FROM locations, shops, chains " +
			"WHERE chains.id = shops.chainID " +
			"AND locations.shopid = shops.id " +
			"AND locations.userid = " + conn.escape(user) + " " +
			"AND locations.active = 1";

		conn.query(sql, ok(next, function(result) {
			conn.release();
			if(!!result.length) {
				dfd.resolve(result);
			} else {
				dfd.reject();
			}
		}));
	}));

	return dfd.promise;
}

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
	return _getSavedLocations(uid, next);
};

exports.savedLocations = function(req, res, next) {
	if(!req.signedCookies.onIdent) {
		log.info("forbuden");
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


exports.addLocation = function(req, res, next) {};
exports.removeLocation = function(req, res, next) {};
exports.locationInfo = function(req, res, next) {};
