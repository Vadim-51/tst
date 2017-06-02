(function () {

    var directive = function () {
        return {
            template: '<div class="btn btn-default width100" ng-model="grouped" ng-click="undo();"><label>Undo</label></div>',
            restrict: 'E',
            replace: true,
            scope: true,
            controller: ['$scope', 'toastr', 'object3DPositionHistory', function ($scope, toastr, object3DPositionHistory) {

                $scope.undo = function () {
                    if (object3DPositionHistory.pop()) toastr.info("Last move undone");
                };
            }]
        }
    };

    angular.module('vigilantApp').directive('undoButton', directive);
})();