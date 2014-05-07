angular.module('App.Controllers')
	.controller('MapCtrl', function ($scope, $routeParams, $http, $q, angulargmContainer)
{

	var lat = $routeParams.lat,
		long = $routeParams.long,
		id = "map";


	$scope.options = {
		center: new google.maps.LatLng(lat, long),
		zoom: 14
	};

	// TODO: vary page title depending if current location or around specified location
	$scope.pageTitle = "Lähimmät kaupat";
	function getStoreMarkers()
	{

		var dfd = $q.defer();

		$http({
			url: '../../api/location/' + lat + '/' + long,
			method: 'get'
		})
			.success(function (stores)
			{
				dfd.resolve(stores.data);
			})
			.error(function (reason)
			{
				dfd.reject(reason);
			});
		return dfd.promise;
	}


	function buildMarkers(status) {
		var markers = [];
		var shopsArray = [];


		for (var shop in status) {
			shopsArray.push(shop);
			//var shop = status[shop];

			var latLong = new google.maps.LatLng(status[shop].latitude, status[shop].longitude),
				latitude = status[shop].latitude,
				longitude = status[shop].longitude;


			var pin = "d_map_pin_letter";
			var pinText = "%E2%80%A2";
			var pinColour = "FE7569";
			var pinTextColour = "333333";

			switch (status[shop].shop_chain.toLowerCase()) {
				case 'alepa':
					pinText = "a";
					pinColour = "FFEC01";
					pinTextColour = "E20012";
					break;
				case 'k-market' :
					pinText = "K";
					pinColour = "0038A8";
					pinTextColour = "FFFFFF";
					break;
				case 'k-supermarket' :
					pinText = "K";
					pinColour = "0038A8";
					pinTextColour = "FFFFFF";
					break;
				case 'k-citymarket' :
					pinText = "K";
					pinColour = "0038A8";
					pinTextColour = "FFFFFF";
					break;
				case 'k-extra' :
					pinText = "K";
					pinColour = "0038A8";
					pinTextColour = "FFFFFF";
					break;

				case 'm-ketju' :
					pinText = "M";
					pinColour = "B7001C";
					pinTextColour = "f7f7f7";
					break;
				case 's-market' :
					pinText = "S";
					pinColour = "FFEC01";
					pinTextColour = "0038A8";
					break;
				case 'lidl' :
					pinText = "L";
					pinColour = "181884";
					pinTextColour = "FCE216";
					break;
				case 'stockmann' :
					pinText = "S";
					pinColour = "266D4F";
					pinTextColour = "f7f7f7";
					break;
				case 'prisma' :
					pinText = "P";
					pinColour = "009156";
					pinTextColour = "f7f7f7";
					break;
				case 'siwa' :
					pinText = "s";
					pinColour = "F7F7F7";
					pinTextColour = "006CA9";
					break;
				case 'valintatalo' :
					pinText = "V";
					pinColour = "F57840";
					pinTextColour = "F7F7F7";
					break;

				case 'motorest' :
					pin = "d_map_pin_icon";
					pinText = "petrol";
					pinColour = "F57840";
					pinTextColour = "F7F7F7";
					break;
				case 'neste oil' :
					pin = "d_map_pin_icon";
					pinText = "glyphish_fuel";
					pinColour = "F57840";
					pinTextColour = "F7F7F7";
					break;


			}

			var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=" + pin + "_withshadow&chld=" + pinText + "|" + pinColour + "|" + pinTextColour,
				new google.maps.Size(21, 34),
				new google.maps.Point(0, 0),
				new google.maps.Point(10, 34));
			var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
				new google.maps.Size(40, 37),
				new google.maps.Point(0, 0),
				new google.maps.Point(12, 35));
			/*markers.push(new google.maps.Marker({
			 position: latLong,
			 icon: pinImage,
			 shadow: pinShadow,
			 title:status[shop].shopName + " " + status[shop].chainName,
			 animation: google.maps.Animation.DROP
			 }));*/


			markers.push({
				latitude: latitude,
				longitude: longitude,
				icon: "http://chart.apis.google.com/chart?chst=" + pin + "_withshadow&chld=" + pinText + "|" + pinColour + "|" + pinTextColour,
				shadow: "http://chart.apis.google.com/chart?chst=d_map_pin_shadow"
			})

		}

		return markers
	}


	angulargmContainer.getMapPromise('map').then(function(map) {
		var GeoMarker = new GeolocationMarker(map);
		getStoreMarkers().then(
			function (status)
			{
				console.log(buildMarkers(status));
				angular.extend($scope, {
					markers: buildMarkers(status) // an array of markers,
				});

			});
	});

	var mapScope = angular.copy($scope.map);

	$scope.getMap = function(map) {
		console.log("get map");
		console.log(map);
	};

	//var GeoMarker = new GeolocationMarker();
	console.log($scope.map);
	google.maps.visualRefresh = true;
	angular.extend($scope, {
		center: {
			latitude: lat, // initial map center latitude
			longitude: long // initial map center longitude
		},
		zoom: 14 // the zoom level
	});


});

