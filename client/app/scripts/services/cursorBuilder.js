; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var createLine = function (vertices, material) {
            var geometry = new THREE.Geometry();
            geometry.vertices = vertices;
            var line = new THREE.Line(geometry, material);
            line.renderOrder = 3;
            return line;
        };

        return {
            buildSplitWallCursor: function () {

                var container = new THREE.Object3D(),
                    material = new THREE.LineBasicMaterial({
                        color: 0xff0000,
                        depthWrite: false,
                        depthTest: false
                    });

                container.add(createLine([
                    new THREE.Vector3(-0.5, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.5, 0, 0)
                ], material));

                container.add(createLine([
                    new THREE.Vector3(-0.5,0 , -0.5),
                    new THREE.Vector3(-0.5, 0, 0),
                    new THREE.Vector3(-0.5, 0, 0.5)
                ], material));

                container.add(createLine([
                    new THREE.Vector3(0.5, 0, -0.5),
                    new THREE.Vector3(0.5, 0, 0),
                    new THREE.Vector3(0.5, 0, 0.5)
                ], material));

                container.name = "splitWallCursor";
                container.visible = false;
                container.renderOrder = 3;

                return container;
            },
            buildDeleteNodeCursor: function () {
                var container = new THREE.Object3D(),
                    lineLength = 20,
                   material = new THREE.LineBasicMaterial({
                       color: 0xff0000,
                       depthWrite: false,
                       depthTest: false
                   });

                container.add(createLine([
                    new THREE.Vector3(-lineLength, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(lineLength, 0, 0)
                ], material));

                container.add(createLine([
                    new THREE.Vector3(0, 0, -lineLength),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, lineLength)
                ], material));

                container.name = "deleteNodeCursor";
                container.visible = false;
                container.renderOrder = 3;

                return container;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('cursorBuilder', service);

})();
