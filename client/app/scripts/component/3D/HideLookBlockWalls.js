var HideLookBlockWalls = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._wallVisibilityManager = dependencyContainer.getService('wallVisibilityManager');
    this._keyState = dependencyContainer.getService('keyState');
    this._cameraManager = dependencyContainer.getService('cameraManager');
};

HideLookBlockWalls.prototype = Object.create(ComponentBase.prototype);

HideLookBlockWalls.prototype.constructor = HideLookBlockWalls;

HideLookBlockWalls.prototype.mouseDown = function () {
    this._walls = this._stage.getWalls();
   // this._wallsChildren = this._stage.getWallsObjects();
};

HideLookBlockWalls.prototype.mouseMove = function () {
    if (this._keyState.isMouseHold) {
        var camera = this._cameraManager.getCamera();
        this._wallVisibilityManager.hideLookBlockWalls(this._walls, camera.getWorldDirection(),
            //this._wallsChildren
            []
            );
    }
};

HideLookBlockWalls.prototype.dispose = function () {
    ComponentBase.prototype.dispose.call(this);
    this._walls = null;
    //this._scene3D = this._wallVisibilityManager = this._keyState =
    //    this._walls = this._wallsChildren = null;
};