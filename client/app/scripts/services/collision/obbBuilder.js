; (function () {

    var service = function () {

        var builder = function () {
            this._position = null;
            this._size = null;
            this._bb = null;
            this._rotation = null;
            this._useScale = true;
        };

        builder.prototype.setPosition = function (pos) {
            this._position = pos;
            return this;
        };

        builder.prototype.setSize = function (size) {
            this._size = size;
            return this;
        };

        builder.prototype.setRotation = function (euler) {
            if (euler instanceof THREE.Euler)
                this._rotation = euler;
            return this;
        };

        builder.prototype.setBoundingBox = function (bb) {
            this._bb = bb;
            return this;
        };

        builder.prototype.useObjectScale = function (bool) {
            if (typeof (bool) === "boolean") {
                this._useScale = bool;
            }
            return this;
        };

        builder.prototype.build = function (obj) {

            var aabb = this._bb;

            if (!obj.geometry.boundingBox)
                obj.geometry.computeBoundingBox();

            if (!aabb) {
                if (this._size) {
                    aabb = new THREE.Box3().setFromCenterAndSize(obj.geometry.boundingBox.center(), this._size);
                }
                else {
                    aabb = 
                        obj.geometry.boundingBox.clone();
                }
            }

            obj.updateMatrixWorld();

            var mWorld = obj.matrixWorld.clone();

            //allow specify another position of OBB
            if (this._position)
                mWorld.setPosition(this._position);

            var basis = new THREE.Matrix4();

            if (this._rotation)
                basis.makeRotationFromEuler(this._rotation);
            else
                basis.extractRotation(mWorld);

            var w = mWorld.elements;
            var position = aabb.center().applyMatrix4(mWorld);
            var halfSizes = aabb.size().multiplyScalar(0.5);

            if (this._useScale) {
                var scale = new THREE.Vector3(w[0], w[1], w[2]).length();
                halfSizes.multiplyScalar(scale);
            }

            return new OBB(position, halfSizes, basis);
        };

        return {
            create: function () {
                return new builder();
            }
        }
    };

    angular.module('vigilantApp').service('obbBuilder', service);

})();