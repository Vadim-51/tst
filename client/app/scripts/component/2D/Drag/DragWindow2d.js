var DragWindow2D = function (dependencyContainer) {
    Drag2D.prototype.constructor.call(this, dependencyContainer);

    this._constants = dependencyContainer.getService('constants');
    this._step3Helper = dependencyContainer.getService('step3Helper');
    //this._obbBuilder = dependencyContainer.getService('obbBuilder');
    this._collisionSrv = dependencyContainer.getService('collisionSrvc');
    this._stage = dependencyContainer.getService('stage');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._wallHoles = dependencyContainer.getService('wallHoles');

    this._rayCaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
};

DragWindow2D.prototype = Object.create(Drag2D.prototype);

DragWindow2D.prototype.constructor = DragWindow2D;

DragWindow2D.prototype.dragging = function (newPosition, draggedObject) {

    var step3Helper = this._step3Helper,
       HighlightState = this._constants.HighlightState;

    this._step3Helper.highlightWallIfDefined(this._selectedWall, HighlightState.DEFAULT);

    draggedObject.position.copy(newPosition);
    draggedObject.updateMatrixWorld();

    this._selectedWall = this.getIntersectedWall(draggedObject);

    if (this._selectedWall) {

        if (!this.isObjectOnWall(draggedObject.getObjectByName('2D'), this._selectedWall)) {
            return;
        }

        newPosition = this._step3Helper.mountToWall(newPosition, this._selectedWall);
        draggedObject.position.copy(newPosition);
    }

    draggedObject.rotation.y = this._selectedWall ? this._selectedWall.rotation.y : draggedObject.rotation.y;

    this._step3Helper.highlightWallIfDefined(this._selectedWall, HighlightState.SELECTED);
};

//DragWindow2D.prototype.isCollide = function (draggedObject, staticObj) {

//    var onWall = true;

//    if (this._selectedWall) {
//        var obb = this._obbBuilder.create()
//                                  .build(draggedObject);
//        onWall = this.isObjectOnWall(this._selectedWall.userData.edgeRays, obb);
//    }

//    return Drag2D.prototype.isCollide.call(this, draggedObject, staticObj) || !onWall;
//};

DragWindow2D.prototype.getStaticObjects = function (draggedObject) {
    var self = this;
    return this._stage.getChildren().filter(function (item) {
        return item !== draggedObject &&
            this._objectCheckerSrvc.isWallEmbeddable(item);
    }.bind(this));
};

DragWindow2D.prototype.dragEnd = function (draggedObject) {

    if (this._selectedWall) {

        var position = this._step3Helper.mountToWall(draggedObject.position, this._selectedWall);

        if (position && !this._collisionSrv.isCollide(draggedObject, this._staticObjs, {
            draggedObjectPosition: position
        })) {
            var newWallName = this._selectedWall.name;
            var oldWallName = draggedObject.userData.wall;

            draggedObject.position.copy(position);

            //object dragged to other wall , remove holes from previous
            if (oldWallName && oldWallName !== newWallName) {
                delete draggedObject.userData.wall;
                this._wallHoles.update(oldWallName);
            }

            draggedObject.userData.wall = newWallName;

            this._wallHoles.update(newWallName);
        }

    } else {
        this._stage.remove(draggedObject);
        this._addObj = false;
    }
};

DragWindow2D.prototype.release = function () {
    this._lockDrag = false;
};

DragWindow2D.prototype.isObjectOnWall = function (object, wall) {
    //var i = 0,
    //    intersection,
    //    ray;
    //for (; i < wallEdgeRays.length; i++) {
    //    ray = wallEdgeRays[i].ray;
    //    if (obb.isIntersectionRay(ray))
    //        return false;
    //}
    //return true;

    var wallBB = new THREE.Box3().setFromObject(wall);
    var objectBB = new THREE.Box3().setFromObject(object);

    return wallBB.containsBox(objectBB);
};

DragWindow2D.prototype.isEnabled = function () {
    return Drag2D.prototype.isEnabled.call(this) &&
        this._objectCheckerSrvc.isWallEmbeddable(this.getSelectedObject());
};
