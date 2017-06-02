var WallHighlight = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._roomSizeManager = dependencyContainer.getService('roomSizeManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._hoveredWall = null;
    this._selectedWall = null;
};

WallHighlight.prototype = Object.create(ComponentBase.prototype);

WallHighlight.prototype.constructor = WallHighlight;

WallHighlight.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);
    this._showSizesOnFloorClick = engine.findComponentByType(ShowSizesOnFloorClick);
    this._connectionPointHover = engine.findComponentByType(ConnectionPointHover);
};

WallHighlight.prototype.mouseMove = function (e) {

    var ch = this._stage.getChildren();

    var w = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(500);

    this._raycaster.ray.origin.copy(w);

    var walls = ch.filter(function (item) {
        return this._objectCheckerSrvc.isWall(item);
    }.bind(this));

    var intersects = this._raycaster.intersectObjects(walls)[0];

    var canHighLightWall = !this._showSizesOnFloorClick.isVisible()
        //&& !this._connectionPointHover.mouseOnPoint()
        &&
        !this._selectedWall;

    if (this._connectionPointHover.mouseOnPoint()) {
        this._highlightWall(this._hoveredWall, false);
        this._hoveredWall = null;
        return;
    }

    if (canHighLightWall) {

        if (this._hoveredWall) 
            this._highlightWall(this._hoveredWall, false);
        
        if (intersects) {
            this._hoveredWall = intersects.object;
            this._highlightWall(this._hoveredWall, true);
            this._stage.getCanvas().style.cursor = 'pointer';
        }
        else {
            this._hoveredWall = null;
            this._stage.getCanvas().style.cursor = 'auto';
        }
    } 
};

WallHighlight.prototype._highlightWall = function (wall, bool) {
    if (wall) {
        // wall = this._Scene2d.getWallByIndex(wall.userData.index + 1);
        wall.material.materials[2].color.setHex(bool ? 0xffff00 : 0x000000);
        this._roomSizeManager.setWallSizeVisibility(wall, bool);
        //this._Scene2d.render();
    }
};

WallHighlight.prototype.mouseUp = function (e) {

    if (this._showSizesOnFloorClick.isVisible())
        return;

    if (this._hoveredWall && !this._selectedWall) {
        this.select(this._hoveredWall);
    }
    else {
        var wall = this._hoveredWall || this._selectedWall;
        this.deselect(wall);
    }

    this.fireEvent('select', this._hoveredWall);
};

WallHighlight.prototype.deselect = function (wall) {
    this._highlightWall(wall, false);
    this._selectedWall = this._hoveredWall = null;
};

WallHighlight.prototype.select = function (wall) {
    this._highlightWall(wall, true);
    this._selectedWall = wall;
};

WallHighlight.prototype.getWall = function () {
    return this._hoveredWall || this._selectedWall;
};

WallHighlight.prototype.getSelectedWall = function () {
    return  this._selectedWall;
};

WallHighlight.prototype.disable = function () {
    ComponentBase.prototype.disable.call(this);
    this._stage.getCanvas().style.cursor = 'auto';
    this._highlightWall(this._selectedWall, false);
    this._selectedWall = this._hoveredWall = null;
};