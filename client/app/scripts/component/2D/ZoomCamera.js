var ZoomCamera = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._cameraManager = dependencyContainer.getService('cameraManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._currentZoom = 1;
    this._zoomStep = 0.1;
    this._zoomMax = 5;
    this._zoomMin = 0.1;
};

ZoomCamera.prototype = Object.create(ComponentBase.prototype);

ZoomCamera.prototype.constructor = ZoomCamera;

ZoomCamera.prototype.mouseScroll = function (e) {

    e.preventDefault();

    var cam = this._cameraManager.getCamera();

    this._currentZoom = cam.scale.x;

    var newZoom = e.wheelDelta > 0 ? this._currentZoom - this._zoomStep : this._currentZoom + this._zoomStep;

    if (newZoom >= this._zoomMin && newZoom <= this._zoomMax) {

        var point = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY),
            zoomK = newZoom / this._currentZoom,
            matrix = new THREE.Matrix4().makeTranslation(point.x, 0, point.z),
            scale = new THREE.Matrix4().makeScale(zoomK, 1, zoomK),
            translate = new THREE.Matrix4().makeTranslation(-point.x, 0, -point.z);

        this._currentZoom = newZoom;

        matrix.multiply(scale).multiply(translate);

        cam.applyMatrix(matrix);
        cam.updateMatrixWorld();
        cam.updateProjectionMatrix();
        //this._Scene2d.render();

       this.fireEvent('zoom', newZoom);
    }
};

ZoomCamera.prototype.zoomInOut = function (direction) {
    var cam = this._cameraManager.getCamera();
    this._currentZoom = cam.scale.x;
    var newZoom = this._currentZoom + this._zoomStep * direction;
    this.setZoom(newZoom);
};

ZoomCamera.prototype.setZoom = function (newZoom) {
    if (newZoom >= this._zoomMin && newZoom <= this._zoomMax) {
        var camera = this._cameraManager.getCamera();
        camera.scale.set(newZoom, newZoom, 1);
       // camera.updateMatrixWorld();
       // camera.updateProjectionMatrix();
        //this._Scene2d.render();
        this.fireEvent('zoom', newZoom);
    }
};

ZoomCamera.prototype.fitRoom = function () {

    //var floor =  this._Scene2d.getFloor();

    //if (floor) {

    //    floor.geometry.computeBoundingSphere();
    //    floor.geometry.computeBoundingBox();

    //    var camera = this._Scene2d.getCamera();
    //    var canvas = this._Scene2d.getCanvas();
    //    var size = floor.geometry.boundingBox.size();
    //    //var canvasSize = canvas.getBoundingClientRect();
    //    var zoomW = Math.max(size.x, canvas.width) / Math.min(size.x, canvas.width);
    //    var zoomH = Math.max(size.y, canvas.height) / Math.min(size.y, canvas.height);
    //    var scale = Math.max(zoomH, zoomW) + 0.3;

    //    camera.position.copy(floor.geometry.boundingSphere.center);

    //    this.setZoom(scale);
    //}
};

//ZoomCamera.prototype.dispose = function () {
//    ComponentBase.prototype.dispose.call(this);
//    //var camera = this._Scene2d.getCamera();
//    //camera.scale.set(1, 1, 1);
//    //this._Scene2d = null;
//};