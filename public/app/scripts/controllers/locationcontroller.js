angular.module('App.Controllers').controller('LocationCtrl', function($scope, $rootScope, $q, $http, $location, $log, storage, locationService, AlertService) {
    $log.debug('ROUTE:', "Location controller");

    $scope.page = {
        title: "Location"
    };

	$scope.errors 					= [];
    $scope.currentLocation 			= "Fetching location...";
    $scope.gettingCurrentLocation	= false;
	$scope.currentLocationEnabled 	= true;
	$scope.locations 				= [];
	$scope.gettingLocations 		= false;
	$scope.locationError			= false;

	locationService.getCurrentLocation().then(
		function(position) {
			$scope.gettingCurrentLocation = false;
			$rootScope.location = {latitude:position.coords.latitude, longitude:position.coords.longitude};
			console.log($scope.currentCoords);
		}
	);

	$scope.openMap = function(location) {
		console.log(location);
		if(!!location) {
			$location.path('/location/map/' + location.latitude + '/' + location.longitude);
		} else {
			$location.path('/location/map/' + $scope.location.latitude + '/' + $scope.location.longitude);
		}
	};

	$scope.searchLocation = function() {

		var term = $scope.locationTerm;

		if (term.length > 0) {
			$log.debug("Location search term", term);
			//term = term.split(/[ ]{1,}/).join('|');
		} else {
			$log.warn("missing location term");
			//$scope.errors.push("Nothing to search for");
			AlertService.set('info', "nothing to search for");

		}

		$location.path('/location/search/' + term);
	};

	$scope.getChosen = function() {
		$scope.gettingLocations = true;
		locationService.getChosen().then(
			function(locations) {
				$scope.gettingLocations = false;
				$scope.chosenLocations = locations;

			},
			function(reason) {
				$scope.gettingLocations = false;
				//$scope.errors.push(reason);
				AlertService.set('warning', reason);
			}
		);
	};
	$scope.getChosen();


    /**
     * Check whether the location has already been found and
     * has been stored in the local storage.
     *
     * @returns {boolean}
     * @private
     */
    function _hasLocation() {
        var hasLocation = false;

        if ($rootScope.location.latitude && $rootScope.location.longitude) {
            hasLocation = true;
        }

        return hasLocation;
    }




    /**
     * function to find the user's address using their coordinates, if they have been found.
     *
     * @private
     */
    function _initCurrentLocation() {
        if (_hasLocation()) {
            var addressPromise = locationService.getAddress($rootScope.location.latitude, $rootScope.location.longitude);
			$scope.gettingCurrentLocation = true;
            /*
             * Once the lat and long has been found,
             * use those values to find the street address using google's location api.
             */
            addressPromise.then(
                function(address) {
                    console.log(address);
                    $scope.currentLocation = address;
                    locationService.location.string = address;
                    console.log();
					$scope.gettingCurrentLocation = false;

                },
                function(reason) {
					$scope.gettingCurrentLocation = false;
                    console.log(reason);
                }
            );
        }
    }




    /**
     * Refresh the user's location, including
     * finding new coordinates and their address which
     * is parsed though Google's location API
     *
     * intended to be activated using the refresh button in the 'current location' item
     *
     * @private
     */
    function _getLocation() {

        var pos =  locationService.getCurrentLocation();
        /*
         *  when the current location has been found (asynchronously as it happens)
         *  store the recovered latitude and longitude in the localstorage
         */

		$scope.gettingCurrentLocation = true;

        pos.then(
            function(status) {
				$rootScope.location.latitude 	= status.coords.latitude;
				$rootScope.location.longitude 	= status.coords.longitude;

                /*
                 * Once the lat and long has been found,
                 * use those values to find the street address using google's location api.
                 */
                var addressPromise = locationService.getAddress(status.coords.latitude, status.coords.longitude);
                addressPromise.then(
                    function(address) {
                        console.log(address);
                        $scope.currentLocation = address;

						$scope.gettingCurrentLocation = false;

                    },
                    function(reason) {
						$scope.gettingCurrentLocation = false;
                        console.log(reason);
                    }
                );
            },
            function(reason) {
                console.log(reason);
                console.log('promise fail reason received');
				$scope.gettingCurrentLocation = false;
                switch (reason.code) {
					case 1:
                        // permission denied TODO: de-jquery it
                        $scope.locationError = 'warning';
                        $scope.currentLocation = "Location services not allowed";
                        break;
                    case 2:
                        // position unavailable TODO: de-jquery it
						$scope.locationError = 'error';
                        $scope.currentLocation = "Could not find location";
                        break;
                    case 3:
                        // Timeout TODO: de-jquery it
						$scope.locationError = 'error';
                        $scope.currentLocation = "Could not find location";
                        break;

                }
            }
        );

    }


    /*
     * when the 'refresh location' button is activated
     */
    $scope.refreshLocation = function() {
        _getLocation();
    };

    /*
     * Init the location
     */
    if ($location.url('/location')) {
        _initCurrentLocation();
    }

	$scope.toggleCurrentLocation = function() {

		$scope.currentLocationEnabled = !$scope.currentLocationEnabled;
	};

	$scope.removeLocation = function(location) {
		var locationsTemp;
		$log.info('remove location');
		location.busy = true;
		locationService.removeFromChosen(location)
			.then(
				function(status) {
					location.success = true;
					location.busy = false;

				},
				function(reason) {
					$scope.errors.push(reason);
					location.busy = false;
				});

		$scope.getChosen();
	};

})
	.controller('LocationSearchCtrl', function($scope, $routeParams, $log, locationService, AlertService) {
		var term = $routeParams.term;

		locationService.searchLocation(term)
			.then(
				function(data) {
					$log.debug(data);
					$scope.locations = data;
				},
				function(reason) {
					AlertService.set('warning', reason);
				}
			);

		// determine the logo asset to load based on chain name
		$scope.logo = function(chain) {
			var url;

			chain = chain.toLowerCase();

			switch(chain) {
				case 'prisma':
					url = 'prisma';
					break;
				case 's-market':
					url = 'smarket';
					break;
				case 'k-market':
					url = 'kmarket';
					break;
				case 'k-citymarket':
					url = 'kcitymarket';
					break;
				case 'k-supermarket':
					url = 'kmarket';
					break;
				case 'siwa':
					url = 'siwa';
					break;
				case 'alepa':
					url = 'alepa';
					break;
				case 'valintatalo':
					url = 'valintatalo';
					break;
				case 'lidl':
					url = 'lidl';
					break;
				case 'k-extra':
					url = 'kmarket';
					break;

				case 'm-ketju':
					url = 'm-kauppa';
					break;

				case 'motorest':
					url = 'motorest';
					break;

				case 'stockmann':
					url = 'stockmann';
					break;

				case 'neste':
					url = 'neste';
					break;

				case 'sale':
					url = 'sale';
					break;


			}

			return './images/logos/chains/' + url + '.jpg';
		};

		$scope.addLocation = function(location) {


			location.busy = true;

			locationService.addChosen(location).then(
				function(status) {
					location.success = true;
					location.busy = false;
				},
				function(reason) {
					//$scope.errors.push(reason);
					AlertService.set('warning', reason);
					location.busy = false;
				}
			);


		};


	});