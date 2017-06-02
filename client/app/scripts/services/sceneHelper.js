(function () {

    var getTrueMouseCoords = function (x, y, width, height) {
        return {
            x: (x / width) * 2 - 1,
            y: -(y / height) * 2 + 1
        }
    };

    var service = function ($rootScope) {

        return {
            getPickingRay: function (x, y, width, height, camera, raycaster) {
                raycaster = raycaster || new THREE.Raycaster();
                var coords = getTrueMouseCoords(x, y, width, height);
                raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
                return raycaster;
            },

            avtoZoomCameraIn2dProjection: function (frustum, startPosition, movePosition, camera) {
                var position = movePosition;
                var diff = new THREE.Vector3().subVectors(position, startPosition);
                diff.normalize().multiplyScalar(50);
                position.add(diff);
                var inside = frustum.containsPoint(position);

                if (!inside) {
                    var zoom = camera.zoom - 0.02;
                    $rootScope.$broadcast('wallBeyondCamera', { zoom: zoom, sign: '-' });
                }
            },
            translateWorldCoordinateToDisplay: function (object, base) { //object - coordinate what need translate; base - canvas
                var BoundingClientRect, X, Y;
                BoundingClientRect = base[0].getBoundingClientRect();
                X = (object.x * (BoundingClientRect.width / 2)) + (BoundingClientRect.width / 2) + BoundingClientRect.left;
                Y = -(object.y * (BoundingClientRect.height / 2)) + (BoundingClientRect.height / 2) + BoundingClientRect.top;
                return { x: X, y: Y };
            },
            getCanvasClientXY: function (e, canvas) {
                if (e.touches) {
                    var touch = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0],
                        boundingRectangle = boundingRectangle || canvas.parentNode.getBoundingClientRect();
                    return {
                        x: touch.clientX - boundingRectangle.left,
                        y: touch.clientY - boundingRectangle.top
                    }
                } else {
                    return {
                        x: e.offsetX,
                        y: e.offsetY
                    }
                }
            }
        }

    };

    angular.module('vigilantApp').service('sceneHelper', ['$rootScope', service]);

})();
