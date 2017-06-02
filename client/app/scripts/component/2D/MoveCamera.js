var MoveCamera = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._keyState = dependencyContainer.getService('keyState');
    this._stage = dependencyContainer.getService('stage');
    this._cameraManager = dependencyContainer.getService('cameraManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

  //  this.disable();

    this._clickPosition = null;
    this._raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0));
};

MoveCamera.prototype = Object.create(ComponentBase.prototype);

MoveCamera.prototype.constructor = MoveCamera;

MoveCamera.prototype.mouseDown = function (e) {

    this._clickPosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY);
    this._clickPosition.y = 500;

    this._raycaster.ray.origin.copy(this._clickPosition);

    var children = this._stage.getChildren(),
        intersection = this._raycaster.intersectObjects(children, true)[0],
        i = 0;

    if (intersection) {
        var data = intersection.object.userData;
        if (data.isConnectionPoint || data.entity)
            this._clickPosition = null;       
    }
};

MoveCamera.prototype.mouseMove = function (e) {
    if (this._keyState.isMouseHold && this._clickPosition !== null) {
        var currentMousePosition = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY),
            camera = this._cameraManager.getCamera(),
            delta = this._clickPosition.clone().sub(currentMousePosition);
        camera.position.add(delta);
        camera.updateMatrixWorld();
        //this._Scene2d.render();
        this.fireEvent('move');
        return false;
    }
};

MoveCamera.prototype.mouseUp = function () {
    this._clickPosition = null;
};