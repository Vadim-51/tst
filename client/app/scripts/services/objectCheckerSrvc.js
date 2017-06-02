; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var getEntity = function (objOrEntity) {
            var result = null;
            if (objOrEntity instanceof THREE.Object3D)
                result = objOrEntity.userData.entity;
            else if (typeof (objOrEntity) === 'object')
                result = objOrEntity;
            return result;
        };

        return {
            isWall: function (objOrEntity) {
                var entity = getEntity(objOrEntity);
                return entity && entity.isWall;
            },
            isFloor: function (objOrEntity) {
                //var entity = getEntity(objOrEntity);
                //return entity && entity.isFloor;
                return objOrEntity.userData && objOrEntity.userData.isFloor;
            },
            isWallEmbeddable: function (objOrEntity) {
                var entity = getEntity(objOrEntity);
                return entity && entity.wallInteraction === 'embeddable';
            },
            isWallMountable: function (objOrEntity) {
                var entity = getEntity(objOrEntity);
                return entity && entity.wallInteraction === 'mountable';
            },
            isWindow: function (objOrEntity) {
                var entity = getEntity(objOrEntity);
                return entity && entity.left_menu_alias === 'Windows';
            },
            sameWallInteraction: function (objOrEntity1, objOrEntity2) {
                var entity1 = getEntity(objOrEntity1);
                var entity2 = getEntity(objOrEntity2);
                return entity1 && entity2 && entity1.wallInteraction === entity2.wallInteraction;
            },
            isWallOrFloor: function (objOrEntity) {
                return this.isFloor(objOrEntity) || this.isWall(objOrEntity);
            },
            iteractWithWall: function (objOrEntity) {
                return this.isWallMountable(objOrEntity) || this.isWallEmbeddable(objOrEntity);
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objectCheckerSrvc', service);

})();
