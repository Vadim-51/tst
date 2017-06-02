var SplitWall = function (dependencyContainer) {
    WallNodeBase.prototype.constructor.call(this, dependencyContainer);

    this._wallConnectionSrvc = dependencyContainer.getService('wallConnectionSrvc');
    var cursorBuilder = dependencyContainer.getService('cursorBuilder');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._ray = new THREE.Ray();
    this._plane = new THREE.Plane();
    this._handled = false;
    this._cursor = cursorBuilder.buildSplitWallCursor();

    this._wall = null;
    this._mousePosition = null;
    this._walls = null; //walls cache

    this.disable();
};

SplitWall.prototype = Object.create(WallNodeBase.prototype);

SplitWall.prototype.constructor = SplitWall;

SplitWall.prototype.init = function (engine) {
    WallNodeBase.prototype.init.call(this, engine);
    this._wallHighLight = engine.findComponentByType(WallHighlight);
    this._zoomComponent = engine.findComponentByType(ZoomCamera);
};

SplitWall.prototype.mouseMove = function (e) {

    this._walls = this._walls || this._stage.getWalls();
    this._mousePosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY),

    this._cursor.visible = true;
    this._raycaster.ray.origin.copy(this._mousePosition);
    this._raycaster.ray.origin.y = 500;

    var intersection = this._raycaster.intersectObjects(this._walls)[0];

    if (intersection) {
        this._wall = intersection.object;
        this._cursor.rotation.y = this._wall.rotation.y + Math.PI / 2;
        this._cursor.scale.set(this._wall.userData.entity.width + 20, 1, this._wall.userData.entity.width / 2);
    }
    else {
        this._wall = null;
    }

    this._cursor.position.copy(this._mousePosition);
    //this._Scene2d.render();

    return false;
};

SplitWall.prototype.mouseDown = function (e) {

    if (this._wall) {

        this._handled = true;

        var wall = this._wall;
        var currentWallIndex = wall.userData.index;
        var points = this._roomStateManager.getPoints();
        var currentWallPoint = points[currentWallIndex];
        var wallDirection = wall.getWorldDirection();

        this._ray.set(this._mousePosition, wallDirection);
        this._plane.setFromNormalAndCoplanarPoint(wallDirection, currentWallPoint);
        var newPoint = this._ray.intersectPlane(this._plane);

        if (newPoint) {

            this._wallHighLight.deselect(wall);

            newPoint.y = 0;

            var prevIndex = this._roomStateManager.getPrevPointIndex(currentWallIndex),
                nextIndex = this._roomStateManager.getNextPointIndex(currentWallIndex),
                walls = this.getWallsSorted(),
                prevWall = walls[prevIndex],
                nextWall = walls[nextIndex],
                connectionPoints = this.getNodesSorted(),
                wallWidth = wall.userData.width,
                nextPoint = points[nextIndex],
                wallA, wallB, connectionPoint;

            if (
            !this._isWallLengthValid(currentWallPoint, newPoint)
            || !this._isWallLengthValid(newPoint, nextPoint)
            ) {
                return false;
            }

            wallA = this._room2DBuilder.buildWall(currentWallPoint, newPoint, currentWallIndex, wallWidth);
            wallB = this._room2DBuilder.buildWall(newPoint, nextPoint, currentWallIndex + 1, wallWidth);
            connectionPoint = this._room2DBuilder.createConnectionPoint(newPoint, currentWallIndex + 1);

            this._roomSizeManager.build2(wallA);
            this._roomSizeManager.build2(wallB);

            walls.splice(walls.indexOf(wall), 1);
            walls.splice(currentWallIndex, 0, wallA);
            walls.splice(currentWallIndex + 1, 0, wallB);
            connectionPoints.splice(currentWallIndex + 1, 0, connectionPoint);

            this._stage.remove(wall);
            this._stage.addMany([wallA, wallB, connectionPoint]);

            this.changeWallsAndNodesNumbering(walls, connectionPoints);

            this._wallConnectionSrvc.connectTwoWalls2D(prevWall, wallA, currentWallPoint);
            this._wallConnectionSrvc.connectTwoWalls2D(wallB, nextWall, nextPoint);

            this._roomStateManager.insertPoint(currentWallIndex + 1, { x: newPoint.x, z: newPoint.z, depth: wallWidth });

            this.rebuildFloor(points);

            this._rebuildWallNumbers();

            this._zoomComponent.fitRoom(); //need update sizes scale
        }
    }

    this.disable();
    //this._Scene2d.render();

    return !this._handled;
};

SplitWall.prototype.mouseUp = function () {
    if (this._handled) {
        this._handled = false;
        this._walls = this._wall = null;
        return false;
    }
};

SplitWall.prototype.enable = function () {
    WallNodeBase.prototype.enable.call(this);
    this._stage.add(this._cursor);
};

SplitWall.prototype.disable = function () {
    WallNodeBase.prototype.disable.call(this);
    this._cursor.visible = false;
    this._walls = null;
};