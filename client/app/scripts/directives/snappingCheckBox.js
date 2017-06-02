;(function () {

    var directive = function () {
        return {
            template: '<div class="checkbox"><label><input type="checkbox" ng-model="disableSnapping" ng-change="changed(disableSnapping)">Disable snapping</label></div>',
            restrict: 'E',
            replace: true,
            scope: true,
            controller: controller
        }
    };

    var dependencies = ['$scope', '$rootScope', 'appSettings', 'toastr'];

    var controller = function ($scope, $rootScope, appSettings, toastr) {

        $scope.changed = function (val) {
            appSettings.setIsDisableSnapping(val);
            $rootScope.$emit('disableSnappingChange', val);
            if (val) toastr.info("Snapping disabled");
            else toastr.info("Snapping enabled");
        };

        var wallNumbersChangeUnregister = $rootScope.$on('disableSnappingChange', function (event, val) {
            $scope.disableSnapping = val;
        });

        $scope.$on('$destroy', function () {
            wallNumbersChangeUnregister();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('snappingCheckBox', directive);
})();