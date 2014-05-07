angular.module('App.Controllers').controller('RegisterCtrl', function ($scope, $http, $q, $accountsService) {



	//console.log(email);
	console.log($scope.signupForm);

	$scope.loading = false;

	$scope.hideError = function () {
		$scope.signupForm.$error.message = null;
	};
	/*
	 if (pass.length > 0 && pass.length < 6) {
	 $scope.passInput.error = true;
	 } else {
	 $scope.passInput.error = false;
	 }*/


	$scope.submit = function () {
		var email = $scope.registerEmail,
			username = $scope.registerUser,
			pass = $scope.registerPass,
			formLogin;
		$scope.loading = true;

		console.log($scope.signupForm);

		$scope.signupForm.$setDirty();

		if (!email || email.length === 0) {
			$scope.signupForm.$error.message = "Sähkopostiosoite puuttuu";

		}
		else if (!username || username.length === 0) {
			$scope.signupForm.$error.message = "no username entered";
		}
		else if (!pass || pass.length === 0) {
			$scope.signupForm.$error.message = "no password entered";
		} else {


			$accountsService.signup(email, username, pass)
				.then(
					function (status) {
						$scope.loading = false;
						$accountsService.login(email, pass)
							.then(function () {
								location.reload();
							});
					},
					function (reason) {
						$scope.loading = false;
						$scope.signupForm.$error.message = reason;

					});
		}

		if (!!$scope.signupForm.$error.message) {
			$scope.loading = false;
		}
	};
});