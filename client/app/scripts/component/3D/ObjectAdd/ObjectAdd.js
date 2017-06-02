var ObjectAdd = function (dependencyContainer, handlers) {
    TouchAndMouseMap.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._sceneHelper = dependencyContainer.getService('sceneHelper');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._scene2DSyncSrvc = dependencyContainer.getService('scene2DSyncSrvc');
    this._model3D = dependencyContainer.getService('model3D');
    this._wallHoles = dependencyContainer.getService('wallHoles');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._handlers = handlers;
    this._activeEntity = null;
    this._raycaster = new THREE.Raycaster();

    this._defaultHandler = new AddObjectHandlerBase();
    this._currentHandler = this._defaultHandler;

    this._ghostObject = this._buildGhostObject();
};

ObjectAdd.prototype = Object.create(TouchAndMouseMap.prototype);

ObjectAdd.prototype.constructor = ObjectAdd;

ObjectAdd.prototype.setEntity = function (entity) {
    this._activeEntity = entity;
};

ObjectAdd.prototype._buildGhostObject = function () {
    var edges = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1, 1, 1));
    var material = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        depthTest: false,
        depthWrite: false
    });
    var ghostObject = new THREE.LineSegments(edges, material);
    ghostObject.renderOrder = 2;
    ghostObject.visible = false;
    ghostObject.name = "ghostObject";
    return ghostObject;
};

ObjectAdd.prototype._selectHandler = function (entity) {
    var i = 0,
        handlers = this._handlers,
        handler;
    for (; i < handlers.length; i++) {
        handler = handlers[i];
        if (handler.canExecute(entity))
            return handler;
    }
    return this._defaultHandler;
};

ObjectAdd.prototype.hold = function () {
    var result = true;
    this._currentHandler.dragEnd();
    if (this._ghostObject.visible) {
        this._ghostObject.visible = false;
        //this._scene2DSyncSrvc.createObject(this._activeEntity, {
        //    position: this._ghostObject.position,
        //    rotation: this._ghostObject.rotation,
        //    wall: this._ghostObject.userData.wall
        //});

        var wallName = this._ghostObject.userData.wall;

        var obj = this._model3D.create(this._activeEntity, {
            position: this._ghostObject.position,
            rotation: this._ghostObject.rotation,
            wall: wallName,
            show3DObject : true
        });

        this._wallHoles.update(wallName);

        this._stage.add(obj);

        delete this._ghostObject.userData.entity;
        delete this._ghostObject.userData.wall;

        result = false;
    }
    this._currentHandler = this._defaultHandler;
    this._staticObjects =
        this._raycastObjects =
            this._activeEntity = null;
    return result;
};

ObjectAdd.prototype.move = function (e) {
    if (this._activeEntity && this._currentHandler !== this._defaultHandler) {

        //var coord = this._sceneHelper.getCanvasClientXY(e, this._stage.getHtmlElement());
        this._sceneUtils.getRay(e.offsetX, e.offsetY, this._raycaster);

        this._staticObjects = this._staticObjects || this._stage.getChildren().filter(this._currentHandler.getStaticObjectPredicate());

        var position = this._currentHandler.dragBegin(this._raycaster.intersectObjects(this._raycastObjects), this._staticObjects);

        if (position) {
            this._ghostObject.position.copy(position);
            this._ghostObject.visible = true;
            return false;
        }
    }
};

ObjectAdd.prototype.mouseEnter = function () {

    this._stage.add(this._ghostObject);

    var entity = this._activeEntity;
    if (entity) {

        this._currentHandler = this._selectHandler(entity);

        this._raycastObjects =
            this._raycastObjects || this._stage.getChildren().filter(this._currentHandler.getRaycastObjectPredicate());

        this._ghostObject.scale.set(entity.length, entity.height, entity.width);
        this._ghostObject.userData.entity = entity;
        this._currentHandler.setGhostObject(this._ghostObject);
    }
};

ObjectAdd.prototype.disable = function () {
    TouchAndMouseMap.prototype.disable.call(this);
    this._ghostObject.visible = false;
    this._activeEntity =
        this._raycastObjects =
        this._staticObjects = null;
};

ObjectAdd.prototype.dispose = function () {
    TouchAndMouseMap.prototype.dispose.call(this);
    this._stage.remove(this._ghostObject);
};