; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/zoomControl.html',
            restrict: 'E',
            scope: {
                activeStep: '='
            },
            controller: controller
        };
    };

    var dependencies = ['$rootScope', '$scope', 'engine', 'orbitControl'];

    var controller = function ($rootScope, $scope, engine, orbitControl) {

        var change2DZoom = function (direction) {
            engine.get().findComponentByType(ZoomCamera).zoomInOut(direction);
            $rootScope.$broadcast('updateWallSizeDialog');
        };

        var change3DZoom = function (direction) {
            var viewWallComponent = engine.get().findComponentByType(WallView);
            if (viewWallComponent.isInWallMode())
                viewWallComponent.zoom(direction);
            else {
                orbitControl.dolly(-direction);
            }
        };

        $scope.changeZoom = function (direction) {
            if ($scope.activeStep == 3) 
                change3DZoom(direction);
            else 
                change2DZoom(direction);
        };

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('zoomControl', directive);

})();
