; (function () {
    'use strict';

    var directive = function () {
        return {
            template: [
                     '<button type="button" style="display: block; margin: 10px auto 0 auto;',
                            'title="Remove object" ng-click="delete()">',
                        '<span class="glyphicon glyphicon-remove"></span>',
                    '</button>'
            ].join('\n'),
            restrict: 'E',
            scope: {
                selectedMesh: '='
            },
            controller: controller
        };
    };

    var dependencies = ['$scope', 'roomStateManager', 'engine', 'wallHoles', 'objectCheckerSrvc'];

    var controller = function ($scope, roomStateManager, engine, wallHoles, objectCheckerSrvc) {

        var select2D = engine.get().findComponentByType(Selection2D);

        $scope.delete = function () {
            var mesh = $scope.selectedMesh;
            mesh.parent.remove(mesh);
            roomStateManager.removeObjectColorScheme(mesh.uuid);
            select2D.setSelected(null);
            if (objectCheckerSrvc.isWallEmbeddable(mesh)) {
                wallHoles.update(mesh.userData.wall);
            };
        };
    }
    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('deleteObjectButton', directive);

})();
