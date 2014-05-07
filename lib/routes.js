'use strict';

var index = require('./controllers');
var api = require('./controllers/api');

/**
 * Application routes
 */
module.exports = function (app) {



	// All undefined api routes should return a 404
	app.get('/api/*', function (req, res) {
		res.send(404);
	});

	// All other routes to use Angular routing in app/scripts/app.js
	app.get('/partials/*', index.partials);
	app.get('/*', index.index);
};