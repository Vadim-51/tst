//switch floor material between 2D/3D
; (function () {
    'use strict';

    var dependencies = ['stage', 'objectMaterial', 'roomStateManager', 'defaultMaterialSetter'];

    var service = function (stage, objectMaterial, roomStateManager, defaultMaterialSetter) {

        var floor2DMaterial = new THREE.MeshBasicMaterial({
            color: 0x83ACF2,
            name: 'FLOOR',
            side: THREE.DoubleSide
        });

        return {

            to2D: function () {
                var floor = stage.getFloor();
                floor.material = floor2DMaterial;
            },

            to3D: function () {
                var floor = stage.getFloor();
                var cs = roomStateManager.getColorSchemeByObjectId(floor.uuid);

                if (!cs) 
                    defaultMaterialSetter.set(floor);
                else
                    objectMaterial.setMaterial(floor, cs.scheme);
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('floorMaterialStepSwitcher', service);

})();
