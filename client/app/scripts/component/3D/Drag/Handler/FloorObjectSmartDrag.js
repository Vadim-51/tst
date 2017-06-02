var FloorObjectSmartDrag = function (dependencyContainer) {
    DragHandlerBase.prototype.constructor.call(this);
    this._colliderCheck = new CollideChecker(dependencyContainer);
    this._insideRoomChecker = new ObjectInsideRoom(dependencyContainer);

    this._plane = new THREE.Plane();
    this._ray = new THREE.Ray();

    this._direction = {
        HORIZONTAL: 0,
        VERCTICAL: 1
    };

    this._up = new THREE.Vector3(0,1,0);

    this._directions = [this._direction.HORIZONTAL, this._direction.VERCTICAL];

    this._moveDirection = new THREE.Vector3();

    this.lastCollidedObject = null;
};

FloorObjectSmartDrag.prototype = Object.create(DragHandlerBase.prototype);

FloorObjectSmartDrag.prototype.constructor = FloorObjectSmartDrag;

FloorObjectSmartDrag.prototype.canExecute = function (selected) {

    if (selected.length !== 1)
        return false;

    return true;
};

FloorObjectSmartDrag.prototype.drag = function (staticObjects, allDraggedObjects,
    curentlyDraggedObject, oldPos, delta, dragState) {

    var resultingPosition = delta.clone().sub(dragState.offset);

    var isCollided = !this._colliderCheck.check(resultingPosition, staticObjects, curentlyDraggedObject);
    if (isCollided) this.lastCollidedObject = this._colliderCheck.getCollided();

    if (isCollided || !this._insideRoomChecker.check(resultingPosition)) {

        var collided = this._colliderCheck.getCollided() || this.lastCollidedObject,
            validPosition = dragState.lastValidPosition,
            diff = resultingPosition.clone().sub(validPosition),
            dragDirection = diff.normalize(),
            i = 0,
            currentMoveDirection,
            angle,
            moveDirection,
            newPosition,
            opositeDirection,
            rayDirection;

        for (; i < this._directions.length; i++) {

            currentMoveDirection = this._directions[i];
            angle = collided.rotation.y;
            moveDirection = this._getMoveDirection(angle, currentMoveDirection, dragDirection);
            newPosition = validPosition.clone().add(moveDirection);

            if (this._colliderCheck.check(newPosition, [collided], curentlyDraggedObject)) {

                opositeDirection = this._directions.find(function (d) { return d !== currentMoveDirection });
                rayDirection = this._getMoveDirection(angle, opositeDirection, dragDirection).negate();

                this._plane.setFromNormalAndCoplanarPoint(rayDirection, validPosition.clone());
                this._ray.set(resultingPosition.clone(), rayDirection);

                return this._ray.intersectPlane(this._plane);
            }
        }
    }

    return null;
};

FloorObjectSmartDrag.prototype._getMoveDirection = function (angle, direction, dragDirection) {

    if (direction === this._direction.HORIZONTAL)
        this._moveDirection.set(1 * Math.sign(dragDirection.x), 0, 0);
    else
        this._moveDirection.set(0, 0, 1 * Math.sign(dragDirection.z));

    var angleDeg = Math.abs(THREE.Math.radToDeg(angle));

    if (this._isPerpendicular(angleDeg)) 
        return this._moveDirection;
    else 
        return this._moveDirection.applyAxisAngle(this._up, angleDeg > 90 ? angle - Math.PI : angle);
};


FloorObjectSmartDrag.prototype.dragEnd = function () {
    this._colliderCheck.clearState();
};

FloorObjectSmartDrag.prototype._isPerpendicular = function (angle) {
    var angles = [0, 90, 180, 270, 360],
        i = 0,
        item;
    for (; i < angles.length; i++) {
        item = angles[i];
        if (angle >= item - 0.1 && angle <= item + 0.1)
            return true;
    }
    return false;
};