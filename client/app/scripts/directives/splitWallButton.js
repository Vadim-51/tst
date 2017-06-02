; (function () {
    'use strict';

    var directive = function () {
        return {
            restrict: 'E',
            template: [
               '<img data-toggle="tooltip" data-placement="top" title="Split wall" alt="Split wall"',
                    ' ng-click="buttonClick()" src="images/tools/scissors.png" />'
            ].join(''),
            replace: true,
            scope : {},
            controller: controller
        }
    };

    var dependencies = ['$scope', 'engine'];

    var controller = function ($scope, engine) {

        $scope.buttonClick = function () {
            engine.get().findComponentByType(SplitWall).enable();
        };

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('splitWallButton', directive);

})();
