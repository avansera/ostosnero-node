/**
 * Created by vivaldi on 26.2.2014.
 */

angular.module('App.Services')
	.factory('AlertService', function($rootScope) {
		// reset error just because
		$rootScope.alert = false;

		function _setError(type, message) {
			$rootScope.alert = {"type": type, "message": message};
		}

		function _clearError() {
			$rootScope.alert = false;
		}

		return {
			set		: _setError,
			clear	: _clearError
		}
	});