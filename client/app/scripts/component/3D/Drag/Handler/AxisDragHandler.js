var AxisDragHandler = function (dependencyContainer) {
    DragHandlerBase.prototype.constructor.call(this);

    this._keyState = dependencyContainer.getService('keyState');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');

    this._up = new THREE.Vector3(0, 1, 0);

    this._direction = {
        HORIZONTAL: 'h',
        VERTICAL: 'v'
    };

    this._currentDirection = null;
};

AxisDragHandler.prototype = Object.create(DragHandlerBase.prototype);

AxisDragHandler.prototype.constructor = AxisDragHandler;

AxisDragHandler.prototype.canExecute = function (selected) {

    if (!this._keyState.ctrlHold)
        return false;

    var first = selected[0];

    if (!first)
        return false;

    if (this._objectCheckerSrvc.isWallMountable(first) ||
        this._objectCheckerSrvc.isWallEmbeddable(first) )
     return true;
    
    return false;
};

AxisDragHandler.prototype._getDirection = function (oldPos, newPos) {
    var diff = newPos.clone().sub(oldPos).normalize();
    var dot = Math.abs(this._up.dot(diff));
    return dot > 0.9 ? this._direction.VERTICAL : this._direction.HORIZONTAL;
};

AxisDragHandler.prototype.drag = function (staticObjects, draggedObjects, draggedObj, initial, delta, dragState) {

    var resultingPosition = DragHandlerBase.prototype.drag.apply(this, arguments);

    this._currentDirection = this._currentDirection || this._getDirection(initial, delta);

    if (this._currentDirection === this._direction.VERTICAL) 
        delta.set(draggedObj.position.x, resultingPosition.y, draggedObj.position.z);
    else 
        delta.set(resultingPosition.x, draggedObj.position.y, resultingPosition.z);
    
    return delta;
};

AxisDragHandler.prototype.dragEnd = function () {
    this._currentDirection = null;
};