var WallObjectSmartDrag = function (dependencyContainer) {
    DragHandlerBase.prototype.constructor.call(this);

    this._colliderCheck = new CollideChecker(dependencyContainer);
    this._insideRoomChecker = new ObjectInsideRoom(dependencyContainer);

    this._plane = new THREE.Plane();
    this._ray = new THREE.Ray();

    this._direction = {
        HORIZONTAL: 0,
        VERCTICAL: 1
    };

    this._directions = [this._direction.HORIZONTAL, this._direction.VERCTICAL];

    this._moveDirection = new THREE.Vector3();
    
    this.lastCollidedObject = null;
};

WallObjectSmartDrag.prototype = Object.create(DragHandlerBase.prototype);

WallObjectSmartDrag.prototype.constructor = WallObjectSmartDrag;

WallObjectSmartDrag.prototype.canExecute = function (selected) {

    if (selected.length !== 1)
        return false;

    return true;
};

WallObjectSmartDrag.prototype.drag = function (staticObjects, allDraggedObjects,
    curentlyDraggedObject, oldPos, delta, dragState) {

    var resultingPosition = this.prevHandlerComputedPosition || DragHandlerBase.prototype.drag.apply(this, arguments);

    if (!this._colliderCheck.check(resultingPosition, staticObjects, curentlyDraggedObject)) {

        var collided = this._colliderCheck.getCollided(),
            validPosition = dragState.lastValidPosition,
            diff = resultingPosition.clone().sub(validPosition),
            dragDirection = diff.normalize(),
            i = 0,
            currentMoveDirection,
            moveDirection,
            newPosition,
            opositeDirection,
            rayDirection;

        for (; i < this._directions.length; i++) {

            currentMoveDirection = this._directions[i];
            moveDirection = this._getMoveDirection(currentMoveDirection, dragDirection);
            newPosition = validPosition.clone().add(moveDirection);

            if (this._colliderCheck.check(newPosition, [collided], curentlyDraggedObject)) {

                opositeDirection = this._directions.find(function (d) { return d !== currentMoveDirection });
                rayDirection = this._getMoveDirection(opositeDirection, dragDirection).negate();

                this._plane.setFromNormalAndCoplanarPoint(rayDirection, validPosition.clone());
                this._ray.set(resultingPosition.clone(), rayDirection);

                return this._ray.intersectPlane(this._plane);
            }
        }
    }

    return resultingPosition;
};

WallObjectSmartDrag.prototype._getMoveDirection = function (direction, dragDirection) {
    if (direction === this._direction.HORIZONTAL)
        this._moveDirection.set(dragDirection.x, 0, dragDirection.z);
    else
        this._moveDirection.set(0, dragDirection.y, 0);

    return this._moveDirection;
};


WallObjectSmartDrag.prototype.dragEnd = function () {
    this._colliderCheck.clearState();
};