; (function () {
    'use strict';

    var directive = function () {
        return {
            restrict: 'E',
            template: [
               '<img data-toggle="tooltip" data-placement="top" title="Delete node" alt="Delete node"',
                    ' ng-click="buttonClick()" src="images/tools/removeNode.png" />'
            ].join(''),
            replace: true,
            scope: {},
            controller: controller
        }
    };

    var dependencies = ['$scope', 'engine'];

    var controller = function ($scope, engine) {

        $scope.buttonClick = function () {
            engine.get().findComponentByType(RemoveNode).enable();
        };

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('deleteNodeButton', directive);

})();