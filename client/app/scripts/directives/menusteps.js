'use strict';

/**
 * @ngdoc directive
 * @name vigilantApp.directive:menuSteps
 * @description
 * # menuSteps
 */
angular.module('vigilantApp').directive('menuSteps',['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		restrict: 'A',
		controller: function ($scope) {
		},
		templateUrl: 'views/horizontalMenuSteps.html',
		link: function postLink(scope, element, attrs) {
			scope.nameStep = attrs.namestep;
			scope.numberStep = attrs.numberstep;

			scope.visibleSteppp = function (step) {
				$rootScope.$broadcast('changeStep', step);
			};
		}
	};
}]);
