; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var controls;
        var controlSize = 30;

        var buttons = [
            {
                name: 'rotateCounterClockwise',
                image: new THREE.TextureLoader().load("/images/objectControls/rotateCounterClockwise.png")
            },
            {
                name: 'delete',
                image: new THREE.TextureLoader().load("/images/objectControls/delete.png")
            },
            //{
            //    name: 'info',
            //    image: new THREE.TextureLoader().load("/images/objectControls/info.png")
            //},
            {
                name: 'clone',
                image: new THREE.TextureLoader().load("/images/objectControls/clone.png")
            },
            {
                name: 'rotateClockwise',
                image: new THREE.TextureLoader().load("/images/objectControls/rotateClockwise.png")
            }
        ];

        var buildControl = function (button) {

            var geometry = new THREE.PlaneBufferGeometry(controlSize, controlSize);
            var material = new THREE.MeshBasicMaterial({
                map: button.image,
                depthTest: false,
                depthWrite: false,
                transparent: true 
            });
            var plane = new THREE.Mesh(geometry, material);

            plane.position.y = controlSize / 2;
            plane.name = button.name;

            return plane;
        };

        var buildControls = function () {
            var container = new THREE.Object3D(),
                control,
                controlsCount = buttons.length - 1,
                i = 0;

            for (; i < buttons.length; i++) {
                control = buildControl(buttons[i]);
                container.add(control);
            }

            container.name = "objectControls";
            container.visible = false;

            return container;
        };

        return {
            build: function () {
                if (!controls)
                    controls = buildControls();
                return controls;
            },
            getButton: function (ray) {
                if (controls) {
                    var intersection = ray.intersectObject(controls, true)[0];
                    if (intersection && intersection.object.visible)
                        return intersection.object.name;
                }
                return null;
            },
            setVisibility: function (bool) {
                if (controls) {
                    controls.visible = bool;
                }
            },
            setButtonVisibility: function (button, bool) {
                if (controls)
                    controls.getObjectByName(button).visible = bool;
            },
            setPosition: function (p) {
                if (controls)
                    controls.position.copy(p);
            },
            isVisible: function () {
                return controls ? controls.visible : false;
            },
            update: function () {
                if (controls) {

                    var i = 0,
                        btns = controls.children,
                        visible = btns.filter(function (b) {
                            return b.visible;
                        }),
                        visibleCount = visible.length,
                        hiddenCount = btns.length - visibleCount,
                        offset = (visibleCount - 1) / 2 * controlSize;

                    for (; i < visibleCount; i++) {
                        visible[i].position.x = controlSize * i - offset;
                    }

                    this.setVisibility(visibleCount !== 0);
                }
            },
            lookAtCamera: function (cameraPosition) {
                if (controls)
                    controls.lookAt(cameraPosition);
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objectControls', service);

})();
