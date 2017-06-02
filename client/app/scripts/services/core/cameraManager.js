; (function () {
    'use strict';

    var dependencies = ['orbitControl'];

    var service = function (orbitControl) {

        var states = [];

        var findStateByName = function (name) {
            var i = 0,
                state;
            for (; i < states.length; i++) {
                state = states[i];
                if (state.name == name)
                    return state;
            }
            return null;
        };

        var removeIfExist = function (name) {
            var state = findStateByName(name);
            if (state)
                states.splice(states.indexOf(state), 1);
        };

        var orto = new THREE.OrthographicCamera();
        orto.near = -1000;
        orto.far = 1000;
        orto.rotateX(-Math.PI / 2);
        orto.updateMatrixWorld();
        //orto.updateProjectionMatrix();

        var perspective = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);

        var activeCamera = orto;

        return {

            saveState: function (stateName) {
                removeIfExist(stateName);
                var camera = activeCamera;
                states.push({
                    name: stateName,
                    position: camera.position.clone(),
                    rotation: camera.rotation.clone(),
                    target: orbitControl.getTarget().clone()
                });
            },

            restoreState: function (stateName) {
                var camera = activeCamera;
                var state = findStateByName(stateName);
                if (state) {
                    camera.position.copy(state.position);
                    camera.rotation.copy(state.rotation);
                    orbitControl.setTarget(state.target);
                    states.splice(states.indexOf(state), 1);
                    //camera.updateMatrixWorld();
                    //camera.updateProjectionMatrix();
                    //orbitControl.update();
                }
            },

            hasState: function (stateName) {
                return findStateByName(stateName);
            },

            clearState: function () {
                states.length = 0;
            },

            getPerspective: function () {
                return perspective;
            },

            getOrtografic: function () {
                return orto;
            },

            switchTo2D: function () {
                activeCamera = orto;
            },

            switchTo3D: function () {
                activeCamera = perspective;
            },

            getCamera: function () {
                return activeCamera;
            },

            resize: function (w, h) {
                perspective.aspect = w / h;
                perspective.updateProjectionMatrix();

                orto.left = -w / 2;
                orto.right = w / 2;
                orto.top = h / 2;
                orto.bottom = -h / 2;
                orto.updateProjectionMatrix();
            }

        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('cameraManager', service);

})();
