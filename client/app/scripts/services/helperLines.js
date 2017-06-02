/*
 * show green perpendicular lines when draw custom room or move corner
 */
; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });

        var lineType = {
            HORIZONTAL: 0,
            VERTICAL: 1
        };

        var buildLine = function (type, material) {

            var geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(-5000, 0, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(5000, 0, 0)
            );

            var line = new THREE.Line(geometry, material);
            line.visible = false;
            line.name = (type === lineType.HORIZONTAL) ? 'horizontalHelperLine' : 'verticalHelperLine';
            line.rotation.y = (type === lineType.VERTICAL) ? Math.PI / 2 : 0;

            return line;
        };

        var pointIntersection = function (point, points) {
            var pointX,
                pointY,
                i = 0,
                item;

            for (; i < points.length; i++) {
                item = points[i];
                if (Math.abs(item.x - point.x) < 12)
                    pointY = item;
                else if (Math.abs(item.z - point.z) < 12)
                    pointX = item;
            }

            return { horizontal: pointX, vertical: pointY };
        };

        var horizontal = buildLine(lineType.HORIZONTAL, lineMaterial);
        var vertical = buildLine(lineType.VERTICAL, lineMaterial);

        return {
            test: function (point, points) {

                var intersection = pointIntersection(point, points);
                var result = new THREE.Vector3();

                this.hideAll();

                if (intersection.horizontal && intersection.vertical) {
                    horizontal.position.set(intersection.horizontal.x, 0, intersection.horizontal.z);
                    vertical.position.set(intersection.vertical.x, 0, intersection.vertical.z);
                    horizontal.visible = vertical.visible = true;
                    result.set(intersection.vertical.x, 0, intersection.horizontal.z);
                }
                else if (intersection.horizontal) {
                    horizontal.position.set(intersection.horizontal.x, 0, intersection.horizontal.z);
                    horizontal.visible = true;
                    result.set(point.x, 0, intersection.horizontal.z);
                }
                else if (intersection.vertical) {
                    vertical.position.set(intersection.vertical.x, 0, intersection.vertical.z);
                    vertical.visible = true;
                    result.set(intersection.vertical.x, 0, point.z);
                }
                else
                    result = null;

                return result;
            },
            getLines: function () {
                this.hideAll();
                return [horizontal, vertical];
            },
            hideAll: function () {
                vertical.visible = horizontal.visible = false;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('helperLines', service);

})();
