; (function () {
    'use strict';

    var dependencies = ['scene3D', 'constants', 'keyState',
        'orbitControl', 'Scene2d', 'collisionSrvc', 'objectGapHelperSrvc',
        'sceneHelper', 'wallVisibilityManager', 'wallCutHelper',
        'scene2DSyncSrvc', 'obbBuilder', 'wall3DDataManager', 'objectControls',
        'geometryHelper', 'sceneSyncSrvc', 'objectCheckerSrvc', 'object3DCloneSrvc',
        'roomStateManager', 'dimensionalRadialsManager', 'wallNumberSrvc', 'object3DPositionHistory',
        'rayHelper', 'productDetailDialogSrvc','stage'];

    var service = function (scene3D, constants, keyState, orbitControl,
        Scene2d, collisionSrvc, objectGapHelperSrvc, sceneHelper,
        wallVisibilityManager, wallCutHelper, scene2DSyncSrvc, obbBuilder, wall3DDataManager,
        objectControls, geometryHelper, sceneSyncSrvc, objectCheckerSrvc, object3DCloneSrvc,
        roomStateManager, dimensionalRadialsManager, wallNumberSrvc, object3DPositionHistory,
        rayHelper, productDetailDialogSrvc, stage) {

        var engine3D;
        var servicesObj = arguments;
        var dependencyContainer;

        return {

            getEngine: function () {

                if (!engine3D) {

                    //scene3D.init(1, 1);//need canvas , init scene first

                    //engine3D = new Engine();

                    //dependencyContainer = new DependencyContainer(servicesObj, dependencies);

                    //var select3DComponent = new Select3D(dependencyContainer);

                    //engine3D.addComponents([
                    //    new ObjectControls(dependencyContainer, [
                    //         new ClockwiseRotateHandler(dependencyContainer, select3DComponent),
                    //         new CounterClockwiseRotateHandler(dependencyContainer, select3DComponent),                             
                    //         new DeleteHandler(dependencyContainer, select3DComponent),
                    //         new CloneHandler(dependencyContainer, select3DComponent),
                    //         new InfoHandler(dependencyContainer, select3DComponent)
                             
                    //    ]),
                    //    new ObjectAdd(dependencyContainer, [
                    //        new FloorObjectHandler(dependencyContainer),
                    //        new WallEmbeddableObjectHandler(dependencyContainer),
                    //        new WallMountObjectHandler(dependencyContainer)
                    //    ]),
                    //    select3DComponent,
                    //    new HideLookBlockWalls(dependencyContainer),
                    //    new WallNumbersUpdate(dependencyContainer),
                    //    new Drag3D(dependencyContainer, [                          
                    //        new WallMountObjectDrag(dependencyContainer, [
                    //            new AxisDragHandler(dependencyContainer),
                    //            new WallObjectSmartDrag(dependencyContainer),
                    //            new SnapHandler(dependencyContainer)
                    //        ]),
                    //        new FloorObjectDrag(dependencyContainer, [
                    //            new FloorObjectSmartDrag(dependencyContainer),
                    //            new SnapHandler(dependencyContainer)
                    //        ]),
                    //        new WallObjectDrag(dependencyContainer, [
                    //            new AxisDragHandler(dependencyContainer),
                    //            new WallObjectSmartDrag(dependencyContainer),
                    //            new SnapHandler(dependencyContainer)
                    //        ])
                    //    ]),
                    //    new WallView(dependencyContainer)
                    //]);

                    //engine3D.init();

                    //engine3D.registerEvents(scene3D.getHtmlElement());
                }

                return engine3D;
            },

            activateStepRelatedComponents: function (step) {

                //if (!engine3D)
                //    return;

                //switch (step) {
                //    case 'step3':
                //    case 'step1':
                //    case 'step2':
                //        {
                //            engine3D.findComponentByType(ObjectControls).disable();
                //            engine3D.findComponentByType(Select3D).disable();
                //            engine3D.findComponentByType(ObjectAdd).disable();
                //        }
                //        break;
                //    case 'step4':
                //        {
                //            engine3D.findComponentByType(Select3D).enable();
                //            engine3D.findComponentByType(Drag3D).enable();
                //            engine3D.findComponentByType(WallView).enable();
                //            engine3D.findComponentByType(ObjectControls).enable();
                //            engine3D.findComponentByType(ObjectAdd).enable();
                //        }
                //        break;
                //    case 'step5':
                //        {
                //            engine3D.findComponentByType(ObjectAdd).disable();
                //            engine3D.findComponentByType(Select3D).disable();
                //            engine3D.findComponentByType(Drag3D).disable();
                //            engine3D.findComponentByType(WallView).disable();
                //            engine3D.findComponentByType(ObjectControls).disable();
                //        }
                //        break;
                //}
            },

            dispose: function () {
                //if (engine3D) {
                //    engine3D.dispose();
                //    dependencyContainer.dispose();
                //    engine3D = null;
                //}
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('engine3DSrvc', service);

})();
