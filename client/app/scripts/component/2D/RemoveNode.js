var RemoveNode = function (dependencyContainer) {
    WallNodeBase.prototype.constructor.call(this, dependencyContainer);

    this._wallConnectionSrvc = dependencyContainer.getService('wallConnectionSrvc');
    var cursorBuilder = dependencyContainer.getService('cursorBuilder');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._cursor = cursorBuilder.buildDeleteNodeCursor();
    this._handled = false;

    this.disable();
};

RemoveNode.prototype = Object.create(WallNodeBase.prototype);

RemoveNode.prototype.constructor = RemoveNode;

RemoveNode.prototype.init = function (engine) {
    WallNodeBase.prototype.init.call(this, engine);
    this._pointHoverComponent = engine.findComponentByType(ConnectionPointHover);
    this._zoomComponent = engine.findComponentByType(ZoomCamera);
};

RemoveNode.prototype.mouseDown = function (e) {

    var node = this._pointHoverComponent.getActivePoint();

    if (node) {

        var points = this._roomStateManager.getPoints(),
            index = node.userData.index,
            prevIndex = this._roomStateManager.getPrevPointIndex(index),
            nextIndex = this._roomStateManager.getNextPointIndex(index),
            prepPrevIndex = this._roomStateManager.getPrevPointIndex(prevIndex),
            prevPoint = points[prevIndex],
            nextPoint = points[nextIndex],
            prevPrevPoint = points[prepPrevIndex],
            walls = this.getWallsSorted(),
            currentWall = walls[index],
            prevWall = walls[prevIndex],
            nextWall = walls[nextIndex],
            prevPrevWall = walls[prepPrevIndex],
            newWall = this._room2DBuilder.buildWall(prevPoint, nextPoint, prevIndex);

        this._wallConnectionSrvc.connectTwoWalls2D(prevPrevWall, newWall, prevPoint);
        this._wallConnectionSrvc.connectTwoWalls2D(newWall, nextWall, nextPoint);

        this._roomStateManager.removePoint(index);

        this._roomSizeManager.build2(newWall);
        this._roomSizeManager.updateWallSizes(prevPrevWall);
        this._roomSizeManager.updateWallSizes(nextWall);

        this._stage.add(newWall);
        this._stage.removeMany([prevWall, currentWall, node]);

        this.rebuildFloor(points);

        walls.splice(walls.indexOf(prevWall), 1);
        walls.splice(walls.indexOf(currentWall), 1);
        walls.splice(prevIndex, 0, newWall);
        this.changeWallsAndNodesNumbering(walls, this.getNodesSorted());

        this._rebuildWallNumbers();

        this._zoomComponent.fitRoom(); //need update sizes scale

        this._handled = true;
    }

    this.disable();

    return !this._handled;
};

RemoveNode.prototype.mouseUp = function () {
    if (this._handled) {
        this._handled = false;
        return false;
    }
};

RemoveNode.prototype.mouseMove = function (e) {
    this._mousePosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY),
    this._cursor.visible = true;
    this._cursor.position.copy(this._mousePosition);
    //this._Scene2d.render();
    return false;
};

RemoveNode.prototype._changeNodesVisibility = function (bool) {
    this._stage.setObjectsVisibilityByPredicate(function (item) {
        return item.userData.isConnectionPoint;
    }, bool);
};

RemoveNode.prototype.enable = function () {
    WallNodeBase.prototype.enable.call(this);
    this._changeNodesVisibility(this._roomStateManager.getPoints().length !== 3);
    this._stage.add(this._cursor);
    //this._Scene2d.render();
};

RemoveNode.prototype.disable = function () {
    WallNodeBase.prototype.disable.call(this);
    this._changeNodesVisibility(true);
    this._cursor.visible = false;
    //this._Scene2d.render();
};