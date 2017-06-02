(function () {

    var service = function () {

        var data = {};

        return {
            add: function (wall, length, height, width) {

                var wallName = wall.name,
                    halfOfLength = length / 2,
                    halfOfHeight = height / 2,
                    halfOfWidth = width / 2,
                    wallData;

                wallData = (data[wallName] = data[wallName] || {});

                wallData.size = {
                    length: length,
                    height: height,
                    width: width,
                    halfOfLength: halfOfLength,
                    halfOfHeight: halfOfHeight,
                    halfOfWidth: halfOfWidth
                };

                wallData.direction = wall.getWorldDirection();

                wall.updateMatrixWorld();

                wallData.points = {
                    left: new THREE.Vector3(0, halfOfHeight, 0).applyMatrix4(wall.matrixWorld),
                    right: new THREE.Vector3(length, halfOfHeight, 0).applyMatrix4(wall.matrixWorld),
                    center: new THREE.Vector3(halfOfLength, halfOfHeight, 0).applyMatrix4(wall.matrixWorld),
                    topCenter: new THREE.Vector3(halfOfLength, height, -halfOfWidth).applyMatrix4(wall.matrixWorld),
                    top: new THREE.Vector3(halfOfLength, height, halfOfWidth).applyMatrix4(wall.matrixWorld),
                    bottom: new THREE.Vector3(halfOfLength, 0, halfOfWidth).applyMatrix4(wall.matrixWorld)
                };

                wallData.rotation = wall.rotation.y;

                wallData.position = wall.position.clone();

                wallData.opacityRay = new THREE.Raycaster(wallData.points.center, wallData.direction.clone().negate());
            },

            getDirection: function (wallName) {
                return data[wallName].direction.clone();
            },

            getSize: function (wall) {
                return data[wall].size;
            },

            getOpacityRay: function (wallName) {
                return data[wallName].opacityRay;
            },

            getPoints: function (wallName) {
                return data[wallName].points;
            },

            getScrollData: function (wallName) {

                if (!data[wallName].scroll) {

                    var wallData = data[wallName],
                        wallDirection = wallData.direction,
                        halfOfCameraFov = 45 / 2,  // 45 is camera fov
                        halfOfHeight = wallData.size.halfOfHeight,
                        halfOfLength = wallData.size.halfOfLength,
                        wallVisibleHeightDistance = halfOfHeight / Math.tan(halfOfCameraFov) + 100,
                        wallVisibleWidthDistance = halfOfLength / Math.tan(halfOfCameraFov),
                        wholeLengthDistance = wallDirection.clone().multiplyScalar(wallVisibleWidthDistance),
                        wholeHeightDistance = wallDirection.clone().multiplyScalar(wallVisibleHeightDistance),
                        cameraBoxTranslate = new THREE.Vector3(halfOfLength, 0, wholeHeightDistance.length() / 2).
                            applyMatrix4(new THREE.Matrix4().makeRotationY(wallData.rotation));

                    wallData.scroll = {
                        left: wallData.points.left,
                        center: wallData.points.center,
                        right: wallData.points.right,
                        top: wallData.points.top,
                        bottom: wallData.points.bottom,
                        wallDirection: wallData.direction,
                        maxDistance: wallVisibleHeightDistance > wallVisibleWidthDistance ? wholeHeightDistance.clone() : wholeLengthDistance,
                        middleDistance: wholeHeightDistance,
                        cameraBoxPosition: wallData.position.clone().
                            applyMatrix4(new THREE.Matrix4().makeTranslation(cameraBoxTranslate.x, halfOfHeight, cameraBoxTranslate.z)),
                        minDistance: wallDirection.clone().multiplyScalar(100),
                        currentDistanceFromWallToCamera: wholeHeightDistance.clone()
                    };
                }

                return data[wallName].scroll;
            },

            clearAll: function () {
                data = {};
            },

            updateWallData: function (wall, length, height, width) {
                data[wall.name] = null;
                this.add(wall, length, height, width);
            }
        }

    };

    angular.module('vigilantApp').service('wall3DDataManager', service);

})();