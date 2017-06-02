; (function () {
    'use strict';

    var dependencies = ['roomStateManager'];

    var service = function (roomStateManager) {

        var cutHoleInWall = function (wall, item) {

            wall.updateMatrixWorld();

            var wallBsp = new ThreeBSP(wall),
                j = 0,
                face,
                cutter,
                resultingWall,
                width = item.userData.width || item.userData.entity.width,
                height = item.userData.height || item.userData.entity.height,
                length = item.userData.length || item.userData.entity.length;

            cutter = new THREE.Mesh(new THREE.BoxGeometry(length, height, width * 2));
            cutter.position.copy(item.position);
            cutter.rotation.copy(item.rotation);

            wallBsp = wallBsp.subtract(new ThreeBSP(cutter));

            resultingWall = wallBsp.toMesh(new THREE.MeshBasicMaterial());

            //resultingWall.geometry.colorsNeedUpdate = true;
            //for (j; j < resultingWall.geometry.faces.length; j++) {
            //    face = resultingWall.geometry.faces[j];
            //    if (face.normal.y === 1)
            //        face.color.setHex(0x000000);
            //}

            return resultingWall;
        };

        var copyOldWallState = function (oldWall, newWall) {
            if (oldWall !== newWall) {

                newWall.material = roomStateManager.getObjectMaterial(oldWall.uuid) || oldWall.material.clone();

                if (oldWall.children.length !== 0) {
                    newWall.add.apply(newWall, oldWall.children);
                    //oldWall.remove.apply(oldWall, oldWall.children);
                }

                newWall.rotation.copy(oldWall.rotation);
                newWall.name = oldWall.name;
                newWall.userData = angular.copy(oldWall.userData);
                newWall.uuid = oldWall.name;
            }
        };

        return {
            cutHolesInWall: function (wall, windowsAndDoors, stairs) {
                var cutted = wall,
                    i = 0,
                    child,
                    meshData;

                for (; i < windowsAndDoors.length; i++) {
                    child = windowsAndDoors[i];
                    if (child instanceof THREE.Mesh)
                        cutted = cutHoleInWall(cutted, child);
                }

                for (i = 0; i < stairs.length; i++) {
                    child = stairs[i];
                    meshData = child.userData;
                    if (meshData.entity.type === constants.StairsType.WALL_CUT && meshData.wall === wall.name)
                        cutted = cutHoleInWall(cutted, child);
                }

                copyOldWallState(wall, cutted);

                return cutted;
            },
            cutHoleInWall: function (wall, item) {
                var newWall = cutHoleInWall(wall, item);
                copyOldWallState(wall, newWall);
                return newWall;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallCutHelper', service);

})();
