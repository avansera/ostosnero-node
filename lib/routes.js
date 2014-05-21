'use strict';

var index		= require('./controllers');
var users		= require('./controllers/users');
var products	= require('./controllers/products');
var locations	= require('./controllers/locations');
var lists		= require('./controllers/lists');
var sort		= require('./controllers/lists/sort.js');
var log			= require('npmlog');

var checkSession = function(req, res, next) {
	log.info('Check', "checking session");
	if(!req.signedCookies.onIdent) res.send(410, "ERR_NOSESSION");
	else next();
};

/**
 * Application routes
 */
module.exports = function (app) {

	app.get('/test/userinfo/:id', users.userInfo);

	// users
	app.get('/api/user/session', users.session);
	app.post('/api/user/login', users.login);
	app.post('/api/user/register', users.register);
	app.get('/api/user/logout', users.logout);

	// products
	app.get('/api/product/:id', checkSession, products.productInfo);
	app.get('/api/product/search/:term', checkSession, products.search);
	app.get('/api/product/prices/:id/:lat/:long', checkSession, products.productPrices);
	app.put('/api/product/prices/update', checkSession, products.updateProductPrice);
	/*
	 */

	// Lists
	app.get('/api/list', checkSession, lists.userList);
	app.put('/api/list/add', checkSession, lists.addToList);
	app.delete('/api/list/remove/:listItemId', checkSession, lists.removeFromList);
	app.put('/api/list/quantity', checkSession, lists.updateQuantity);
	app.get('/api/list/sort/:lat/:long', checkSession, sort.sort);
	/*
	app.put('/api/list/quantity/:id/:quant');
	app.get('/api/list/sort');
	app.get('/api/list/sort/:lat/:long');
	 */

	// Location

	//app.get('/api/location/info/:lat/:long');
	app.get('/api/location/search/:term', checkSession, locations.searchLocations);
	/*
	app.get('/api/location/saved');
	app.put('/api/location/add');
	app.delete('/api/location/remove/:id');*/
	app.get('/api/location/stores/:lat/:long', checkSession, locations.surroundingStores);
	app.get('/api/location/saved', checkSession, locations.savedLocations);

	// All undefined api routes should return a 404
	app.get('/api/*', function (req, res) {
		res.send(404);
	});

	// All other routes to use Angular routing in app/scripts/app.js
	app.get('/partials/*', index.partials);
	app.get('/*', index.index);
};