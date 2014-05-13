/**
 * Created by vivaldi on 8.5.2014.
 */

var userCtrl		= require('../controllers/users');
var productsCtrl	= require('../controllers/products');
var locationsCtrl	= require('../controllers/locations');
var listsCtrl		= require('../controllers/lists');

module.exports = function(pool) {
	userCtrl.conn(pool);
	productsCtrl.conn(pool);
	locationsCtrl.conn(pool);
	listsCtrl.conn(pool);
};