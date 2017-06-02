var ObjectControls = function (dependencyContainer, handlers) {
    TouchAndMouseMap.prototype.constructor.call(this);

    this._objectControls = dependencyContainer.getService('objectControls');
    this._stage = dependencyContainer.getService('stage');
    this._geometryHelper = dependencyContainer.getService('geometryHelper');
    this._sceneHelper = dependencyContainer.getService('sceneHelper');
    this._keyState = dependencyContainer.getService('keyState');
    this._cameraManager = dependencyContainer.getService('cameraManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._handlers = handlers;

    this._controls = this._objectControls.build();
   
    this._raycaster = new THREE.Raycaster();

    this._defaultHandler = new ObjectControlsHandlerBase();

    this._cameraPosition = null;

    this.currentHandler = this._defaultHandler;
};

ObjectControls.prototype = Object.create(TouchAndMouseMap.prototype);

ObjectControls.prototype.constructor = ObjectControls;

ObjectControls.prototype.init = function (engine) {
    TouchAndMouseMap.prototype.init.call(this, engine);

    this._select3DComponent = engine.findComponentByType(Select3D);
    this._drag3DComponent = engine.findComponentByType(Drag3D);

    this._selectObjUnsubscribe = this._select3DComponent.on('select', function (objs) {
        this._stage.add(this._controls);
        this._manageButtonsVisibility();
        this._updatePosition();
        this._lookAtCamera();
    }.bind(this));

    this._dragUnsubscribe = this._drag3DComponent.on('drag', function () {
        this._updatePosition();
    }.bind(this));

    this._dragEndUnsubscribe = this._drag3DComponent.on('dragEnd', function () {
        this._updatePosition();
    }.bind(this));
};

ObjectControls.prototype.hold = function (e) {
    if (this._objectControls.isVisible()) {

        //var coord = this._sceneHelper.getCanvasClientXY(e, this._scene3D.getHtmlElement());
        this._sceneUtils.getRay(e.offsetX, e.offsetY, this._raycaster);

        var button = this._objectControls.getButton(this._raycaster);
        if (button) {

            this.currentHandler = this._getHandler(button);

            this.currentHandler.invokeAction('hold');
            this._manageButtonsVisibility();
            this.currentHandler = this._defaultHandler;

            this.fireEvent('click', button);
            return false;
        }
    }

    this.currentHandler = this._defaultHandler;
};

ObjectControls.prototype.release = function () {
    return this.currentHandler.invokeAction('release');
};

ObjectControls.prototype.move = function (e) {
    this._lookAtCamera();
    return this.currentHandler.invokeAction('move', e);
};

ObjectControls.prototype.mouseLeave = function () {
    return this.currentHandler.invokeAction('mouseLeave');
};

ObjectControls.prototype._updatePosition = function () {
    if (this._objectControls.isVisible()) {
        var selected = this._select3DComponent.selectedObjects,
            bb = this._geometryHelper.objectsBoundingBox(selected),
            position = bb.center();

        position.y += bb.size().y / 2;

        this._objectControls.setPosition(position);
    }
};

ObjectControls.prototype._lookAtCamera = function () {
    if (this._keyState.isMouseHold && this._objectControls.isVisible()) {
        this._cameraPosition = this._cameraPosition || this._cameraManager.getCamera().position;
        this._objectControls.lookAtCamera(this._cameraPosition);
    }
};

ObjectControls.prototype._getHandler = function (name) {
    return this._handlers.find(function (c) {
        return c.name === name;
    }) || this._defaultHandler;
};

ObjectControls.prototype._manageButtonsVisibility = function () {

    var selected = this._select3DComponent.selectedObjects,
        handlers = this._handlers,
        handler,
        i = 0;

    if (selected.length === 0) {
        this._objectControls.setVisibility(false);
        return;
    }

    for (; i < handlers.length; i++) {
        handler = handlers[i];
        this._objectControls.setButtonVisibility(handler.name, handler.canExecute(selected));
    }

    this._objectControls.update();
};

ObjectControls.prototype.disable = function () {
    TouchAndMouseMap.prototype.disable.call(this);
    this._objectControls.setVisibility(false);
};

ObjectControls.prototype.dispose = function () {
    TouchAndMouseMap.prototype.dispose.call(this);
    this._selectObjUnsubscribe();
    this._dragUnsubscribe();
    this._dragEndUnsubscribe();
    this._selectObjUnsubscribe = this._dragUnsubscribe =
        this._dragEndUnsubscribe = this._cameraPosition = null;
};
