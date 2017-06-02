; (function () {
    'use strict';

    var dependencies = ['obbBuilder'];

    var service = function (obbBuilder) {

        var getMesh = function (obj) {
            if (obj instanceof THREE.Mesh)
                return obj;
            return obj.getObjectByName('3D');
        };

        return {
            intersectObjectsObb: function (ray, objects) {

                var obj,
                    obb,
                    point,
                    i = 0,
                    intersection = [],
                    containPoint;

                for (; i < objects.length; i++) {
                    obj = getMesh(objects[i]);
                    obb = obbBuilder.create().build(obj);
                    point = obb.intersectRay(ray);
                    containPoint = obb.isPointContained(ray.origin);

                    if (point) {
                        intersection.push({
                            object: obj,
                            point: containPoint ? ray.origin.clone() : point,
                            distance: containPoint ? 0 : point.distanceTo(ray.origin)
                        });
                    }
                }

                intersection.sort(function (a, b) {
                    return a.distance - b.distance;
                });

                return intersection;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('rayHelper', service);

})();
