(function () {

    var box3 = new THREE.Box3();

    var areaForCentroidFloor = function (points) {
        var area = 0;
        var pts = points;
        var nPts = pts.length;
        var j = nPts - 1;
        var p1; var p2;

        for (var i = 0; i < nPts; j = i++) {
            p1 = pts[i]; p2 = pts[j];
            area += p1.x * p2.y;
            area -= p1.y * p2.x;
        }
        area /= 2;

        return area;
    };

    var service = function () {
        return {
            getMeshSize: function (mesh) {
                var geometry = mesh.geometry;
                if (!geometry.boundingBox)
                    geometry.computeBoundingBox();
                return geometry.boundingBox.size();
            },
            computeBoundingSphereFromMeshes: function (meshes) {      
                var bb = this.objectsBoundingBox(meshes);
                return bb.getBoundingSphere();
            },
            isClockwisePolygon: function (points) {
                var sum = 0,
                    i = 0,
                    count = points.length - 1;
                for (; i < count; i++)
                    sum += (points[i + 1].x - points[i].x) * (points[i + 1].z + points[i].z);
                return (sum > 0) ? true : false;
            },
            getWallCenter: function (wall) {
                var size = this.getMeshSize(wall),
                     wallCenter = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2);
                wall.updateMatrixWorld();
                wallCenter.applyMatrix4(wall.matrixWorld);
                return wallCenter;
            },
            getPolygonCenter : function (vertices) {
                var pts = vertices;
                var nPts = pts.length;
                var x = 0; var y = 0;
                var f;
                var j = nPts - 1;
                var p1; var p2;

                for (var i = 0; i < nPts; j = i++) {
                    p1 = pts[i]; p2 = pts[j];
                    f = p1.x * p2.y - p2.x * p1.y;
                    x += (p1.x + p2.x) * f;
                    y += (p1.y + p2.y) * f;
                }

                f = areaForCentroidFloor(vertices) * 6;

                return { x: x / f, y: y / f };
            },
            getObjectsCenter: function (objects) {
                var points = [],
                    i = 0;

                for (; i < objects.length; i++) 
                    points.push(objects[i].position);
                
                box3.setFromPoints(points);

                return box3.center();
            },
            objectsBoundingBox: function (objects) {
                var i = 0,
                    bb,
                    result;

                for (; i < objects.length; i++) {
                    bb = new THREE.Box3().setFromObject(objects[i]);
                    if (i === 0) 
                        result = bb;
                    else 
                        result.union(bb);
                }

                return result;
            }
        }
    };

    angular.module('vigilantApp').service('geometryHelper', service);

})();
