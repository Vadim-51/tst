var ConnectionPointHover = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);
    //this._Scene2d = dependencyContainer.getService('Scene2d');

    this._stage = dependencyContainer.getService('stage');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._point = null;
};

ConnectionPointHover.prototype = Object.create(ComponentBase.prototype);

ConnectionPointHover.prototype.constructor = ConnectionPointHover;

ConnectionPointHover.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);
    this._showSizesOnFloorClick = engine.findComponentByType(ShowSizesOnFloorClick);
};

ConnectionPointHover.prototype.mouseMove = function (e) {

    if (this._showSizesOnFloorClick.isVisible())
        return;

    var ch = this._stage.getChildren();

    var w = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY);
    w.y = 500;

    this._raycaster.ray.origin.copy(w);

    var points = ch.filter(function (item) {
        return item.userData.isConnectionPoint;
    });

    var intersects = this._raycaster.intersectObjects(points)[0];

    if (intersects) {

        this._point = intersects.object;

        this._point.material.color.setHex(0x00CC00);

        //this._Scene2d.render();

        this._stage.getCanvas().style.cursor = 'pointer';
    }
    else {

        if (this._point) {
            this._point.material.color.setHex(0x000000);
           // this._Scene2d.render();
            this._stage.getCanvas().style.cursor = 'auto';
            this._point = null;
        }
    }
};

ConnectionPointHover.prototype.mouseOnPoint = function () {
    return this._point !== null;
};

ConnectionPointHover.prototype.getActivePoint = function () {
    return this._point;
};