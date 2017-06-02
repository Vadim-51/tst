; (function () {
    'use strict';

    var dependencies = ['scene3D', 'Scene2d', 'wallCutHelper'];

    var service = function (scene3D, Scene2d, wallCutHelper) {

        var sceneType = {
            SCENE_2D: '2D',
            SCENE_3D: '3D'
        };

        var findSceneByObj = function (obj) {

            var scene = null;

            obj.traverseAncestors(function (o) {
                if (o instanceof THREE.Scene) {
                    scene = o;
                    return;
                }
            });

            return scene ? scene.name : null;
        };

        var updateWall = function (obj) {
            var wallName = obj.userData.wall,
                nonCuttedWall = scene3D.getNonCuttedWallByName(wallName),
                oldWall = scene3D.getObject(wallName),
                wallObjects = scene3D.getWallChildren(wallName),
                newWall = wallCutHelper.cutHolesInWall(nonCuttedWall, wallObjects, []);

            newWall.material = oldWall.material.clone();
            newWall.add.apply(newWall, oldWall.children);
            oldWall.remove.apply(oldWall, oldWall.children);

            scene3D.remove(oldWall);
            scene3D.add(newWall);
        };

        var removeObj2D = function (obj) {
            if (obj){
                Scene2d.remove(obj);
            }
            else console.error('object not exist on scene 2D');
        };

        return {
            deleteObject: function (mesh) {
                var scene = findSceneByObj(mesh);

                if (scene === sceneType.SCENE_2D) {
                    removeObj2D(mesh);
                    Scene2d.render();
                }
                else {

                    scene3D.remove(mesh);
                    removeObj2D(Scene2d.getObjectByUUID(mesh.uuid));

                    if (mesh.userData.entity.wallInteraction === 'embeddable') 
                        updateWall(mesh);
                }
            },
            deleteObjects: function (objs) {
                for (var i = 0; i < objs.length; i++) 
                    this.deleteObject(objs[i]);
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('sceneSyncSrvc', service);

})();
