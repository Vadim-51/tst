(function () {

    var directive = function (scene3D, engine3DSrvc, orbitControl) {
        return {
            restrict: 'E',
            templateUrl: '/views/step4-bottom-toolbar.html',
            replace: true,
            scope: {},
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

               // var viewWallComponent = engine3DSrvc.getEngine().findComponentByType(WallView);

                $scope.isInWallMode = false;

                $scope.visibleSteppp = function (step, index) {
                    //$scope.menuActiveStep = index;
                    $rootScope.$broadcast('changeStep', { index: index, step: step });
                    $rootScope.$broadcast('hidePrintPopup', '');
                };


                $scope.center = function () {
                    scene3D.centralizeCamera();
                };

                //var enterUnreg = viewWallComponent.on('enter', function () {
                //    $scope.isInWallMode = true;
                //});

                //var leaveUnreg = viewWallComponent.on('leave', function () {
                //    $scope.isInWallMode = false;
                //});

                $scope.$on('$destroy', function () {
                    //leaveUnreg();
                    //enterUnreg();
                });
            }]
        }
    };

    angular.module('vigilantApp').directive('step4BottomToolbar', ['scene3D', 'engine3DSrvc', 'orbitControl', directive]);
})();