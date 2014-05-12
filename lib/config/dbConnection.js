/**
 * Created by vivaldi on 8.5.2014.
 */

var userCtrl		= require('../controllers/users');
var productsCtrl	= require('../controllers/products');

module.exports = function(pool) {
	userCtrl.conn(pool);
	productsCtrl.conn(pool);
};