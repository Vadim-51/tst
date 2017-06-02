; (function () {
    'use strict';

    var dependencies = ['scene3D', 'wallNumberSrvc'];

    var service = function (scene3D, wallNumberSrvc) {

        return {
            take: function () {

                var wallNumbersVisibility = wallNumberSrvc.isVisible();

                wallNumberSrvc.setVisibility(false);

                scene3D.render();

                var image = scene3D.toImage();

                wallNumberSrvc.setVisibility(wallNumbersVisibility);

                return image;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('scene3DScreenshotSrvc', service);

})();
