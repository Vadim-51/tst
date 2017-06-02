var AddObjectHandlerBase = function () {
    this._ghostObject = null;
};

AddObjectHandlerBase.prototype.constructor = AddObjectHandlerBase;

AddObjectHandlerBase.prototype.canExecute = function (entity) {
    return true;
};

AddObjectHandlerBase.prototype.dragBegin = function (intersection,staticObjs) {
    return null;
};

AddObjectHandlerBase.prototype.dragEnd = function () {};

AddObjectHandlerBase.prototype.setGhostObject = function (obj) {
    this._ghostObject = obj;
};

AddObjectHandlerBase.prototype.getStaticObjectPredicate = function () {
    return function (obj) {
        return obj !== this._ghostObject && obj.userData.entity;
    }.bind(this);
};

AddObjectHandlerBase.prototype.getRaycastObjectPredicate = function () {
    return function () { };
};