;(function () {

    var directive = function () {
        return {
            template: '<div class="checkbox"><label><input type="checkbox" ng-model="hideWallNumber" ng-change="changed(hideWallNumber)">Hide wall id</label></div>',
            restrict: 'E',
            replace: true,
            scope: true,
            controller: controller
        }
    };

    var dependencies = ['$scope', 'scene3D', '$rootScope', 'wallNumberSrvc', 'engine3DSrvc'];

    var controller = function ($scope, scene3D, $rootScope, wallNumberSrvc, engine3DSrvc) {

       // var wallNumbersComponent = engine3DSrvc.getEngine().findComponentByType(WallNumbersUpdate);

        $scope.changed = function (val) {
            wallNumberSrvc.setIsVisible(!val);
            // wallNumbersComponent.setVisibility(!val);
            wallNumberSrvc.setVisibility(!val);
            $rootScope.$emit('wallIdVivibilityChange', val);
        };

        var wallNumbersChangeUnregister = $rootScope.$on('wallIdVivibilityChange', function (event, val) {
            $scope.hideWallNumber = val;
        });

        $scope.$on('$destroy', function () {
            wallNumbersChangeUnregister();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('wallIdCheckBox', directive);
})();