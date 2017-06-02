'use strict';

angular.module('vigilantApp').directive('webgl', ['stage', 'ngDialog', '$rootScope', 'engine', 'orbitControl', 'cameraManager',
 function (stage, ngDialog, $rootScope, engine, orbitControl, cameraManager) {
     return {
         template: '',
         restrict: 'E',
         scope: {
             step : '@'
         },
         link: function (scope, element, attrs) {

             if (!Detector.webgl && !Detector.isChecked) {
                 //Detector.addGetWebGLMessage();
                 scope.dial = ngDialog.open({
                     scope: scope,
                     disableAnimation: true,
                     className: 'ngdialog-theme-default screenshots-popup',
                     template: '<div>Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>' +
                             'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.</div>',
                     plain: true
                 });
                 Detector.isChecked = true;
             }

             var h = $(element).parents('.stepContainer').height();

             stage.init();
  
             engine.attachCanvas(stage.getCanvas());
             orbitControl.init(cameraManager.getPerspective(), stage.getCanvas());

             var itemsLoadedUnsubscribe = $rootScope.$on('Items loaded', function (e, data) {
                 $rootScope.$broadcast('Scene ready', null);
             });

             var stepActiveUnsubscribe = $rootScope.$on("stepActive", function (e, step, wallView, reset3DCamera) {
                 if (step === scope.step) {
                     element.append(stage.getCanvas());
                 }
             });

             scope.$on('$destroy', function () {
                 itemsLoadedUnsubscribe();
                 stepActiveUnsubscribe();
             });
         }
     };
 }]);
