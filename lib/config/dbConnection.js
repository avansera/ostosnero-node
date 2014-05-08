/**
 * Created by vivaldi on 8.5.2014.
 */

var userCtrl = require('../controllers/users');

module.exports = function(pool) {
	userCtrl.conn(pool);
};