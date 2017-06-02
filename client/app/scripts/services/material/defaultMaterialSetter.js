; (function () {
    'use strict';

    var dependencies = ['objectCheckerSrvc', 'materialStuffService', 'objectMaterial', 'roomStateManager'];

    var service = function (objectCheckerSrvc, materialStuffService, objectMaterial, roomStateManager) {

        return {
            set: function (mesh) {

                var materials;

                if (objectCheckerSrvc.isWall(mesh)) {
                    var groups = materialStuffService.wallGroupNames;
                    materials = materialStuffService.getWallMaterialNamesByGroupName(groups[1]);
                }
                else if (objectCheckerSrvc.isFloor(mesh)) {
                    var groups = materialStuffService.floorGroupNames;
                    materials = materialStuffService.getFloorMaterialNamesByGroupName(groups[0]);
                }
                else {
                    materials = mesh.userData.entity.color_scheme;
                }

                var material = materials[0];

                objectMaterial.setMaterial(mesh, material)
                    .then(function () {
                        if (mesh.name === 'floor') {
                            mesh.material.side = 2;
                        }
                        roomStateManager.saveObjectColorScheme({
                            objectId: mesh.uuid,
                            scheme: material
                        });
                    });
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('defaultMaterialSetter', service);

})();
