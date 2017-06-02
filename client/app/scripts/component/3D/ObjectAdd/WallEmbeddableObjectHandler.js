var WallEmbeddableObjectHandler = function (dependencyContainer) {
    WallObjectHandlerBase.prototype.constructor.call(this, dependencyContainer);

    this._wallContainObjectChecker = new WallContainObject();
};

WallEmbeddableObjectHandler.prototype = Object.create(WallObjectHandlerBase.prototype);

WallEmbeddableObjectHandler.prototype.constructor = WallEmbeddableObjectHandler;

WallEmbeddableObjectHandler.prototype.canExecute = function (entity) {
    return this._objectCheckerSrvc.isWallEmbeddable(entity);
};

WallEmbeddableObjectHandler.prototype.getStaticObjectPredicate = function () {
    var base = WallObjectHandlerBase.prototype.getStaticObjectPredicate.call(this);
    return function (obj) {
        return base(obj) && !this._objectCheckerSrvc.isFloor(obj);
    }.bind(this);
};

WallEmbeddableObjectHandler.prototype.dragBegin = function (intersection, staticObjs) {

    var intersected = this._wallIntersection(intersection);

    if (intersected) {

        var wall = intersected.object;
        var entity = this._ghostObject.userData.entity;
        var wallDirection = wall.getWorldDirection().negate();
        var offset = wallDirection.multiplyScalar(wall.userData.entity.width / 2);
        var position = intersected.point.add(offset);
        var floorOffset = entity.defaultHeightFromFloor || 0.1;

        //TODO remove this after add defaultHeightFromFloor to windows on server
        if (this._objectCheckerSrvc.isWindow(this._ghostObject)) {
            floorOffset = 150;
        }

        position.y = floorOffset + entity.height / 2;

        if (
                this._colliderChecker.check(position, staticObjs, this._ghostObject) &&
                this._wallContainObjectChecker.check(wall, entity, position, wall.rotation)
            ) {
            this._ghostObject.rotation.copy(wall.rotation);
            this._ghostObject.userData.wall = wall.name;
            return position;
        }
    }

    return null;
};

WallEmbeddableObjectHandler.prototype.dragEnd = function () {
    this._colliderChecker.clearState();
};
