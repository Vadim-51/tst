var DragBehaviorBase = function (handlers) {
    this._handlers = handlers || [];
    this._dragPlane = new THREE.Plane();
};

DragBehaviorBase.prototype.constructor = DragBehaviorBase;

DragBehaviorBase.prototype.drag = function (staticObjects, draggedObjects,
    curentlyDraggedObject, offset, newPos, dragState) {

    var resultingPosition = null,
        handlers = this._handlers,
        handler,
        i = 0;

    for (; i < handlers.length; i++) {
        handler = handlers[i];
        if (handler.canExecute(draggedObjects)) {
            handler.setPosition(resultingPosition);
            resultingPosition = handler.drag.apply(handler, arguments);
        }
    }

    return resultingPosition;
};

DragBehaviorBase.prototype.dragEnd = function () {
    for (var i = 0; i < this._handlers.length; i++)
        this._handlers[i].dragEnd();
};

DragBehaviorBase.prototype.getStaticObjectsFilter = function (draggedObjs) {
    return function (obj) {
        return obj.visible &&
            //obj instanceof THREE.Mesh &&
            obj.userData.entity && 
            draggedObjs.indexOf(obj) === -1;
    };
};



