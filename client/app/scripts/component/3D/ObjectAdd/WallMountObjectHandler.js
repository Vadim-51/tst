var WallMountObjectHandler = function (dependencyContainer) {
    WallObjectHandlerBase.prototype.constructor.call(this, dependencyContainer);

    this._inWallRangeChecker = new ObjectInWallRangev2();
};

WallMountObjectHandler.prototype = Object.create(WallObjectHandlerBase.prototype);

WallMountObjectHandler.prototype.constructor = WallMountObjectHandler;

WallMountObjectHandler.prototype.canExecute = function (entity) {
    return this._objectCheckerSrvc.isWallMountable(entity);
};

WallMountObjectHandler.prototype.dragBegin = function (intersection, staticObjs) {

    var intersected = this._wallIntersection(intersection);

    if (intersected) {

        var entity = this._ghostObject.userData.entity;
        var wall = intersected.object;
        var wallDirection = wall.getWorldDirection();
        var offset = wallDirection.clone().multiplyScalar(entity.width / 2).add(wallDirection.multiplyScalar(0.1));
        var position = intersected.point.add(offset);
        position.y = entity.defaultHeightFromFloor + entity.height / 2;

        if (
                this._colliderChecker.check(position, staticObjs, this._ghostObject) &&
                this._inWallRangeChecker.check(wall, entity, position, wall.rotation)
            ) {
            this._ghostObject.rotation.copy(wall.rotation);
            return position;
        }
    }

    return null;
};

WallMountObjectHandler.prototype.dragEnd = function () {
    this._colliderChecker.clearState();
};