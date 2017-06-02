; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var isInitialized = false;
        var controls;

        return {

            init: function (camera, canvas) {
                if (!isInitialized) {
                    isInitialized = true;
                    controls = new THREE.OrbitControls(camera, canvas);
                }
            },
            enable: function () {
                controls.enabled = true;
            },
            disable: function () {
                controls.enabled = false;
            },
            setTarget: function (position) {
                controls.target.copy(position);
                controls.update();
            },
            getTarget: function () {
                return controls.target;
            },
            update: function () {
                controls.update();
            },
            dolly: function (direction) {
                if (direction === -1)
                    controls.dollyIn();
                else controls.dollyOut();
                controls.update();
            },
            pan: function (x, y) {
                controls.pan(x, y);
                controls.update();
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('orbitControl', service);

})();
