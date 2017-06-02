var WallNumbersUpdate = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    //this._stage = dependencyContainer.getService('stage');
    this._keyState = dependencyContainer.getService('keyState');
    this._wallNumberSrvc = dependencyContainer.getService('wallNumberSrvc');
    this._cameraManager = dependencyContainer.getService('cameraManager');

    this._isVisible = true;
};

WallNumbersUpdate.prototype = Object.create(ComponentBase.prototype);

WallNumbersUpdate.prototype.constructor = WallNumbersUpdate;

WallNumbersUpdate.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);

    //this._viewWallComponent = engine.findComponentByType(WallView);

    //this._viewWallLeaveUnsubscribe = this._viewWallComponent.on('leave', function () {
    //    this.setVisibility(true);
    //}.bind(this));

    //this._viewWallEnterUnsubscribe = this._viewWallComponent.on('enter', function () {
    //    this.setVisibility(false);
    //}.bind(this));
};

WallNumbersUpdate.prototype._update = function () {
    var camera = this._cameraManager.getCamera();
    this._wallNumberSrvc.updateScale(camera.position);
};

WallNumbersUpdate.prototype.mouseMove = function () {
    if (this._keyState.isMouseHold)
        this._update();
};

WallNumbersUpdate.prototype.mouseScroll = function () {
    this._update();
};

//WallNumbersUpdate.prototype.setVisibility = function (bool) {
//    var isVisible = !this._viewWallComponent.isInWallMode() && this._isVisible && bool;
//    this._wallNumberSrvc.setVisibility(isVisible);
//    this._update();
//};

WallNumbersUpdate.prototype.dispose = function () {
    ComponentBase.prototype.dispose.call(this);
    //this._viewWallLeaveUnsubscribe();
    //this._viewWallEnterUnsubscribe();
    //this._viewWallLeaveUnsubscribe =
    //this._viewWallEnterUnsubscribe =
    //null;
};


