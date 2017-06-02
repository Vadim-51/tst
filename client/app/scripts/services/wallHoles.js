; (function () {
    'use strict';

    var dependencies = ['stage', 'wallCutSrvc'];

    var service = function (stage, wallCutSrvc) {

        return {
            update: function (wallName) {
                if (wallName) {

                    var wallObjects = stage.getChildren().filter(function (o) {
                        return o.userData.wall === wallName;
                    });

                    var wall = stage.getObjectByName(wallName);

                    wallCutSrvc.cutHolesInWall(wall, wallObjects);
                }
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallHoles', service);

})();
