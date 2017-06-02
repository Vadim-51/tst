var Drag2D = function (dependencyContainer, handlers) {
    TouchAndMouseMap.prototype.constructor.call(this);

    this._step3Helper = dependencyContainer.getService('step3Helper');
    this._constants = dependencyContainer.getService('constants');
    this._keyState = dependencyContainer.getService('keyState');
    this._collisionSrv = dependencyContainer.getService('collisionSrvc');
    this._obbBuilder = dependencyContainer.getService('obbBuilder');
    this._stage = dependencyContainer.getService('stage');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._model3D = dependencyContainer.getService('model3D');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._dragging = false;
    this._canBePlaced = false;
    this._lastValidPosition = new THREE.Vector3();
    this._initialDrag = true;
    this._staticObjs = null;
    this._handlers = handlers;
    this._currentHandler = null;
};

Drag2D.prototype = Object.create(TouchAndMouseMap.prototype);

Drag2D.prototype.constructor = Drag2D;

Drag2D.prototype.init = function (engine) {
    TouchAndMouseMap.prototype.init.call(this, engine);
    this._select2DComponent = engine.findComponentByType(Selection2D);
};

Drag2D.prototype.move = function (e) {

    var draggedObject = this.getSelectedObject();

    if (this._keyState.isMouseHold && draggedObject) {

        this._currentHandler = this._currentHandler || this._getHandler(draggedObject);
        
        this._dragging = true;

        var position = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(draggedObject.position.y);

        if (this._initialDrag) {
            this._initialDrag = false;
            this._lastValidPosition.copy(draggedObject.position);
        }

        this._currentHandler.move(draggedObject, position);

        draggedObject.getObjectByName('2D').visible = true;

        this._staticObjs = this._staticObjs || this._currentHandler.getStaticObjects(draggedObject);

        var collide = this.isCollide(draggedObject, this._staticObjs);

        if (collide) {
            //console.log(collide);
            draggedObject.position.copy(this._lastValidPosition);
        }
        else {
            this._lastValidPosition.copy(draggedObject.position);
        }

        this.fireEvent('drag');
    }
};

Drag2D.prototype.release = function (e) {

    var draggedObject = this.getSelectedObject();

    if (this._currentHandler && this._dragging && draggedObject) {
        this._currentHandler.release(draggedObject, this._staticObjs);
    }

    this._initialDrag = true;
    this._canBePlaced = this._dragging = false;
    this._staticObjs = this._currentHandler = null;
};

Drag2D.prototype._getHandler = function (selected) {
    var i = 0,
        handlers = this._handlers,
        handler;

    for (; i < handlers.length; i++) {
        handler = handlers[i];
        if (handler.canExecute(selected)) {
            return handler;
        }
    }

    return null;
};

Drag2D.prototype.isCollide = function (draggedObject, staticObj) {
    return this._collisionSrv.isCollide(draggedObject, staticObj);
};

Drag2D.prototype.getSelectedObject = function () {
    return this._select2DComponent.selectedObject;
};