'use strict';




    /**
     * main controller handles starting the app. It runs a login status check to determine whether the user is
     * still logged in, and if so directs them to their lists. If not, it shows the start screen.
     *
     * functions in this controller are:
     * - checkLogin: refer to the API to determine the login status of the user, returning user information if true or 'false' if not.
     *
     * -
     */
    angular.module('App.Controllers').controller('MainCtrl', function ($q, $http, $scope, $rootScope, $location) {
         console.log('loaded: ' + $rootScope.loaded);
        /**
         * Function to check for network connection.
         * Although it should be obvious if there is any due to the app being a website
         * in the first place, and hense not being able to open without a connection,
         * this would be useful to prepare for any future offline-capable versions.
         *
         * It also checks for a connection to the server too, which would be useful in any situation.
         */
        function hasConnection() {
            /**
             * if it is certain there is no network available, e.g. if the device's network access
             * has been switched off.
             */
            if (!window.navigator.onLine) {
                $scope.connError = "No network access, check wifi and/or packet data is enabled";
            }
            /**
             * devices settings allow network access,
             * now to check if there is actually any connection
             */
            else {
                $http({
                    method: "GET",
                    url: "../../api/conn",
                    timeout: 5000
                })
                    .success(function (data) {
                        /**
                         * there is a connection, there's no need to do anything
                         * at this stage so just keep everything going as it
                         * should be
                         */
                        console.log(data);
                    })
                    .error(function (e) {
                        console.log(e);
                        $scope.connError = "Could not reach the server, "
                    });
            }
        }

        if (!!$rootScope.auth) {
            console.log('redir to list');
            $location.path('/list');
        }

    });



