var WallObjectDrag = function (dependencyContainer, handlers) {

    DragBehaviorBase.prototype.constructor.call(this, handlers);

    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');

    this._verticalOffsetValidator = new VerticalOffsetValidator(dependencyContainer);
    this._colliderCheck = new CollideChecker(dependencyContainer);
};

WallObjectDrag.prototype = Object.create(DragBehaviorBase.prototype);

WallObjectDrag.prototype.constructor = WallObjectDrag;

WallObjectDrag.prototype.canExecute = function (selected) {

    for (var i = 0; i < selected.length; i++) {
        if (this._objectCheckerSrvc.isWallMountable(selected[i]))
            continue;
        else
            return false;
    }

    return true;
};

WallObjectDrag.prototype.getDragPlane = function (selected, position) {

    var first = selected[0];

    this._dragPlane.setFromNormalAndCoplanarPoint(first.getWorldDirection(), position);

    return this._dragPlane;
};

WallObjectDrag.prototype.drag = function (staticObjects, allDraggedObjects,
    curentlyDraggedObject, oldPos, newPos, dragState) {

    var resultingPosition = DragBehaviorBase.prototype.drag.apply(this, arguments) || newPos.sub(dragState.offset);

    if (!this._verticalOffsetValidator.check(resultingPosition, curentlyDraggedObject) ||
        !this._colliderCheck.check(resultingPosition, staticObjects, curentlyDraggedObject)
    ) {
        return null;
    }
    else {
        return resultingPosition;
    }
};

WallObjectDrag.prototype.dragEnd = function () {
    this._colliderCheck.clearState();
    DragBehaviorBase.prototype.dragEnd.call(this);
};

WallObjectDrag.prototype.getStaticObjectsFilter = function (draggedObjs) {
    var base = DragBehaviorBase.prototype.getStaticObjectsFilter.call(this, draggedObjs);
    return function (obj) {
        return base(obj) &&
            !this._objectCheckerSrvc.isFloor(obj);
    }.bind(this);
};