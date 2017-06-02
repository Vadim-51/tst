var DragHandlerBase = function () {
    this.prevHandlerComputedPosition = null;
};

DragHandlerBase.prototype.constructor = DragHandlerBase;

DragHandlerBase.prototype.setPosition = function (position) {
    this.prevHandlerComputedPosition = position;
};

DragHandlerBase.prototype.canExecute = function (selected) {
    return true;
};

DragHandlerBase.prototype.drag = function (staticObjects, draggedObjects,
    curentlyDraggedObject, oldPos, delta, dragState) {
    return delta.clone().sub(dragState.offset);
};

DragHandlerBase.prototype.dragEnd = function () {};