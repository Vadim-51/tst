'use strict';

/**
 * @ngdoc directive
 * @name vigilantApp.directive:ftin
 * @description
 * # ftin
 */
angular.module('vigilantApp').directive('ftin', ['scene3D',function (scene3D) {
	return {
		templateUrl: 'views/ftin.html',
		restrict: 'A',
		scope: {},
		controller: function ($scope, $rootScope) {

		},
		link: function postLink(scope, element, attrs) {

			scope.$on('updateTableCM', function () {

				convertCMtoFT();

			});

			scope.focusOnWall = function (wallIndex) {
			    scene3D.focusOnWall('Wall ' + wallIndex);
			};

			function convertCMtoFT() {
				scope.wallName = attrs.wallname;
				scope.width = attrs.width;
				scope.index = parseInt(attrs.line);
				scope.wallNumber = attrs.wallnumber;

				//from CM to FT   152 === 4' 11"
				var convert = scope.width * 0.3937008;
				var FT = convert / 12;
				FT = Math.floor(FT);
				var dif = convert / 12 - FT;
				var INCH = dif / (1 / 12);
				INCH = INCH.toFixed(1);
        INCH = parseFloat(INCH);
        scope.wallLength = FT + "' " + INCH + '"';
			}

			// execution convert
			convertCMtoFT();
		}
	};
}]);
