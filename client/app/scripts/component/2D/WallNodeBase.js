var WallNodeBase = function (dependencyContainer) {
    WallLengthChangeBase.prototype.constructor.call(this, dependencyContainer);
    this._wallNumberSrvc = dependencyContainer.getService('wallNumberSrvc');
    this._wall3DDataManager = dependencyContainer.getService('wall3DDataManager');
};

WallNodeBase.prototype = Object.create(WallLengthChangeBase.prototype);

WallNodeBase.prototype.constructor = WallNodeBase;

WallNodeBase.prototype._sorter = function (a, b) {
    return a.userData.index - b.userData.index
};

WallNodeBase.prototype.getWallsSorted = function () {
    var walls = this._stage.getWalls();
    walls.sort(this._sorter);
    return walls;
};

WallNodeBase.prototype.getNodesSorted = function () {
    var nodes = this._stage.getConnectionPoints();
    nodes.sort(this._sorter);
    return nodes;
};

WallNodeBase.prototype.rebuildFloor = function (points) {
    var newFloor = this._room2DBuilder.buildFloor(points);
    var oldFloor = this._stage.getFloor();
   // newFloor.add.apply(newFloor, oldFloor.children);
    //this._roomSizeManager.updateFloorArea(newFloor);
    this._stage.replace(oldFloor, newFloor);
};

WallNodeBase.prototype.changeWallsAndNodesNumbering = function (walls, connectionPoints) {

    var i = 0,
        wall,
        connectionPoint,
        number;

    for (; i < walls.length; i++) {

        number = i + 1;

        connectionPoint = connectionPoints[i];
        connectionPoint.userData.index = i;
        connectionPoint.name = 'connectionPoint ' + number;

        wall = walls[i];
        wall.name = 'Wall ' + number;
        wall.userData.index = i;
    }
};

WallNodeBase.prototype._rebuildWallNumbers = function () {
    var oldWn = this._wallNumberSrvc.get();
  
    var walls = this._stage.getWalls();
    var count = walls.length;
    this._updateWallsData(walls);

    this._wallNumberSrvc.clear();
    var newWn = this._wallNumberSrvc.get(count);
    newWn.visible = false;

    this._stage.replace(oldWn, newWn);
};

WallNodeBase.prototype._updateWallsData = function (walls) {
    this._wall3DDataManager.clearAll();
    var i = 0,
        entity,
        wall;
    for (; i < walls.length; i++) {
        wall = walls[i];
        entity = wall.userData.entity;
        this._wall3DDataManager.add(wall, entity.length, entity.height, entity.width);
    }
};