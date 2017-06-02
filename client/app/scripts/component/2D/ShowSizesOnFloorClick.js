var ShowSizesOnFloorClick = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._roomSizeManager = dependencyContainer.getService('roomSizeManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._isSizesVisible = false;
};

ShowSizesOnFloorClick.prototype = Object.create(ComponentBase.prototype);

ShowSizesOnFloorClick.prototype.constructor = ShowSizesOnFloorClick;

ShowSizesOnFloorClick.prototype.mouseUp = function (e) {

    var w = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY);
    w.y = 500;

    this._raycaster.ray.origin.copy(w);

    var floor = this._stage.getFloor();

    if (!floor)
        return;

    var intersects = this._raycaster.intersectObject(floor)[0];

    if (intersects) {
        this.show();
        //this._Scene2d.render();
    }
    else {
        if (this._isSizesVisible) {
            this.hide();
            //this._Scene2d.render();
        }
    }
};

ShowSizesOnFloorClick.prototype.isVisible = function () {
    return this._isSizesVisible;
};

ShowSizesOnFloorClick.prototype.show = function () {
    this._isSizesVisible = true;
    this._setVisibility(true);
};

ShowSizesOnFloorClick.prototype.hide = function () {
    this._isSizesVisible = false;
    this._setVisibility(false);
};

ShowSizesOnFloorClick.prototype.disable = function () {
    ComponentBase.prototype.disable.call(this);
    this.hide();
};

ShowSizesOnFloorClick.prototype._setVisibility = function (bool) {
    var walls = this._stage.getWalls(),
        i = 0;
    for (; i < walls.length; i++) 
        this._roomSizeManager.setWallSizeVisibility(walls[i], bool);   
};