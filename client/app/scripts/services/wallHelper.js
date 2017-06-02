; (function () {
    'use strict';

    var dependencies = ['stage', 'step3Helper', 'obbBuilder', 'collisionSrvc'];

    var service = function (stage, step3Helper, obbBuilder, collisionSrvc) {

        return {
            getIntersectedWall: function (walls, object) {
             
                var wall = step3Helper.getWallInHotZone(object, walls);

                if (wall)
                    return wall;

                var obb = obbBuilder.create()
                                           .setBoundingBox(object.userData.boundingBox)
                                           .build(object.getObjectByName('2D'));

                return collisionSrvc.objectOBBIntersectWalls(obb, walls);
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallHelper', service);

})();
