var DragCabinet2D = function (dependencyContainer) {
    Drag2D.prototype.constructor.call(this, dependencyContainer);

    this._constants = dependencyContainer.getService('constants');
    this._stage = dependencyContainer.getService('stage');
    this._step3Helper = dependencyContainer.getService('step3Helper');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    //this._roomStateManager = dependencyContainer.getService('roomStateManager');
    this._collisionSrv = dependencyContainer.getService('collisionSrvc');
    // this._obbBuilder = dependencyContainer.getService('obbBuilder');
    this._objectGapHelperSrvc = dependencyContainer.getService('objectGapHelperSrvc');
};

DragCabinet2D.prototype = Object.create(Drag2D.prototype);

DragCabinet2D.prototype.constructor = DragCabinet2D;

DragCabinet2D.prototype.dragging = function (newPosition, draggedObject) {

    this._step3Helper.highlightWallIfDefined(this._selectedWall, this._constants.HighlightState.DEFAULT);

    this._selectedWall = this.getIntersectedWall(draggedObject);

    if (this._selectedWall) {
        if (!draggedObject.userData.entity.disableAutoOrientation)
            draggedObject.rotation.y = this._selectedWall.rotation.y;

        this._step3Helper.highlightWallIfDefined(this._selectedWall, this._constants.HighlightState.SELECTED);
    }

    draggedObject.position.copy(newPosition);
};

DragCabinet2D.prototype.dragEnd = function (draggedObject) {
    if (this._selectedWall) {

        var snapPosition = this._step3Helper.snapToWallWithGap(draggedObject, this._selectedWall);

        var collided = this._collisionSrv.isCollide(draggedObject, this._staticObjs, {
            draggedObjectPosition: snapPosition
        });

        var allWallsExceptSelected = this._stage.getWalls().filter(function (w) {
            return w !== this._selectedWall;
        }.bind(this));

        var secondWall = this._collisionSrv.isCollide(draggedObject, allWallsExceptSelected, {
            draggedObjectPosition: snapPosition
        });

        if (!collided && !secondWall) {
            draggedObject.position.copy(snapPosition);
        } else {
            if (collided) {
                //this.edgeSnap(draggedObject, collided);
                //correctPosition.call(this, draggedObject);
            }
            else {
                this.cornerSnap(draggedObject, secondWall, this._selectedWall);
            }
        }
    } else {
        correctPosition.call(this, draggedObject);
    }
};

function correctPosition(obj) {
    if (this._objectCheckerSrvc.isWallMountable(obj) &&
        this._objectCheckerSrvc.isWallEmbeddable(obj)) {
        this._addObj = false;
        this._stage.remove(obj);
    }
}

DragCabinet2D.prototype.edgeSnap = function (draggedObject, collided) {

    var edgeSnapLength = 15,
        collidedEntity = collided.userData.entity,
        draggedPosition = this._step3Helper.snapToWall(draggedObject.position.clone(), this._selectedWall),
        collidedPosition = this._step3Helper.snapToWall(collided.position.clone(), this._selectedWall),
        len = draggedPosition.distanceTo(collidedPosition),
        shouldEdgeSnap = len > collidedEntity.length - edgeSnapLength;
    if (shouldEdgeSnap) {

        var direction = draggedPosition.clone().sub(collidedPosition).normalize();
        var draggedEntity = draggedObject.userData.entity;
        var wallDir = this._selectedWall.getWorldDirection();
        var draggedObjectBorder = draggedEntity.borders;

        var position = collidedPosition.clone()
            .add(direction.clone().multiplyScalar(collidedEntity.length / 2))
            .add(direction.clone().multiplyScalar(draggedEntity.length / 2))
            .add(wallDir.clone().multiplyScalar(collidedEntity.width / 2));

        if (draggedObjectBorder && draggedObjectBorder.wall)
            position.add(wallDir.multiplyScalar(parseFloat(draggedObjectBorder.wall)));

        var gap = this._objectGapHelperSrvc.getGapBetweenTwoObjects(draggedEntity, collidedEntity);

        if (gap !== 0)
            position.add(direction.multiplyScalar(gap));
        else
            //remove this after add gap for wall panels on server
            position.add(direction.multiplyScalar(0.15875));

        position.z = draggedObject.position.z;

        if (!this._collisionSrv.isCollide(draggedObject, this.getStaticObjects(draggedObject), {
            draggedObjectPosition: position,
            upAxis: 'z'
        })) {
            draggedObject.position.copy(position);
        }
    }
};

DragCabinet2D.prototype.cornerSnap = function (obj, wallA, wallB) {
    var collidedPosition = this._step3Helper.snapToWallWithGap(obj, wallA);
    obj.position.copy(collidedPosition);
    collidedPosition = this._step3Helper.snapToWallWithGap(obj, wallB);
    obj.position.copy(collidedPosition);
};

DragCabinet2D.prototype.isKnownObject = function (obj) {
    //return entity instanceof this._constants.RoomObject.Cabinet ||
    //    entity instanceof this._constants.RoomObject.WallPanel ||
    //    entity instanceof this._constants.RoomObject.Table;
    return !this._objectCheckerSrvc.isWallMountable(obj) &&
        !this._objectCheckerSrvc.isWallEmbeddable(obj);
};

DragCabinet2D.prototype.isEnabled = function () {
    return Drag2D.prototype.isEnabled.call(this) &&
        this.isKnownObject(this.getSelectedObject());
};