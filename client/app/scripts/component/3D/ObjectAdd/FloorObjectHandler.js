var FloorObjectHandler = function (dependencyContainer) {
    AddObjectHandlerBase.prototype.constructor.call(this);

    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');

    this._colliderChecker = new CollideChecker(dependencyContainer);
    this._colliderChecker.useObjectScale(false);
};

FloorObjectHandler.prototype = Object.create(AddObjectHandlerBase.prototype);

FloorObjectHandler.prototype.constructor = FloorObjectHandler;

FloorObjectHandler.prototype.canExecute = function (entity) {
    return !this._objectCheckerSrvc.isWallMountable(entity) &&
        !this._objectCheckerSrvc.isWallEmbeddable(entity);
};

FloorObjectHandler.prototype._floorIntersectionPoint = function (intersection) {
    return intersection.length !== 0 ? intersection[0].point : null;
};

FloorObjectHandler.prototype.getStaticObjectPredicate = function () {
    var base = AddObjectHandlerBase.prototype.getStaticObjectPredicate.call(this);
    return function (obj) {
        return base(obj) && !this._objectCheckerSrvc.isFloor(obj);
    }.bind(this);
};

FloorObjectHandler.prototype.getRaycastObjectPredicate = function () {
    return function (obj) {
        return this._objectCheckerSrvc.isFloor(obj);
    }.bind(this);
};

FloorObjectHandler.prototype.dragBegin = function (intersection, staticObjs) {
    if (intersection.length !== 0) {
        var point = this._floorIntersectionPoint(intersection);

        if (point) {
            point.y += this._ghostObject.userData.entity.height / 2;

            var noCollision = this._colliderChecker.check(point, staticObjs, this._ghostObject);

            if (noCollision) 
                return point;
            else { // if model placed against the wall, it will rotate to face the room, not the wall
                if (this._colliderChecker._collided.userData.entity.isWall) {
                    this._ghostObject.rotation.y = this._colliderChecker._collided.rotation.y;
                }
            }
        }

        return null;
    }
};

FloorObjectHandler.prototype.dragEnd = function () {
    this._colliderChecker.clearState();
};