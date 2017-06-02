var ObjectInWallRangev2 = function () {
    this._matrix = new THREE.Matrix4();

    this._wallBoxExpand = new THREE.Vector3();
    this._wallBox = new THREE.Box3();

    this._objectBox = new THREE.Box3();
    this._objectBoxCenter = new THREE.Vector3();
    this._objectBoxSize = new THREE.Vector3();
};

ObjectInWallRangev2.prototype.constructor = ObjectInWallRangev2;

ObjectInWallRangev2.prototype.check = function (wall, entity, newPosition, rotation) {

    this._wallBoxExpand.set(0, 0, entity.width * 2);

    if (!wall.geometry.boundingBox)
        wall.geometry.computeBoundingBox();

    this._wallBox.copy(wall.geometry.boundingBox);
    this._wallBox.expandByVector(this._wallBoxExpand);
    this._wallBox.applyMatrix4(wall.matrixWorld);

    this._matrix.identity();
    this._matrix.makeRotationFromEuler(rotation);
    this._matrix.setPosition(newPosition);

    this._objectBoxSize.set(entity.length, entity.height, 1);
    this._objectBox.setFromCenterAndSize(this._objectBoxCenter, this._objectBoxSize);
    this._objectBox.applyMatrix4(this._matrix);

    return this._wallBox.containsBox(this._objectBox);
};

