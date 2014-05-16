angular.module('App.Controllers').controller('LoginCtrl', function($q, $http, $scope, $rootScope, $location, $accountsService) {
    console.log('login controller');

    $scope.error = false;
    console.log($scope.loginForm);


    $scope.hideError = function() {
        $scope.loginForm.$error.message = null;
    };


    $scope.submit = function() {
        var user = $scope.loginUser,
            pass = $scope.loginPass,
            formLogin;

        $scope.loginForm.$setDirty();

        console.log($scope.loginForm);
        console.log($scope.loginForm.$error);
        if (!user || user.length === 0) {
            $scope.loginForm.$error.message = "Email not entered";
        }
        else if (!pass || pass.length === 0) {
            $scope.loginForm.$error.message = "Password not entered";
        } else {

            //toggleSpinner($('#login-form button[type="submit"]'));
			$scope.busy = true;

            formLogin = $accountsService.login(user, pass);

            formLogin.then(
				function(status) {
					$scope.busy = false;
					/**
					 * if login api returns errors,
					 * set the scope error message to the
					 * error received...
					 *
					 * this will then be shown as an alert label in the view.
					 */
					//toggleSpinner($('#login-form button[type="submit"]'));
					if (!!status.error) {
						$scope.loginForm.$error.message = status.error;
					}
					else {
						$rootScope.auth = true;
						$location.path('/list/');

					}
            },
			function(reason) {
				$scope.busy = false;
                //toggleSpinner($('#login-form button[type="submit"]'));
				if(reason.err) {
					switch(reason.err) {
						case "ERR_PASS_NOMATCH":
							$scope.loginForm.$error.message = "Wrong password";
							break;
					}
				} else {
					$scope.loginForm.$error.message = reason;
				}

            });

        }

    }

});