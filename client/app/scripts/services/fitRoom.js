; (function () {
    'use strict';

    var dependencies = ['cameraManager', 'orbitControl', 'roomStateManager'];

    var service = function (cameraManager, orbitControl, roomStateManager) {

        var getBoundingSphere = function () {
            var pts = roomStateManager.getPoints();
            return new THREE.Sphere().setFromPoints(pts);
        };

        return {
            in2D: function () {
                var bs = getBoundingSphere();
                var c = cameraManager.getCamera();
                c.position.copy(bs.center);
            },
            in3D: function () {
                var c = cameraManager.getCamera(),
                    bs = getBoundingSphere(),                       
                    distance = Math.abs(bs.radius / Math.sin(c.fov / 2)),
                    roomCenter = new THREE.Vector3(bs.center.x, 0, bs.center.z);
                c.position.copy(roomCenter);
                c.position.y += distance + 100;
                orbitControl.setTarget(roomCenter);
                c.updateMatrixWorld();
                c.updateProjectionMatrix();
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('fitRoom', service);

})();
