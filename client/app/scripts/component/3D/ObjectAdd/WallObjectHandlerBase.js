var WallObjectHandlerBase = function (dependencyContainer) {
    AddObjectHandlerBase.prototype.constructor.call(this);

    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');

    this._colliderChecker = new CollideChecker(dependencyContainer);
    this._colliderChecker.useObjectScale(false);
};

WallObjectHandlerBase.prototype = Object.create(AddObjectHandlerBase.prototype);

WallObjectHandlerBase.prototype.constructor = WallObjectHandlerBase;

WallObjectHandlerBase.prototype._wallNotTransparent = function (wall) {
    return wall.material.materials[0].opacity === 1;
};

WallObjectHandlerBase.prototype._wallIntersection = function (intersection) {
    var i = 0,
        intersected;
    for (; i < intersection.length; i++) {
        intersected = intersection[i];
        if (this._wallNotTransparent(intersected.object))
            return intersected;
    }
    return null;
}

WallObjectHandlerBase.prototype.getStaticObjectPredicate = function () {
    var base = AddObjectHandlerBase.prototype.getStaticObjectPredicate.call(this);
    return function (obj) {
        return base(obj) && !this._objectCheckerSrvc.isWall(obj);
    }.bind(this);
};

WallObjectHandlerBase.prototype.getRaycastObjectPredicate = function () {
    return function (obj) {
        return this._objectCheckerSrvc.isWall(obj);
    }.bind(this);
};