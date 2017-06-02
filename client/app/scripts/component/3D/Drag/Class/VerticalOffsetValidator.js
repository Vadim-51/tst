var VerticalOffsetValidator = function (dependencyContainer) {
    this._constants = dependencyContainer.getService('constants');
};

VerticalOffsetValidator.prototype.constructor = VerticalOffsetValidator;

VerticalOffsetValidator.prototype.check = function (newPosition, draggedObj) {
    var entity = draggedObj.userData.entity,
        isAboveFloor = newPosition.y - (entity.height / 2) >= 0,
        isBelowRoof = newPosition.y + (entity.height / 2) <= this._constants.wallHeight;

    if (!isAboveFloor || !isBelowRoof) 
        return false;
    
    return true;
};

VerticalOffsetValidator.prototype.clearState = function () { };