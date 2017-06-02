var CollideChecker = function (dependencyContainer) {
    this._collisionSrvc = dependencyContainer.getService('collisionSrvc');
    this._staticColliderCache = {};
    this._collided = null;
};

CollideChecker.prototype.constructor = CollideChecker;

CollideChecker.prototype.check = function (newPosition,staticObjcts,draggedObj) {
    var collide = this._collisionSrvc.isCollide(draggedObj, staticObjcts, {
        draggedObjectPosition: newPosition,
        staticColliderCache: this._staticColliderCache,
        useObjectScale: this._useScale
    });

    this._collided = collide;

    return !collide;
};

CollideChecker.prototype.getCollided = function () {
    return this._collided;
};

CollideChecker.prototype.clearState = function () {
    this._staticColliderCache = {};
};

CollideChecker.prototype.useObjectScale = function (bool) {
    this._useScale = bool;
};