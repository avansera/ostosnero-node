/**
 * Created by vivaldi on 21.2.2014.
 */

angular.module('App.Directives')
	.directive('onAlert', function($timeout, $log) {

		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="alert {{ alert.type }}" ng-if="visible" ng-animate="\'alert\'">{{ alert.message }}</div>',
			scope: {
				alert: '='
			},
			link: function(scope, elem, attrs) {

				scope.visible = false;//scope.error.hasOwnProperty('message');
				$log.debug('onAlert', "alert should show?", scope.visible, scope.alert);
				scope.$watch('alert', function(newValue, oldValue) {

					$log.debug('onAlert', "scope watcher for scope.error", oldValue, newValue);

					if(!!newValue) {
						scope.visible = true;
						if(scope.alert.type !== 'error') {
							$timeout(function(){
								//$animate.leave(elem);
								scope.visible = false;
							}, 2000);
						}
					}
				});


				/*if(scope.visible) {
					$animate.enter(elem.parent());

				}*/
			}
		}
	});