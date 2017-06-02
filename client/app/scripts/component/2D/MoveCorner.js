var MoveCorner = function (dependencyContainer) {
    WallLengthChangeBase.prototype.constructor.call(this, dependencyContainer);

    this._helperLines = dependencyContainer.getService('helperLines');
    this._wallConnectionSrvc = dependencyContainer.getService('wallConnectionSrvc');
    this._wallNumberSrvc = dependencyContainer.getService('wallNumberSrvc');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');
    
    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._connectionPoint = null;
    this._pointsExceptDragged = null;

    this._childrenAttached = false;
    this._draggedWalls = [];
};

MoveCorner.prototype = Object.create(WallLengthChangeBase.prototype);

MoveCorner.prototype.constructor = MoveCorner;

MoveCorner.prototype.init = function (engine) {
    WallLengthChangeBase.prototype.init.call(this, engine);
    this._showSizesOnFloorClick = engine.findComponentByType(ShowSizesOnFloorClick);
};

MoveCorner.prototype.mouseDown = function (e) {

    if (this._showSizesOnFloorClick.isVisible())
        return;

    var rayOrigin = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(500);

    this._raycaster.ray.origin.copy(rayOrigin);

    var connectionPoints = this._stage.getConnectionPoints();

    var intersects = this._raycaster.intersectObjects(connectionPoints)[0];

    if (intersects) {
        this._connectionPoint = intersects.object;
        this._stage.addMany(this._helperLines.getLines());
        var connectionPointIndex = this._connectionPoint.userData.index;
        this._pointsExceptDragged = this._roomStateManager.getPoints().filter(function (item, index) {
            return index !== connectionPointIndex;
        })
        return false;
    }
};

MoveCorner.prototype.mouseMove = function (e) {
    if (this._connectionPoint) {

        var newPosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(0),
            points = this._roomStateManager.getPoints(),
            currentIndex = this._connectionPoint.userData.index,
            prevIndex = this._roomStateManager.getPrevPointIndex(currentIndex),
            nextIndex = this._roomStateManager.getNextPointIndex(currentIndex),
            prevPrevIndex = this._roomStateManager.getPrevPointIndex(prevIndex),
            currentPoint = points[currentIndex],
            prevPoint = points[prevIndex],
            nextPoint = points[nextIndex],
            currentWall = this._stage.getWallByIndex(currentIndex + 1),
            prevWall = this._stage.getWallByIndex(prevIndex + 1),
            nextWall,
            prevPrevWall,
            intersectionPoint;

        intersectionPoint = this._helperLines.test(newPosition, this._pointsExceptDragged);
        newPosition = intersectionPoint || newPosition;

        if (!this._childrenAttached) {
            this._childrenAttached = true;
            this._attachWallObjects(currentWall);
            this._attachWallObjects(prevWall);
            this._draggedWalls.push(currentWall);
            this._draggedWalls.push(prevWall);
        }

        if (
            !this._isWallLengthValid(prevPoint, newPosition)
            || !this._isWallLengthValid(newPosition, nextPoint)
            || this._isIntersects({ point: prevPoint, index: prevIndex }, { point: newPosition, index: currentIndex }, points)
            || this._isIntersects({ point: newPosition, index: currentIndex }, { point: nextPoint, index: nextIndex }, points)
        ) {
            return false;
        }

        nextWall = this._stage.getWallByIndex(nextIndex + 1);
        prevPrevWall = this._stage.getWallByIndex(prevPrevIndex + 1);

        this._room2DBuilder.updateWallLength(currentWall, newPosition, nextPoint);
        this._room2DBuilder.updateWallLength(prevWall, prevPoint, newPosition);

        this._wallNumberSrvc.updatePosition(currentWall.name);
        this._wallNumberSrvc.updatePosition(prevWall.name);

        this._roomStateManager.updatePoint(currentIndex, newPosition);

        this._wallConnectionSrvc.connectTwoWalls2D(currentWall, nextWall, nextPoint);
        this._wallConnectionSrvc.connectTwoWalls2D(prevWall, currentWall, currentPoint);
        this._wallConnectionSrvc.connectTwoWalls2D(prevPrevWall, prevWall, prevPoint);

        this._roomSizeManager.updateWallSizes(currentWall);
        this._roomSizeManager.updateWallSizes(prevWall);

        this._connectionPoint.position.set(newPosition.x, 1, newPosition.z);

        this._updateFloor();

        //this._Scene2d.render();

        return false;
    }
};

MoveCorner.prototype.mouseUp = function () {
    this._childrenAttached = false;
    if (this._connectionPoint) {
        this._connectionPoint = null;
        this._helperLines.hideAll();
        this._draggedWalls.forEach(function (w) { this._detachWallObjects(w); }.bind(this));
        this._draggedWalls.length = 0;
        return false;
    }
};