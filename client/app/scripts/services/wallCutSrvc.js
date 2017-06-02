; (function () {

    var service = function () {

        var planeToVec4 = function (p) {
            return new THREE.Vector4(p.normal.x, p.normal.y, p.normal.z, p.constant);
        };

        return {
            cutHolesInWalls: function (walls) {
                for (var i = 0; i < walls.length; i++)
                    this.cutHolesInWall(walls[i]);
            },
            cutHolesInWall: function (wall, wallChildren) {

                wall.updateMatrixWorld();

                //var loc = new THREE.Vector3();
                //wall.localToWorld(loc);
                //loc.negate();

                var loc = wall.position.clone().negate();

                var rotation = new THREE.Matrix4().makeRotationY(wall.rotation.y);
                var planes = [];

                for (var i = 0; i < wallChildren.length; i++) {
                    var child = wallChildren[i];
                    child.updateMatrixWorld();
                    //if (child.name == "roomObject") {
                    var pos = child.position.clone();
                    wall.worldToLocal(pos);
                    pos.negate();

                    var entity = child.userData.entity;
                    var originTranslation = new THREE.Matrix4().makeTranslation(loc.x, loc.y, loc.z);
                    var offsetTranslation = new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z);

                    originTranslation.multiply(rotation);
                    originTranslation.multiply(offsetTranslation);

                    var p1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -entity.length / 2).applyMatrix4(originTranslation);
                    var p2 = new THREE.Plane(new THREE.Vector3(1, 0, 0), -entity.length / 2).applyMatrix4(originTranslation);
                    var p3 = new THREE.Plane(new THREE.Vector3(0, -1, 0), -entity.height / 2).applyMatrix4(originTranslation);
                    var p4 = new THREE.Plane(new THREE.Vector3(0, 1, 0), -entity.height / 2).applyMatrix4(originTranslation);

                    planes.push(planeToVec4(p1));
                    planes.push(planeToVec4(p2));
                    planes.push(planeToVec4(p3));
                    planes.push(planeToVec4(p4));
                    // }
                }

                var innerPlaneMaterial = wall.material.materials[4];
                var outerPlaneMaterial = wall.material.materials[5];

                innerPlaneMaterial.cutPlanes = planes;
                outerPlaneMaterial.cutPlanes = planes;

                innerPlaneMaterial.needsUpdate = true;
                outerPlaneMaterial.needsUpdate = true;
            }
        }

    };

    angular.module('vigilantApp').service('wallCutSrvc', service);
})();