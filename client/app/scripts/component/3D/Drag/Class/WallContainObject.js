var WallContainObject = function () {
    this._matrix = new THREE.Matrix4();
    this._wallBox = new THREE.Box3();
    this._objectBox = new THREE.Box3();
    this._objectBoxCenter = new THREE.Vector3();
    this._objectBoxSize = new THREE.Vector3();
};

WallContainObject.prototype.constructor = WallContainObject;

WallContainObject.prototype.check = function (wall, entity, newPosition, rotation) {

    if (!wall.geometry.boundingBox)
        wall.geometry.computeBoundingBox();

    this._wallBox.copy(wall.geometry.boundingBox);
    this._wallBox.applyMatrix4(wall.matrixWorld);

    this._matrix.identity();
    this._matrix.makeRotationFromEuler(rotation);
    this._matrix.setPosition(newPosition);

    this._objectBoxSize.set(entity.length, entity.height, 1);
    this._objectBox.setFromCenterAndSize(this._objectBoxCenter, this._objectBoxSize);
    this._objectBox.applyMatrix4(this._matrix);

    return this._wallBox.containsBox(this._objectBox);
};