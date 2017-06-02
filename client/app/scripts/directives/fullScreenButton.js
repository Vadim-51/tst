; (function () {
    'use strict';

    var directive = function () {
        return {
            template: [
                '<a style="vertical-align: middle;display:inline-block;" ng-click="click()">',
                    '<i class="glyphicon glyphicon-fullscreen" style="font-size: 25px;"></i>',
                '</a>'
            ].join('\n'),
            restrict: 'E',
            scope: {
                activeStep : '='
            },
            controller: controller
        };
    };

    var dependencies = ['$scope', 'stage'];

    var controller = function ($scope, stage) {

        var makeFullScreen = function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
        };

        $scope.click = function () {
            var element = stage.getCanvas();
            makeFullScreen(element);
        };

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('fullScreenButton', directive);

})();
