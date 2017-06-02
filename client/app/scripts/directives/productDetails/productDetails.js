; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/productDetailsNew.html',
            restrict: 'E',
            scope: {},
            controller: controller
        };
    };

    var dependencies = ['$scope', '$rootScope', 'objectCheckerSrvc'];

    var controller = function ($scope, $rootScope, objectCheckerSrvc) {

        $scope.isHidden = true;
        $scope.product = null;
        $scope.object3D = null;

        var getEntity = function (mesh) {
            if (objectCheckerSrvc.isWall(mesh)) {
                return {
                    productImg: null,
                    description: 'Wall',
                }
            }
            else if (objectCheckerSrvc.isFloor(mesh)) {
                return {
                    productImg: null,
                    description: 'Floor',
                }
            }
            else {
                return mesh.userData.entity;
            }
        };

        $scope.close = function () {
            $scope.isHidden = true;
        };

        var productSelectUnregister = $rootScope.$on('productSelect', function (e, obj) {

            if (!obj) 
                $scope.isHidden = true;
            else {
                $scope.isHidden = false;
                $scope.product = getEntity(obj);
                $scope.object3D = obj;
            }

            $scope.$applyAsync();
        });

        $scope.$on('$destroy', function () {
            productSelectUnregister();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('productDetails', directive);

})();
