'use strict';

var index		= require('./controllers');
var users		= require('./controllers/users');
var products	= require('./controllers/products');
var locations	= require('./controllers/locations');

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
	app.get('/api/product/:id', products.productInfo);
	app.get('/api/product/search/:term', products.search);
	/*
	app.get('/api/product/prices/:id/:lat/:long');
	app.put('/api/product/prices/update/:id/:shopId/:price');


	// Lists
	app.get('/api/list');
	app.put('/api/list/add/:id');
	app.put('/api/list/quantity/:id/:quant');
	app.delete('/api/list/remove/:id');
	app.get('/api/list/sort');
	app.get('/api/list/sort/:lat/:long');

	// Location

	app.get('/api/location/stores/:lat/:long');
	app.get('/api/location/info/:lat/:long');
	app.get('/api/location/search/:term');
	app.get('/api/location/saved');
	app.put('/api/location/add/:id');
	app.delete('/api/location/remove/:id');*/
	app.get('/api/location/stores/:lat/:long', locations.surroundingStores);
	app.get('/api/location/saved', locations.savedLocations);

	// All undefined api routes should return a 404
	app.get('/api/*', function (req, res) {
		res.send(404);
	});

	// All other routes to use Angular routing in app/scripts/app.js
	app.get('/partials/*', index.partials);
	app.get('/*', index.index);
};