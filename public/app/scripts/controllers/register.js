angular.module('App.Controllers').controller('RegisterCtrl', function ($scope, $http, $q, $accountsService) {



	//console.log(email);
	console.log($scope.signupForm);

	$scope.loading = false;
	$scope.formValid = false;

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
			$scope.signupForm.$error.message = "Email address missing";

		}
		else if (!username || username.length === 0) {
			$scope.signupForm.$error.message = "Username is missing";
		}
		else if (!pass || pass.length === 0) {
			$scope.signupForm.$error.message = "Password is empty";
		}
		else if(pass.length < 6) {
			$scope.signupForm.$error.message = "Password must be at least 6 characters";
		}
		else {


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
						switch(reason.err) {
							case "ERR_EMAIL_EXISTS":
								$scope.signupForm.$error.message = "Email is already registered";
								break;
						}


					});
		}

		if (!!$scope.signupForm.$error.message) {
			$scope.loading = false;
		}
	};
});