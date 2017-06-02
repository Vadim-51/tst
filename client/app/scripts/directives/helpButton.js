(function () {

    var directive = function (ngDialog, engine3DSrvc) {
        return {
            template: '<span class="glyphicon glyphicon-question-sign helpBtn" ng-click="showHelpDialog()" ng-show="isVisible()"></span>',
            restrict: 'E',
            replace: true,
            scope: {
                activeStep: '='
            },
            link: function (scope) {

               // var viewWallComponent = engine3DSrvc.getEngine().findComponentByType(WallView);

                scope.isTouchDevice = "ontouchstart" in document.documentElement;

                scope.isVisible = function() {
                    return this.activeStep === 1 || this.activeStep === 2 || this.activeStep === 3 || this.activeStep === 4;
                };

                scope.showHelpDialog = function () {

                    var template = null;

                    switch (this.activeStep) {
                        case 1:
                            template = '/views/help/dragAndDropWall.html';
                            break;
                        case 2:
                            template = '/views/help/step3.html';
                            break;
                        case 3:
                           // template = !viewWallComponent.isInWallMode() ? '/views/help/step4FreeLook.html' : '/views/help/step4WallMode.html';
                            break;
                        case 4 :
                            template = '/views/help/step5Help.html';
                            break;
                    }

                    if (template !== null) {
                        ngDialog.open({
                            scope: scope,
                            disableAnimation: true,
                            template: template
                        });
                    }
                };
            }
        };
    };

    angular.module('vigilantApp').directive('helpButton', ['ngDialog', 'engine3DSrvc', directive]);
})();
