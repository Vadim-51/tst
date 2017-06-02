; (function () {
    'use strict';

    var dependencies = ['modelLoader', 'stage', 'objectMaterial',
        'roomStateManager', 'materialSelector', 'roomStuffFactory'];

    var service = function (modelLoader, stage, objectMaterial,
        roomStateManager, materialSelector, roomStuffFactory) {

        var mahTexture = THREE.ImageUtils.loadTexture('/textures/Mah_Laq_Natural_STL.jpg');

        var restoreObjectMaterial = function (object, colorScheme) {

            objectMaterial.setMaterial(object, colorScheme)
                .then(function () {
                    roomStateManager.saveObjectColorScheme({
                        objectId: object.parent.uuid,
                        scheme: colorScheme
                    });
                });

            var entity = object.parent.userData.entity;
            if (entity && entity.vigilant) {
                var materials = object.material.materials;
                for (var i = 0; i < materials.length; i++) {
                    if (!materials[i].map) 
                        materials[i].map = mahTexture;
                }
            }
        };

        return {
            create: function (entity, params) {

                var container = new THREE.Object3D();
                container.name = 'roomObject';
                container.userData.entity = entity;

                var obj3D = params ? params.object3D : null;
                var data = container.userData;
                var obj2D = container.getObjectByName('2D');

                if (!obj2D) {
                    obj2D = roomStuffFactory.buildRoomItem(entity);
                    obj2D.visible = false;
                    //obj2D.userData.entity = entity;
                    container.add(obj2D);
                    container.position.y = entity.defaultHeightFromFloor ? entity.defaultHeightFromFloor + entity.height / 2 : entity.height / 2;
                }

                if (obj3D) {
                    obj3D.name = '3D';
                    container.add(obj3D);
                    obj3D.userData.entity = entity;
                }
                else
                    if (!data.model3DLoading) {

                        data.model3DLoading = true;

                        var self = this;

                        modelLoader.load(data).then(function (model) {
                            //is object still exist on scene
                            var obj = stage.getObjectById(container.id);
                            if (obj) {
                                model.name = '3D';
                                model.visible = params && params.show3DObject || false;
                                container.add(model);
                                model.userData.entity = entity;
                                restoreObjectMaterial(model);
                                //objectMaterial.setDefaultMaterial(container);
                            }

                        });
                    }

                if (params) {

                    if (params.position)
                        container.position.copy(params.position);

                    if (params.rotation)
                        container.rotation.copy(params.rotation);

                    if (params.wall)
                        container.userData.wall = params.wall;
                }

                return container;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('model3D', service);

})();
