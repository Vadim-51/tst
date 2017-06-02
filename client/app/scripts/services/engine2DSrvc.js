; (function () {

    var dependencies = ['Scene2d', 'step3Helper', 'constants', 'keyState',
                   'roomStateManager', 'roomStuffFactory',
                   'collisionSrvc', 'obbBuilder', 'objectGapHelperSrvc',
                   'geometryHelper', 'roomSizeManager', 'room2DBuilder',
                   'helperLines', 'wallConnectionSrvc', 'cursorBuilder'];

    var service = function (Scene2d, step3Helper, constants, keyState,
                    roomStateManager, roomStuffFactory,
                    collisionSrvc, obbBuilder, objectGapHelperSrvc,
                    geometryHelper, roomSizeManager, room2DBuilder,
                    helperLines, wallConnectionSrvc, cursorBuilder) {

        var engine2d;
        var servicesObj = arguments;
        var dependencyContainer;

        return {

            get: function () {

                if (!engine2d) {

                    var canvas = Scene2d.init(1, 1);

                    engine2d = new Engine();

                    dependencyContainer = new DependencyContainer(servicesObj, dependencies);

                    engine2d.addComponents([
                        new DrawCustomRoom(dependencyContainer),
                        new ZoomCamera(dependencyContainer),
                        new ConnectionPointHover(dependencyContainer),
                        new SplitWall(dependencyContainer),
                       // new RemoveNode(dependencyContainer),
                       // new MoveCorner(dependencyContainer),
                        new WallHighlight(dependencyContainer),
                        new MoveWall(dependencyContainer),
                        new MoveCamera(dependencyContainer),
                        new ShowSizesOnFloorClick(dependencyContainer),
                       
                        new Selection2D(dependencyContainer),
                        new DragWindow2D(dependencyContainer),
                        new DragCabinet2D(dependencyContainer)
                    ]);

                    engine2d.init(canvas);
                }

                return engine2d;
            },

            attachCanvas: function (canvas) {
                var engine = this.get();
                engine.registerEvents(canvas);
            },

            activateStepRelatedComponents: function (step) {

                if (!engine2d)
                    return;

                switch (step) {
                    case 'step1':
                        {
                            engine2d.findComponentByType(DrawCustomRoom).enable();
                            engine2d.findComponentByType(SplitWall).disable();
                            //engine2d.findComponentByType(RemoveNode).disable();
                        }
                        break;
                    case 'step2':
                        {
                            engine2d.findComponentByType(Selection2D).disable();
                            engine2d.findComponentByType(DragWindow2D).disable();
                            engine2d.findComponentByType(DragCabinet2D).disable();

                            engine2d.findComponentByType(WallHighlight).enable();
                            engine2d.findComponentByType(ConnectionPointHover).enable();
                          //  engine2d.findComponentByType(MoveCorner).enable();
                            engine2d.findComponentByType(MoveWall).enable();
                            engine2d.findComponentByType(ShowSizesOnFloorClick).enable();
                        }
                        break;
                    case 'step3':
                        {
                            engine2d.findComponentByType(Selection2D).enable();
                            engine2d.findComponentByType(DragWindow2D).enable();
                            engine2d.findComponentByType(DragCabinet2D).enable();

                           // engine2d.findComponentByType(RemoveNode).disable();
                            engine2d.findComponentByType(SplitWall).disable();
                            engine2d.findComponentByType(WallHighlight).disable();
                            engine2d.findComponentByType(ConnectionPointHover).disable();
                           // engine2d.findComponentByType(MoveCorner).disable();
                            engine2d.findComponentByType(MoveWall).disable();
                            engine2d.findComponentByType(ShowSizesOnFloorClick).disable();
                        }
                        break;
                }
            },

            dispose: function () {
                if (engine2d) {
                    engine2d.dispose();
                    dependencyContainer.dispose();
                    engine2d = null;
                }
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('engine2DSrvc', service);

})();