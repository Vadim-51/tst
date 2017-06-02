var ObjectInWallRange = function (dependencyContainer) {

    this._wall3DDataManager = dependencyContainer.getService('wall3DDataManager');

    this._isFirstCall = false;
   
    this._planeLeft = new THREE.Plane();
    this._planeRight = new THREE.Plane();

    this._rayLeft = new THREE.Ray();
    this._rayRight = new THREE.Ray();
};

ObjectInWallRange.prototype.constructor = ObjectInWallRange;

ObjectInWallRange.prototype.check = function (object, newPosition) {

    if (!newPosition)
        return false;

    if (!this._isFirstCall) {

        this._isFirstCall = true;

        var wallName = object.userData.wall,
            points = this._wall3DDataManager.getPoints(wallName),
            left = points.left.clone(),
            right = points.right.clone(),
            wallDirection = this._wall3DDataManager.getDirection(wallName),
            wallLefToRightCornerDirection = wallDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(90)).normalize();

        this._planeLeft.setFromNormalAndCoplanarPoint(wallLefToRightCornerDirection, left);
        this._planeRight.setFromNormalAndCoplanarPoint(wallLefToRightCornerDirection, right);

        this._rayLeft.direction.copy(wallLefToRightCornerDirection.clone().negate());
        this._rayRight.direction.copy(wallLefToRightCornerDirection.clone());
    }

    var entity = object.userData.entity;

    var m = object.matrixWorld.clone();
    m.setPosition(newPosition);

    this._rayRight.origin.set(entity.length / 2, 0, 0);
    this._rayRight.origin.applyMatrix4(m);

    this._rayLeft.origin.set(-entity.length / 2, 0, 0);
    this._rayLeft.origin.applyMatrix4(m);

    if (this._rayRight.intersectPlane(this._planeRight)
        && this._rayLeft.intersectPlane(this._planeLeft))
        return true;

    return false;
};

ObjectInWallRange.prototype.clearState = function () {
    this._isFirstCall = false;
};