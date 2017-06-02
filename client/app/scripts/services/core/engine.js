; (function () {
    'use strict';

    var dependencies = ['stage', 'step3Helper', 'constants', 'keyState',
                 'roomStateManager', 'roomStuffFactory',
                   'collisionSrvc', 'obbBuilder', 'objectGapHelperSrvc',
                   'geometryHelper', 'roomSizeManager', 'room2DBuilder',
                   'helperLines', 'wallConnectionSrvc', 'cursorBuilder',
                    'cameraManager', 'objectCheckerSrvc', 'model3D', 'rayHelper',
                    'dimensionalRadialsManager', 'wallVisibilityManager',
                    'wallNumberSrvc', 'scene3D', 'objectControls', 'wallCutSrvc',
                    'object3DCloneSrvc', 'orbitControl', 'appSettings',
                    'wall3DDataManager', 'wallHoles', 'sceneUtils', 'objectDimensions', 'wallHelper'];

    var service = function (stage, step3Helper, constants, keyState,
                     roomStateManager, roomStuffFactory,
                    collisionSrvc, obbBuilder, objectGapHelperSrvc,
                    geometryHelper, roomSizeManager, room2DBuilder,
                    helperLines, wallConnectionSrvc, cursorBuilder,
                    cameraManager, objectCheckerSrvc, model3D, rayHelper,
                    dimensionalRadialsManager, wallVisibilityManager,
                    wallNumberSrvc, scene3D, objectControls, wallCutSrvc,
                    object3DCloneSrvc, orbitControl, appSettings,
                    wall3DDataManager, wallHoles, sceneUtils, wallHelper) {

        var engine;
        var servicesObj = arguments;
        var dependencyContainer;

        return {
            get: function () {

                if (!engine) {

                    engine = new Engine();

                    dependencyContainer = new DependencyContainer(servicesObj, dependencies);

                    var select3DComponent = new Select3D(dependencyContainer);

                    engine.addComponents([
                        new DrawCustomRoom(dependencyContainer),
                        new ZoomCamera(dependencyContainer),
                        new ConnectionPointHover(dependencyContainer),
                        new SplitWall(dependencyContainer),
                        new RemoveNode(dependencyContainer),
                        new MoveCorner(dependencyContainer),
                        new WallHighlight(dependencyContainer),
                        new MoveWall(dependencyContainer),
                        new MoveCamera(dependencyContainer),
                        new ShowSizesOnFloorClick(dependencyContainer),

                        new Selection2D(dependencyContainer),

                        new Drag2D(dependencyContainer,[
                            new Floor2DObjectDrag(dependencyContainer),
                            new WallEmbeddable2DHandler(dependencyContainer)
                        ]),

                        //new DragWindow2D(dependencyContainer),
                        //new DragCabinet2D(dependencyContainer),

                        /*--------------------------------------------------------------------*/
                        new ObjectDimensions(dependencyContainer),
                        new ObjectControls(dependencyContainer, [
                            new ClockwiseRotateHandler(dependencyContainer, select3DComponent),
                            new CounterClockwiseRotateHandler(dependencyContainer, select3DComponent),
                            new DeleteHandler(dependencyContainer, select3DComponent),
                            new CloneHandler(dependencyContainer, select3DComponent),
                            //new InfoHandler(dependencyContainer, select3DComponent)
                        ]),
                        new ObjectAdd(dependencyContainer, [
                            new FloorObjectHandler(dependencyContainer),
                            new WallEmbeddableObjectHandler(dependencyContainer),
                            new WallMountObjectHandler(dependencyContainer)
                        ]),
                        select3DComponent,
                        new HideLookBlockWalls(dependencyContainer),
                        new WallNumbersUpdate(dependencyContainer),
                        new Drag3D(dependencyContainer, [
                            new WallMountObjectDrag(dependencyContainer, [
                                new AxisDragHandler(dependencyContainer),
                                new WallObjectSmartDrag(dependencyContainer),
                                new SnapHandler(dependencyContainer)
                            ]),
                            new FloorObjectDrag(dependencyContainer, [
                                new FloorObjectSmartDrag(dependencyContainer),
                                new SnapHandler(dependencyContainer)
                            ])//,
                            //new WallObjectDrag(dependencyContainer, [
                            //    new AxisDragHandler(dependencyContainer),
                            //    new WallObjectSmartDrag(dependencyContainer),
                            //    new SnapHandler(dependencyContainer)
                            //])
                        ]),
                        new WallView(dependencyContainer)
                    ]);

                    engine.init();
                }

                return engine;
            },

            attachCanvas: function (canvas) {
                var eng = this.get();
                eng.registerEvents(canvas);
            },

            enable : function () {
                engine.enable();
            },

            disable: function () {
                engine.disable();
            },

            activateStepRelatedComponents: function (step) {

                if (!engine)
                    return;

                switch (step) {
                    case 'step1':
                        {
                            //engine.findComponentByType(DrawCustomRoom).enable();
                            //engine.findComponentByType(SplitWall).disable();
                            //engine.findComponentByType(RemoveNode).disable();
                        }
                        break;
                    case 'step2':
                        {
                            engine.findComponentByType(Selection2D).disable();
                            engine.findComponentByType(Drag2D).disable();
                           // engine.findComponentByType(DragWindow2D).disable();
                           // engine.findComponentByType(DragCabinet2D).disable();
                            engine.findComponentByType(WallHighlight).enable();
                            engine.findComponentByType(ConnectionPointHover).enable();
                            engine.findComponentByType(MoveCorner).enable();
                            engine.findComponentByType(MoveWall).enable();
                            engine.findComponentByType(ShowSizesOnFloorClick).enable();
                            engine.findComponentByType(ZoomCamera).enable();
                            engine.findComponentByType(MoveCamera).enable();
                            engine.findComponentByType(RemoveNode).disable();
                            engine.findComponentByType(SplitWall).disable();
                            /*-------------------------------------------------*/
                            engine.findComponentByType(Select3D).disable();
                            engine.findComponentByType(HideLookBlockWalls).disable();
                            engine.findComponentByType(ObjectAdd).disable();
                            engine.findComponentByType(WallNumbersUpdate).disable();
                            engine.findComponentByType(ObjectControls).disable();
                            engine.findComponentByType(Drag3D).disable();
                            engine.findComponentByType(WallView).disable();
                            engine.findComponentByType(ObjectDimensions).disable();
                        }
                        break;
                    case 'step3':
                        {
                            engine.findComponentByType(Selection2D).enable();
                            engine.findComponentByType(Drag2D).enable();
                            //engine.findComponentByType(DragWindow2D).enable();
                           // engine.findComponentByType(DragCabinet2D).enable();
                            engine.findComponentByType(RemoveNode).disable();
                            engine.findComponentByType(SplitWall).disable();
                            engine.findComponentByType(WallHighlight).disable();
                            engine.findComponentByType(ConnectionPointHover).disable();
                           engine.findComponentByType(MoveCorner).disable();
                           engine.findComponentByType(MoveWall).disable();
                           engine.findComponentByType(ShowSizesOnFloorClick).disable();
                           engine.findComponentByType(ZoomCamera).enable();
                           engine.findComponentByType(MoveCamera).enable();
                            /*-------------------------------------------------*/
                           engine.findComponentByType(Select3D).disable();
                           engine.findComponentByType(HideLookBlockWalls).disable();
                           engine.findComponentByType(ObjectAdd).disable();
                           engine.findComponentByType(WallNumbersUpdate).disable();
                           engine.findComponentByType(ObjectControls).disable();
                           engine.findComponentByType(Drag3D).disable();
                           engine.findComponentByType(WallView).disable();
                           engine.findComponentByType(ObjectDimensions).disable();
                        }
                        break;
                    case 'step4':
                        {
                            engine.findComponentByType(Selection2D).disable();
                            engine.findComponentByType(Drag2D).disable();
                            //engine.findComponentByType(DragWindow2D).disable();
                           // engine.findComponentByType(DragCabinet2D).disable();
                            engine.findComponentByType(WallHighlight).disable();
                            engine.findComponentByType(ConnectionPointHover).disable();
                            engine.findComponentByType(MoveCorner).disable();
                            engine.findComponentByType(ShowSizesOnFloorClick).disable();
                            engine.findComponentByType(ZoomCamera).disable();
                            engine.findComponentByType(MoveCamera).disable();
                            engine.findComponentByType(MoveWall).disable();
                            engine.findComponentByType(RemoveNode).disable();
                            engine.findComponentByType(SplitWall).disable();
                            /*------------------------------------------*/
                            engine.findComponentByType(Select3D).enable();
                            engine.findComponentByType(HideLookBlockWalls).enable();
                            engine.findComponentByType(ObjectAdd).enable();
                            engine.findComponentByType(WallNumbersUpdate).enable();
                            engine.findComponentByType(ObjectControls).enable();
                            engine.findComponentByType(Drag3D).enable();
                            engine.findComponentByType(WallView).enable();
                            engine.findComponentByType(ObjectDimensions).enable();
                        }
                        break;
                }
            },

            dispose: function () {
                if (engine) {
                    engine.dispose();
                    dependencyContainer.dispose();
                    engine = null;
                }
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('engine', service);

})();
