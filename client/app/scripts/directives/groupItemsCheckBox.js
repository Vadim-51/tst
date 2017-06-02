(function () {

    var directive = function () {
        return {
            template: '<div class="checkbox"><label><input type="checkbox" ng-model="grouped" ng-change="group(grouped);">Group items</label></div>',
            restrict: 'E',
            replace: true,
            scope: true,
            controller: ['$scope', '$rootScope', 'toastr', 'engine3DSrvc', function ($scope, $rootScope, toastr, engine3DSrvc) {

                // $scope.grouped = false;

                //var select3DComponent = engine3DSrvc.getEngine().findComponentByType(Select3D);

                $scope.group = function (val) {
                    var selectedObjects = select3DComponent.selectedObjects;
                    if (selectedObjects[0].userData.groupId) {
                        angular.forEach(selectedObjects, function (selObj) {
                            selObj.userData.groupId = 0;
                        })
                        toastr.info("Objects ungrouped");
                    }
                    else {
                        var id = Date.now(); // unique id for group
                        angular.forEach(selectedObjects, function (selObj) {
                            selObj.userData.groupId = id;
                        })
                        toastr.info("Objects grouped");
                    }

                    //$rootScope.$emit('groupItemsChange', val);
                    $scope.grouped = val;
                };

                //var groupItemsChangeUnregister = select3DComponent.on('groupSelect', function (val) {
                //    $scope.grouped = val;
                //    $scope.$applyAsync();
                //});

                $scope.$on('$destroy', function () {
                    //groupItemsChangeUnregister();
                });

            }]
        }
    };

    angular.module('vigilantApp').directive('groupItemsCheckBox', directive);
})();