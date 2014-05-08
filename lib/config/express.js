'use strict';

var express	= require('express');
var path	= require('path');
var config	= require('./config');
var log		= require('npmlog');
var validator = require('express-validator');

/**
 * Express configuration
 */
module.exports = function (app) {
	app.configure('development', function () {
		app.use(require('connect-livereload')());

		// Disable caching of scripts for easier testing
		app.use(function noCache(req, res, next) {
			if (req.url.indexOf('/scripts/') === 0) {
				res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
				res.header('Pragma', 'no-cache');
				res.header('Expires', 0);
			}
			next();
		});

		app.use(express.static(path.join(config.root, '.tmp')));
		app.use(express.static(path.join(config.root, 'app')));
		app.set('views', config.root + '/app/views');
	});

	app.configure('production', function () {
		app.use(express.compress());
		app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
		app.use(express.static(path.join(config.root, 'public')));
		app.set('views', config.root + '/views');
	});

	app.configure(function () {
		app.use(express.cookieParser("N7D0upj/oYCAqsm1BRHbPyjqK%VLAds5Qp0W"));
		app.use(express.session({secret: "GOCx%de448SDcw8uBS4t&385B=jfCe%haZzd"}));
		app.use(validator());
		app.engine('html', require('ejs').renderFile);
		app.set('view engine', 'html');
		app.use(require('express-domain-middleware'));
		app.use(express.logger('dev'));
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(express.methodOverride());
		// Router (only error handlers should come after this)
		app.use(app.router);
		app.use(function errorHandler(err, req, res, next) {
			log.warn('ERR', process.domain.id, req.method, req.url, err);
			res.send(500, "Server error");
		});
	});

	/*// Error handler
	app.configure('development', function () {
		app.use(express.errorHandler());
	});*/
};