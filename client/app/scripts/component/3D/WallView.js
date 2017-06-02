var WallView = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    //this._scene3D = dependencyContainer.getService('scene3D');
    this._wall3DDataManager = dependencyContainer.getService('wall3DDataManager');
    this._orbitControl = dependencyContainer.getService('orbitControl');
    this._wallVisibilityManager = dependencyContainer.getService('wallVisibilityManager');
    this._keyState = dependencyContainer.getService('keyState');
    this._cameraManager = dependencyContainer.getService('cameraManager');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._currentDistanceToWall;
    this._isInWallMode = false;

    this._rayCaster = new THREE.Raycaster();
    this._plane = new THREE.Plane();

    this._canMoveCamera = true;
};

WallView.prototype = Object.create(ComponentBase.prototype);

WallView.prototype.constructor = WallView;

WallView.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);
    this._select3DComponent = engine.findComponentByType(Select3D);
};

WallView.prototype.dblclick = function (e) {

    if (this._isInWallMode)
        return false;

    var walls = this._stage.getWalls();
    this._sceneUtils.getRay(e.offsetX, e.offsetY, this._rayCaster);
    var intersects = this._rayCaster.intersectObjects(walls)[0];
    if (intersects)
        this.fireEvent('wallDoubleClick', intersects.object.name);
};

WallView.prototype.mouseUp = function () {
    this._wallClickPoint = null;
};

WallView.prototype._reset = function () {
    var i = 0,
        walls = this._stage.getWalls();

    for (; i < walls.length; i++) {
        walls[i].material.visible = true;
        walls[i].material.needsUpdate = true;
    }

    this.currentDistanceFromWallToCamera = null;
};

WallView.prototype.enter = function (wallName, oldDistanceToWall) {

    this._reset();

    this._isInWallMode = true;

    var wall = this._stage.getObjectByName(wallName);
    var walls = this._stage.getWalls();
    var wallsObjects = this._stage.getWallObjects(wallName);
    var camera = this._cameraManager.getCamera();
    var slideData = this._wall3DDataManager.getScrollData(wallName);
    var wallSize = this._wall3DDataManager.getSize(wallName);

    this._activeWallName = wall.name;

    this._activeWall = wall;

    this._wallVisibilityManager.reset(walls, wallsObjects);

    this.currentDistanceFromWallToCamera = slideData.currentDistanceFromWallToCamera.clone();

    this._wallVisibilityManager.hideWallModeLookBlockWalls(wall, walls, {
        position: slideData.cameraBoxPosition,
        size: new THREE.Vector3(wallSize.length - 20, wallSize.height, slideData.maxDistance.length())
    });

    if (this._currentDistanceToWall) {
        this.currentDistanceFromWallToCamera = slideData.wallDirection.clone().multiplyScalar(this._currentDistanceToWall);
        camera.position.copy(slideData.center.clone().add(this.currentDistanceFromWallToCamera));
    }
    else {
        camera.position.copy(slideData.center.clone().add(slideData.currentDistanceFromWallToCamera));
    }

    camera.lookAt(slideData.center);
    camera.updateMatrixWorld();


    this._orbitControl.disable();

    this.fireEvent('enter');
};

WallView.prototype.leave = function () {
    if (this._isInWallMode) {
        this._isInWallMode = false;

        this._orbitControl.enable();

        this._reset();

        this._activeWallName = null;
        this._currentDistanceToWall = null;

        this.fireEvent('leave');
    }
};

WallView.prototype.mouseMove = function (e) {
    if (this._isInWallMode && this._keyState.isMouseHold) {

        this._sceneUtils.getRay(e.offsetX, e.offsetY, this._rayCaster);

        var intersectionPoint = this._rayCaster.ray.intersectPlane(this._plane);

        if (intersectionPoint) {

            if (!this._wallClickPoint) {
                this._wallClickPoint = intersectionPoint.clone();
            } else {

                var diff = intersectionPoint.sub(this._wallClickPoint),
                    data = this._wall3DDataManager.getScrollData(this._activeWallName),
                    camera = this._cameraManager.getCamera(),
                    currentDistanceFromWallToCamera = this.currentDistanceFromWallToCamera || data.currentDistanceFromWallToCamera,
                    left = data.left.clone().add(currentDistanceFromWallToCamera),
                    right = data.right.clone().add(currentDistanceFromWallToCamera);

                camera.position.sub(diff);
                camera.position.x = THREE.Math.clamp(camera.position.x, Math.min(left.x, right.x), Math.max(left.x, right.x));
                camera.position.z = THREE.Math.clamp(camera.position.z, Math.min(left.z, right.z), Math.max(left.z, right.z));
                camera.position.y = THREE.Math.clamp(camera.position.y, data.bottom.y, data.top.y);
                camera.updateMatrixWorld();

                //---------------update wall scroll -------------------
                var position = camera.position.clone(),
                    rotation = new THREE.Matrix4().makeRotationY(-this._activeWall.rotation.y),
                    min = data.left.clone(),
                    max = data.right.clone();

                min.applyMatrix4(rotation);
                max.applyMatrix4(rotation);
                position.applyMatrix4(rotation);

                this.fireEvent('wallSlide', min.x, max.x, position.x);
                //-----------------------------------------------
            }
        }
    }
};

WallView.prototype.zoom = function (scrollDelta) {
    if (this._isInWallMode) {
        var wallDirection = this._wall3DDataManager.getDirection(this._activeWallName),
            slideData = this._wall3DDataManager.getScrollData(this._activeWallName),
            zoomStep = wallDirection.multiplyScalar(5),
            currentDistanceFromWallToCamera = this.currentDistanceFromWallToCamera.clone() || slideData.currentDistanceFromWallToCamera.clone(),
            currentLength,
            camera = this._cameraManager.getCamera(),
            max = slideData.maxDistance,
            min = slideData.minDistance;

        zoomStep = scrollDelta < 0 ? zoomStep : zoomStep.negate();

        currentDistanceFromWallToCamera.add(zoomStep);

        currentLength = currentDistanceFromWallToCamera.length();

        if (currentLength >= min.length() && currentLength <= max.length()) {
            this.currentDistanceFromWallToCamera = currentDistanceFromWallToCamera;
            camera.position.add(zoomStep);
        }
    }
};

WallView.prototype.mouseScroll = function (e) {
    e.preventDefault();
    var scrollDelta = e.wheelDelta ? e.wheelDelta : -e.detail;
    this.zoom(scrollDelta);
};

WallView.prototype.slideWall = function (value, min, max) {
    if (this._isInWallMode) {
        var slideData = this._wall3DDataManager.getScrollData(this._activeWallName),
            left = slideData.left.clone().add(this.currentDistanceFromWallToCamera),
            right = slideData.right.clone().add(this.currentDistanceFromWallToCamera),
            maxX = Math.max(left.x, right.x),
            minX = Math.min(left.x, right.x),
            maxZ = Math.max(left.z, right.z),
            minZ = Math.min(left.z, right.z),
            xPosition = THREE.Math.mapLinear(value, min, max, left.x, right.x),
            zPosition = THREE.Math.mapLinear(value, min, max, left.z, right.z),
            camera = this._cameraManager.getCamera();

        camera.position.x = THREE.Math.clamp(xPosition, minX, maxX);
        camera.position.z = THREE.Math.clamp(zPosition, minZ, maxZ);
        camera.updateMatrixWorld();
    }
};

WallView.prototype.scrollToCorner = function (corner) {
    if (this._isInWallMode) {

        var slideData = this._wall3DDataManager.getScrollData(this._activeWallName),
            position,
            camera = this._cameraManager.getCamera();

        switch (corner) {
            case 'left':
                position = slideData.left.clone().add(this.currentDistanceFromWallToCamera);
                break;
            case 'right':
                position = slideData.right.clone().add(this.currentDistanceFromWallToCamera);
                break;
        }

        if (position) {
            camera.position.x = position.x;
            camera.position.z = position.z;
            camera.updateMatrixWorld();
        }
    }
};

WallView.prototype.getActiveWallName = function () {
    return this._activeWallName;
};

WallView.prototype.changeWall = function (direction) {

    var walls = this._stage.getWalls();
    var total = walls.length;
    var wall = this._stage.getWallObjects(this._activeWallName);
    var index = walls.indexOf(wall);
    var newIndex = index + direction;

    newIndex = newIndex >= total ? 0 : newIndex;
    newIndex = newIndex < 0 ? total - 1 : newIndex;

    var currentCamera = this._cameraManager.getCamera();
    var rayDir = this._wall3DDataManager.getDirection(this._activeWallName).clone().negate();
    var rayToWall = new THREE.Raycaster(currentCamera.position, rayDir);

    this._currentDistanceToWall = rayToWall.intersectObject(walls)[0].distance;

    return walls[newIndex].name;
};

WallView.prototype.isInWallMode = function () {
    return this._isInWallMode;
};

WallView.prototype.mouseDown = function (e) {
    if (this._isInWallMode) {
        this._sceneUtils.getRay(e.offsetX, e.offsetY, this._rayCaster);
        this._plane.setFromNormalAndCoplanarPoint(this._wall3DDataManager.getDirection(this._activeWallName),
            this._activeWall.position);
    }
};
