/**
 * Created by vivaldi on 5.12.2013.
 */

angular.module('App.Services')
	.factory('locationService', function ($q, $http, $rootScope, $log)
	{
		return {
			init: function ()
			{

			},
			location: {
				latitude: 0,
				longitude: 0,
				string: ''
			},
			status: function ()
			{
				var enabled = false;
				if (navigator.geolocation) {
					enabled = true;
				}

				return enabled;
			},
			getCurrentLocation: function ()
			{

				/**
				 * check geolocation support
				 */
				if (navigator.geolocation) {
					var dfd = $q.defer();
					navigator.geolocation.getCurrentPosition(
						function (position)
						{
							$rootScope.$apply(function ()
							{
								$rootScope.location = {
									"latitude": position.coords.latitude,
									"longitude": position.coords.longitude
								};
								dfd.resolve(position);
							});
						},
						function (err)
						{
							$rootScope.$apply(function ()
							{
								dfd.reject(err);
							});
						},
						{timeout: '6000'}
					);
					console.log('returning location');
				} else {
					error('location services not supported, sorry');
				}
				return dfd.promise;
			},
			getAddress: function (lat, long)
			{
				var dfd = $q.defer();
				$http({
					url: '../../api/location/info/' + lat + '/' + long,
					method: 'get'
				})
					.success(function (data)
					{
						dfd.resolve(data);
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			searchLocation: function (term)
			{
				var dfd = $q.defer();

				$http({
					url: "../../api/location/search/" + term,
					method: "GET"
				})
					.success(function(data, status)
					{
						if(status === 204) {
							dfd.reject("ERR_NO_RESULTS");
						}

						mixpanel.track("Location search", {
							"term": term
						});
						dfd.resolve(data);
					})
					.error(function (reason)
					{
						$log.warn('ERR:', "location search failed ", reason);
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			addChosen: function (location)
			{
				var dfd = $q.defer();

				$http({
					url: '../../api/location/add/' + location.id,
					method: 'get'
				})
					.success(function (status)
					{
						if (!status.success) {
							dfd.reject(status.error);
						}

						mixpanel.track("Add location", {
							"location_id": location.id
						});
						dfd.resolve();
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			removeFromChosen: function (location)
			{
				var dfd = $q.defer();

				$http({
					url: '../../api/location/remove/' + location.id,
					method: 'get'
				})
					.success(function (status)
					{
						if (!status.success) {
							dfd.reject(status.error);
						} else {
							dfd.resolve();
						}
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			getChosen: function() {
				var dfd = $q.defer();

				$http({
					url: '../../api/location/saved',
					method: 'get'
				})
					.success(function (data)
					{
						if (!data.success) {
							dfd.reject(data.error);
						} else {
							dfd.resolve(data.data);
						}
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			favoriteLocation: function (location)
			{

			}
		};
	});
