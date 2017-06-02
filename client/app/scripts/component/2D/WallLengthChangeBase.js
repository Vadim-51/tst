var WallLengthChangeBase = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._room2DBuilder = dependencyContainer.getService('room2DBuilder');
    this._stage = dependencyContainer.getService('stage');
    this._roomStateManager = dependencyContainer.getService('roomStateManager');
    this._roomSizeManager = dependencyContainer.getService('roomSizeManager');
    this._wallHoles = dependencyContainer.getService('wallHoles');

    this._minWallLength = 20;
};

WallLengthChangeBase.prototype = Object.create(ComponentBase.prototype);

WallLengthChangeBase.prototype.constructor = WallLengthChangeBase;

WallLengthChangeBase.prototype._updateFloor = function () {
    var points = this._roomStateManager.getPoints();

    var converted = [];
    for (var i = 0; i < points.length; i++) {
        converted.push(new THREE.Vector3(points[i].x, points[i].z, 0));
    }

    var floor = this._stage.getFloor();

    //var newF = this._room2DBuilder.buildFloor(points);
    //newF.add.apply(newF, floor.children);
    //this._stage.remove(floor);
    //this._stage.add(newF);

    this._room2DBuilder.updateFloor(floor, converted);
    this._roomSizeManager.updateFloorArea(floor);
};

WallLengthChangeBase.prototype._isWallLengthValid = function (pointA, pointB) {
    var len = pointB.clone().sub(pointA).length();
    return len >= this._minWallLength;
};

WallLengthChangeBase.prototype._linesIntersects = function (lineA, lineB) {
    var ax1 = lineA.start.x,
        ay1 = lineA.start.z,
        ax2 = lineA.end.x,
        ay2 = lineA.end.z,
        bx1 = lineB.start.x,
        by1 = lineB.start.z,
        bx2 = lineB.end.x,
        by2 = lineB.end.z,
        v1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1),
        v2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1),
        v3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1),
        v4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);

    return (v1 * v2 < 0) && (v3 * v4 < 0);
};

WallLengthChangeBase.prototype._isIntersects = function (A, B, points) {
    var current = { start: A.point, end: B.point },
        count = points.length,
        i = 0,
        startIndex,
        endIndex;

    for (; i < count; i++) {

        startIndex = i;
        endIndex = (i + 1) % count;

        if (startIndex === A.index || startIndex === B.index || endIndex === A.index || endIndex === B.index)
            continue;

        if (this._linesIntersects(current, { start: points[startIndex], end: points[endIndex] }))
            return true;
    }

    return false;
};

WallLengthChangeBase.prototype._hasSameAngle = function (wallA, wallB) {
    var a = THREE.Math.radToDeg(wallA.rotation.y);
    var b = THREE.Math.radToDeg(wallB.rotation.y);
    return b >= a - 3 && b <= a + 3;
    // wallA.rotation.y === wallB.rotation.y;
};

WallLengthChangeBase.prototype._attachWallObjects = function (wall) {
    var wo = this._stage.getWallObjects(wall.name),
        i = 0,
        obj;

    for (; i < wo.length; i++) {
        obj = wo[i];
        wall.worldToLocal(obj.position);
        obj.rotation.y = 0;
        wall.add(obj);
    }
};

WallLengthChangeBase.prototype._detachWallObjects = function (wall) {
    var wo = this._stage.getWallObjects(wall.name),
        i = 0,
        obj;

    for (; i < wo.length; i++) {
        obj = wo[i];
        wall.localToWorld(obj.position);
        obj.rotation.y = wall.rotation.y;
        wall.remove(obj);
        this._stage.add(obj);
    }

    this._wallHoles.update(wall.name);
};