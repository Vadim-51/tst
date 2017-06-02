var Drag3D = function (dependencyContainer, draggingBehaviours) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._keyState = dependencyContainer.getService('keyState');
    this._orbitControl = dependencyContainer.getService('orbitControl');
   // this._scene2DSyncSrvc = dependencyContainer.getService('scene2DSyncSrvc');
    this._object3DPositionHistory = dependencyContainer.getService('object3DPositionHistory');
    this._rayHelper = dependencyContainer.getService('rayHelper');
    this._dimensionalRadialsManager = dependencyContainer.getService('dimensionalRadialsManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._dragBehaviours = draggingBehaviours;
    this._currentDragBehaviour = null;

    this._isDrag = false;
    this._offset = new THREE.Vector3();
    this._rayCaster = new THREE.Raycaster();
    this._objectsDragState = {};
    this._sceneObjects = null;
    this._dragPlane = null;
    this._dragBeginTime = null;
};

Drag3D.prototype = Object.create(ComponentBase.prototype);

Drag3D.prototype.constructor = Drag3D;

Drag3D.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);
    this._select3DComponent = engine.findComponentByType(Select3D);
    this._viewWallComponent = engine.findComponentByType(WallView);
};

Drag3D.prototype._restoreObjectsPosition = function (draggedObjs) {
    var i = 0,
        obj;
    for (; i < draggedObjs.length; i++) {
        obj = draggedObjs[i].parent;
        obj.position.copy(this._objectsDragState[i].lastValidPosition);
    }
};

Drag3D.prototype._saveLastValidPosition = function (draggedObjs) {
    var i = 0,
        dragState;
    for (; i < draggedObjs.length; i++) {
        dragState = this._objectsDragState[i];
        draggedObjs[i].parent.position.copy(dragState.newPosition);
        dragState.lastValidPosition.copy(dragState.newPosition);
    }
};

Drag3D.prototype._getDragBehaviour = function (selected) {
    var i = 0,
        dragBehaviours = this._dragBehaviours,
        dragBehaviour;

    for (; i < dragBehaviours.length; i++) {
        dragBehaviour = dragBehaviours[i];
        if (dragBehaviour.canExecute(selected)) {
            return dragBehaviour;
        }
    }

    return null;
};

Drag3D.prototype.mouseDown = function (e) {

    var selected = this._select3DComponent.selectedObjects;

    if (selected.length === 0)
        return;

    this._sceneUtils.getRay(e.offsetX, e.offsetY, this._rayCaster);

    var intrersection = this._rayHelper.intersectObjectsObb(this._rayCaster.ray, selected)[0];
        //this._rayCaster.intersectObjects(selected)[0];

    if (intrersection) {

        this._currentDragBehaviour = this._getDragBehaviour(selected);

        if (!this._currentDragBehaviour)
            return;

        this._orbitControl.disable();

        //this._object3DPositionHistory.push(); // remembering objects position for posible undo

        this._dragPlane = this._currentDragBehaviour.getDragPlane(selected, intrersection.point);

        this._offset.copy(intrersection.point);

        this._dragBeginTime = new Date().getTime();

        return;
    }

    this._currentDragBehaviour = null;
};

Drag3D.prototype.mouseMove = function (e) {

    this._isDrag = this._keyState.isMouseHold && this._currentDragBehaviour;

    if (this._isDrag) {

        this._sceneUtils.getRay(e.offsetX, e.offsetY, this._rayCaster);

        var draggedObjs = this._select3DComponent.selectedObjects,
            intersectionPoint = this._rayCaster.ray.intersectPlane(this._dragPlane),
            dragBehaviour = this._currentDragBehaviour,
            conntainers = draggedObjs.map(function (o) { return o.parent }),
            newPosition,
            draggedObj,
            i = 0;

        if (!intersectionPoint)
            return false;

        this._sceneObjects = this._sceneObjects || this._stage.getChildren().filter(dragBehaviour.getStaticObjectsFilter(conntainers));

        for (; i < draggedObjs.length; i++) {

            draggedObj = draggedObjs[i];

            //this._dimensionalRadialsManager.deleteDimensionalRadials();
            //this._scene3D.add(this._dimensionalRadialsManager.getDimensionalRadials(draggedObj));

            if (!this._objectsDragState[i]) {
                this._objectsDragState[i] = {};
                this._objectsDragState[i].offset = this._offset.clone().sub(draggedObj.parent.position);
                this._objectsDragState[i].lastValidPosition = draggedObj.parent.position.clone();
            }

            newPosition = dragBehaviour.drag(this._sceneObjects, draggedObjs, draggedObj, this._offset,
                intersectionPoint.clone(), this._objectsDragState[i]);

            if (!newPosition) {
                this._restoreObjectsPosition(draggedObjs);
                return false;
            }

            this._objectsDragState[i].newPosition = newPosition;
        }

        this._saveLastValidPosition(draggedObjs);

        this.fireEvent('drag');

        return false;
    }
};

Drag3D.prototype.mouseUp = function () {

    if (this._currentDragBehaviour && !this._viewWallComponent.isInWallMode())
        this._orbitControl.enable();

    if (this._isDrag) {
        this._currentDragBehaviour.dragEnd();
       // this._sync2DObjects();
        this._currentDragBehaviour = this._sceneObjects = null;
    }

    this._isDrag = false;
    this._objectsDragState = {};

    this.fireEvent('dragEnd');
};

//Drag3D.prototype._sync2DObjects = function () {

//    if (Object.getOwnPropertyNames(this._objectsDragState).length === 0)
//        return;

//    var selected = this._select3DComponent.selectedObjects,
//        i = 0,
//        obj3D;
//    for (; i < selected.length; i++) {
//        obj3D = selected[i];

//        if (obj3D.userData.wall) {
//            this._scene2DSyncSrvc.moveWallObject(obj3D, obj3D.userData.wall);
//        }
//        else {
//            this._scene2DSyncSrvc.moveObject(obj3D);
//        }
//    }
//};