; (function () {
    'use strict';
      ///
    var directive = function () {
        return {
            templateUrl: 'views/sizeUnitButton.html',
            restrict: 'E',
            scope: {},
            controller: controller
        };
    };

    var dependencies = ['$scope', '$rootScope', 'appSettings', 'constants'];

    var controller = function ($scope, $rootScope, appSettings, constants) {

        $scope.sizeUnits = constants.SizeUnit.FT;

        $scope.buttons = [
            {
                text: 'FT',
                value: constants.SizeUnit.FT
            },
            {
                text: 'CM',
                value: constants.SizeUnit.CM
            }
        ];

        $scope.sizeUnitsChange = function (units, e) {
            e.preventDefault();
            e.stopPropagation();

            $scope.sizeUnits = units.value;

            appSettings.setSizeUnits(units.value);

            $rootScope.$broadcast('changeUnitLengthForWall', units.value);
            $rootScope.$broadcast('updateWallSizeDialog');
        };
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('sizeUnitsButton', directive);

})();
