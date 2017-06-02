; (function () {

    var dependencies = ['scene3D', '$timeout', 'roomStateManager', 'Scene2d'];

    var directive = function (scene3D, $timeout,
        roomStateManager, Scene2d) {

        return {
            template: '<div class="scene3d"></div>',
            restrict: 'E',
            replace: true,
            scope: {
                associatedStepIndex: '@'
            },
            link: function (scope, element) {

                var canvas = scene3D.init(element.width(), element.height()),
                    stepText = 'step' + scope.associatedStepIndex;

                scope.$on("stepActive", function (e, step, wallView, reset3DCamera) {
                    if (step === stepText) {

                        element.append(canvas);

                        scene3D.dispose();
                        scene3D.draw(roomStateManager.getRoomPoints(), Scene2d.getEntityObjects(), reset3DCamera);

                        $timeout(function () {
                            scene3D.resize();
                        }, 200);
                    }
                });
            }
        }
    };

    directive.$inject = dependencies;

    angular.module('vigilantApp').directive('scene3d', directive);

})();
