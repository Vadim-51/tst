var MoveWall = function (dependencyContainer) {
    WallLengthChangeBase.prototype.constructor.call(this, dependencyContainer);

    this._keyState = dependencyContainer.getService('keyState');
    this._wallConnectionSrvc = dependencyContainer.getService('wallConnectionSrvc');
    this._wallNumberSrvc = dependencyContainer.getService('wallNumberSrvc');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._wall = null;
    this._childrenAttached = false;
};

MoveWall.prototype = Object.create(WallLengthChangeBase.prototype);

MoveWall.prototype.constructor = MoveWall;

MoveWall.prototype.init = function (engine) {
    WallLengthChangeBase.prototype.init.call(this, engine);
    this._showSizesOnFloorClick = engine.findComponentByType(ShowSizesOnFloorClick);
    this._wallHover = engine.findComponentByType(WallHighlight);
};

MoveWall.prototype.mouseDown = function (e) {
    this._clickTime = new Date().getTime();

    var p = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(500);

    this._raycaster.ray.origin.copy(p);

    var walls = this._stage.getWalls();
    var intersection = this._raycaster.intersectObjects(walls)[0];

    if (intersection) {
        this._wall = intersection.object;
        this._lastPosition = p;
        this._lastPosition.y = 0;
    }
};

MoveWall.prototype.mouseMove = function (e) {

    var fastClick = new Date().getTime() - this._clickTime < 150;

    if (!fastClick && this._wall && this._keyState.isMouseHold) {

        this._wallHover.deselect();

        this._drag = true;

        this.fireEvent('move');

        var currentMousePosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(0);
        var movedDelta = this._lastPosition.clone().sub(currentMousePosition).negate();

        this._lastPosition = currentMousePosition;

        if (!this._childrenAttached) {
            this._childrenAttached = true;
            this._attachWallObjects(this._wall);
        }

        this._shiftWall(this._wall, movedDelta);

        this._showSizes(true);

        //this._Scene2d.render();
        this._stage.getCanvas().style.cursor = 'move';

        return false;
    }
};

MoveWall.prototype._showSizes = function (bool) {
    var walls = this._stage.getWalls(),
        i = 0;
    for (; i < walls.length; i++)
        this._roomSizeManager.setWallSizeVisibility(walls[i], bool);
};


MoveWall.prototype._movePoint = function (a, b, delta) {
    var dir = a.clone().sub(b).normalize();
    var moveDir = delta.clone().normalize();
    var dot = moveDir.dot(dir);

    if (dot < 0)
        dir.negate();

    dir.multiplyScalar(delta.length());

    return a.clone().add(dir);
};

MoveWall.prototype._updateConnectionPoint = function (pointIndex) {
    var connectionPoint = this._stage.getConnectionPointByIndex(pointIndex + 1),
        point = this._roomStateManager.getPoint(pointIndex);
    connectionPoint.position.copy(point);
    //connectionPoint.position.y = 500;
};

MoveWall.prototype._shiftWall = function (draggedWall, movedDelta) {

    var points = this._roomStateManager.getPoints(),
         currentWallIndex = draggedWall.userData.index,
         nextWallIndex = this._roomStateManager.getNextPointIndex(currentWallIndex),
         prevWallIndex = this._roomStateManager.getPrevPointIndex(currentWallIndex),
         prevPrevIndex = this._roomStateManager.getPrevPointIndex(prevWallIndex),
         nextNextIndex = this._roomStateManager.getNextPointIndex(nextWallIndex),

         nextWall = this._stage.getWallByIndex(nextWallIndex + 1),
         prevWall = this._stage.getWallByIndex(prevWallIndex + 1),
         prevPrevWall = this._stage.getWallByIndex(prevPrevIndex + 1),
         nextNextWall = this._stage.getWallByIndex(nextNextIndex + 1),

         draggedWallDirection = draggedWall.getWorldDirection(),
         nextWallDirection = nextWall.getWorldDirection(),
         prevWallDirection = prevWall.getWorldDirection(),

         //rayOrigin = movedDelta.projectOnVector(draggedWallDirection),//.add(this._getWallCenter(draggedWall)),

         prevPoint = points[prevWallIndex],
         nextNextPoint = points[nextNextIndex],
         currentPoint = this._movePoint(points[currentWallIndex], prevPoint, movedDelta),
         nextPoint = this._movePoint(points[nextWallIndex], nextNextPoint, movedDelta);

    if (
        !this._isWallLengthValid(currentPoint, nextPoint)
        || !this._isWallLengthValid(prevPoint, currentPoint)
        || !this._isWallLengthValid(nextPoint, nextNextPoint)
        || this._isIntersects({ point: currentPoint, index: currentWallIndex }, { point: nextPoint, index: nextWallIndex }, points)
        || this._hasSameAngle(draggedWall, prevWall)
        || this._hasSameAngle(draggedWall, nextWall)
        ) {
        return false;
    }

    this._roomStateManager.updatePoint(currentWallIndex, currentPoint);
    this._roomStateManager.updatePoint(nextWallIndex, nextPoint);

    this._room2DBuilder.updateWallLength(prevWall, prevPoint, currentPoint);
    this._room2DBuilder.updateWallLength(draggedWall, currentPoint, nextPoint);
    this._room2DBuilder.updateWallLength(nextWall, nextPoint, nextNextPoint);

    this._wallNumberSrvc.updatePosition(prevWall.name);
    this._wallNumberSrvc.updatePosition(draggedWall.name);
    this._wallNumberSrvc.updatePosition(nextWall.name);

    this._updateConnectionPoint(currentWallIndex);
    this._updateConnectionPoint(nextWallIndex);

    this._wallConnectionSrvc.connectTwoWalls2D(prevWall, draggedWall, currentPoint);
    this._wallConnectionSrvc.connectTwoWalls2D(draggedWall, nextWall, nextPoint);
    this._wallConnectionSrvc.connectTwoWalls2D(prevPrevWall, prevWall, prevPoint);
    this._wallConnectionSrvc.connectTwoWalls2D(nextWall, nextNextWall, nextNextPoint);

    this._roomSizeManager.updateWallSizes(prevWall);
    this._roomSizeManager.updateWallSizes(draggedWall);
    this._roomSizeManager.updateWallSizes(nextWall);

    this._updateFloor();
};

MoveWall.prototype.setWallLength = function (newLength, wall) {
    var currentWallIndex = wall.userData.index,
        nextWallIndex = this._roomStateManager.getNextPointIndex(currentWallIndex),
        currentPoint = this._roomStateManager.getPoint(currentWallIndex),
        nextPoint = this._roomStateManager.getPoint(nextWallIndex),
        nextWall = this._stage.getWallByIndex(nextWallIndex + 1),
        nextWallDirection = nextWall.getWorldDirection(),
        currentWallLength = wall.geometry.vertices[2].x,
        lengthDelta = currentWallLength - newLength,
        dir = nextPoint.clone().sub(currentPoint).normalize(),
        sign = Math.sign(lengthDelta),
        dot = dir.dot(nextWallDirection);

    lengthDelta = Math.abs(lengthDelta);

    if ((sign === -1 && dot < 0) || (sign === 1 && dot > 0))
        nextWallDirection.negate();

    nextWallDirection.multiplyScalar(lengthDelta);

    this._attachWallObjects(nextWall);
    this._shiftWall(nextWall, nextWallDirection);
    this._detachWallObjects(nextWall);
};

MoveWall.prototype.mouseUp = function () {
    if (this._wall && this._drag) {
        this._wall.material.color.setHex(0x000000);
        this._showSizes(false);
        this._detachWallObjects(this._wall);
    }

    this._childrenAttached = this._drag = false;
    this._wall = null;
    this._stage.getCanvas().style.cursor = 'auto';
};