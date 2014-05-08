'use strict';


var cluster	= require('cluster');
var log		= require('npmlog');
log.enableColor();

if (cluster.isMaster) {
	log.info('Cluster', "setting up master thread");
	// Count the machine's CPUs
	var cpuCount = require('os').cpus().length;

	// Create a worker for each CPU
	for (var i = 0; i < cpuCount; i += 1) {
		cluster.fork();
		log.info('Cluster', "Forking worker " + (i+1));
	}

// Code to run if we're in a worker process
} else {

	var express = require('express');
	var mysql = require('mysql');
	var dbConfig = require('./lib/config/dbConf.json');
	var pool = mysql.createPool(dbConfig);

	/**
	 * Main application file
	 */

	// Set default node environment to development
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';

	// Application Config
	var config = require('./lib/config/config');

	var app = express();

	// Express settings
	require('./lib/config/express')(app);

	require('./lib/config/dbConnection')(pool);

	// Routing
	require('./lib/routes')(app);

	// Start server
	app.listen(config.port, function () {
		console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
	});

	// Expose app
	exports = module.exports = app;
}


// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker ' + worker.id + ' has died', "Goodnight, sweet prince.");
	cluster.fork();

});

