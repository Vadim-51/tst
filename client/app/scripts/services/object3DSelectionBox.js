; (function () {

    var service = function () {

        var setPositionAndSize = function (mesh) {
            mesh.geometry.computeBoundingBox();
            var selectionBox = mesh.getObjectByName('selection');
            var size = mesh.geometry.boundingBox.size();
            var diff = mesh.geometry.boundingBox.center();          
            selectionBox.scale.set(size.x + 2, size.y, size.z + 2);
            selectionBox.position.copy(diff);
        };

        return {
            addSelectionBoxToMesh: function (mesh) {

                if (mesh.name === 'floor') {
                    var geometry = new THREE.EdgesGeometry(mesh.geometry.clone());

                    var material = new THREE.LineBasicMaterial({
                        color: 0x00ff00,
                        depthTest: false,
                        // depthWrite: false,
                        transparent: true
                    });
                    
                    var selectionBox = new THREE.LineSegments(geometry, material);
                    selectionBox.visible = false;
                    selectionBox.name = 'selection';

                    mesh.geometry.computeBoundingBox();

                    mesh.add(selectionBox);
                }
                else {
                    var geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));

                    var material = new THREE.LineBasicMaterial({
                        color: 0x00ff00,
                        depthTest: false,
                        // depthWrite: false,
                        transparent: true
                    });

                    var selectionBox = new THREE.LineSegments(geometry, material);
                    selectionBox.visible = false;
                    selectionBox.name = 'selection';

                  //  var m = new THREE.Matrix4();
                   // m.extractRotation(mesh.matrixWorld);

                    //diff.applyMatrix4(m);
                   
                    mesh.add(selectionBox);

                    setPositionAndSize(mesh);
                }
            },

            updateSize: function (mesh) {
                setPositionAndSize(mesh);
            },

            rebuild: function (mesh) {
                var selectionBox = mesh.getObjectByName('selection');
                mesh.remove(selectionBox);
                this.addSelectionBoxToMesh(mesh);
            }
        }
    };

    angular.module('vigilantApp').service('object3DSelectionBox', service);
})();