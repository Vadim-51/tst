var FloorObjectDrag = function (dependencyContainer, handlers) {

    DragBehaviorBase.prototype.constructor.call(this, handlers);

    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');

    this._up = new THREE.Vector3(0, 1, 0);

    this._insideRoomChecker = new ObjectInsideRoom(dependencyContainer);
    this._colliderCheck = new CollideChecker(dependencyContainer);
};

FloorObjectDrag.prototype = Object.create(DragBehaviorBase.prototype);

FloorObjectDrag.prototype.constructor = FloorObjectDrag;

FloorObjectDrag.prototype.canExecute = function (selected) {
    var i = 0,
        obj;

    for (; i < selected.length; i++) {
        obj = selected[i];
        if (
            this._objectCheckerSrvc.isWallEmbeddable(obj) ||
            this._objectCheckerSrvc.isWallMountable(obj) ||
            this._objectCheckerSrvc.isFloor(obj) ||
            this._objectCheckerSrvc.isWall(obj)
            )
            return null;
    }

    return this;
};

FloorObjectDrag.prototype.drag = function (staticObjects, allDraggedObjects,
    curentlyDraggedObject, oldPos, newPos, dragState) {

    var resultingPosition = DragBehaviorBase.prototype.drag.apply(this, arguments) || newPos.sub(dragState.offset);

    if (!this._insideRoomChecker.check(resultingPosition) ||
        !this._colliderCheck.check(resultingPosition, staticObjects, curentlyDraggedObject)
        )
        return null;

    return resultingPosition;
};

FloorObjectDrag.prototype.dragEnd = function () {
    this._insideRoomChecker.clearState();
    this._colliderCheck.clearState();

    DragBehaviorBase.prototype.dragEnd.call(this);
};

FloorObjectDrag.prototype.getDragPlane = function (objects, position) {
    this._dragPlane.setFromNormalAndCoplanarPoint(this._up, position);
    return this._dragPlane;
};

FloorObjectDrag.prototype.getStaticObjectsFilter = function (draggedObjs) {
    var base = DragBehaviorBase.prototype.getStaticObjectsFilter.call(this, draggedObjs);
    return function (obj) {
        return base(obj) &&
           !this._objectCheckerSrvc.isFloor(obj);
    }.bind(this);
};