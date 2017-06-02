; (function () {
    'use strict';

    var directive = function () {
        return {
            restrict: 'E',
            templateUrl: '/views/changeViewPanel.html',
            replace: true,
            scope: {},
            controller: controller
        }
    };

    var dependencies = ['$scope', 'engine2DSrvc'];

    var controller = function ($scope, engine2DSrvc) {

        $scope.buttonClick = function () {
            engine2DSrvc.get().findComponentByType(RemoveNode).enable();
        };

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('changeViewPanel', directive);

})();