angular.module('App.Controllers').controller('LoginCtrl', function($q, $http, $scope, $rootScope, $location, $accountsService) {
    console.log('login controller');

    $scope.error = false;
    console.log($scope.loginForm);



    /**
     * function to submit login information to server
     *
     * @param user(string): user id, either email or username
     * @param pass(string): given user password
     *
     * @returns deferred promise
     */
    function login(user, pass)
    {
        var dfd = $q.defer();
        console.log(user + ", " + pass);
        $http({
            method: 'GET',
            url: '../../api/login/',
            params: {email: user, password: pass}
        })
            .success(function(data) {
                console.log(data);

                /**
                 * if the 'success' json attribute is not found,
                 * it is assumed that the returned value is an sql or php error.
                 * The response to this would be to display a server error message.
                 *
                 */
                if (data.success === undefined) {
                    dfd.reject('No connection to server could be made');
                } else {
                    dfd.resolve(data);
                }

            })
            .error(function(e) {
                console.log(e);
                dfd.reject();
            });
        return dfd.promise;

    }

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
						$location.path('/list/'/* + status.active_list*/);

					}
            },
			function(reason) {
				$scope.busy = false;
                //toggleSpinner($('#login-form button[type="submit"]'));
                $scope.loginForm.$error.message = reason;
            });

        }

    }

});