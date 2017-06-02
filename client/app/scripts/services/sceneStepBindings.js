; (function () {
    'use strict';

    var dependencies = ['roomSizeManager', 'stage', 'cameraManager',
        'engine', 'fitRoom', 'orbitControl', 'wallNumberSrvc',
        'wallVisibilityManager', 'floorMaterialStepSwitcher'];

    var service = function (roomSizeManager, stage, cameraManager,
        engine, fitRoom, orbitControl, wallNumberSrvc,
        wallVisibilityManager, floorMaterialStepSwitcher) {

        var setObj3DVisibility = function (isVisible) {
            stage.setObjectsVisibilityByPredicate(function (obj) {
                return obj.name === '3D';
            }, isVisible);
        };

        var setObj2DVisibility = function (isVisible) {
            stage.setObjectsVisibilityByPredicate(function (obj) {
                return obj.name === '2D';
            }, isVisible);
        };

        return {

            step1: function () { },

            step2: function () {

                roomSizeManager.setFloorAreaVisibility(stage.getFloor(), true);

                stage.setObjectsVisibilityByPredicate(function (obj) {
                    return obj.userData.isConnectionPoint;
                }, true);

                stage.getObjectByName('grid').visible = true;

                // engine.enable();
                orbitControl.disable();
                cameraManager.switchTo2D();
                fitRoom.in2D();

                setObj2DVisibility(true);
                setObj3DVisibility(false);

                wallNumberSrvc.setVisibility(false);

                wallVisibilityManager.reset(stage.getWalls(), []);

                floorMaterialStepSwitcher.to2D();
            },

            step3: function () {

                roomSizeManager.setFloorAreaVisibility(stage.getFloor(), false);

                stage.setObjectsVisibilityByPredicate(function (obj) {
                    return obj.userData.isConnectionPoint;
                }, false);

                stage.getObjectByName('grid').visible = true;

                // engine.enable();
                orbitControl.disable();
                cameraManager.switchTo2D();
                fitRoom.in2D();

                setObj2DVisibility(true);
                setObj3DVisibility(false);

                wallNumberSrvc.setVisibility(false);

                wallVisibilityManager.reset(stage.getWalls(), []);

                floorMaterialStepSwitcher.to2D();
            },

            step4: function (reset3DCamera) {

                roomSizeManager.setFloorAreaVisibility(stage.getFloor(), false);

                stage.setObjectsVisibilityByPredicate(function (obj) {
                    return obj.userData.isConnectionPoint;
                }, false);

                stage.getObjectByName('grid').visible = false;

                cameraManager.switchTo3D();

                if (reset3DCamera !== false)
                    fitRoom.in3D();

                orbitControl.update();
                orbitControl.enable();

                setObj2DVisibility(false);
                setObj3DVisibility(true);

                wallNumberSrvc.setVisibility(true, []);

                floorMaterialStepSwitcher.to3D();
            },

            step5: function () {

            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('sceneStepBindings', service);

})();
