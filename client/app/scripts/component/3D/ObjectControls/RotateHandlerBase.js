var RotateHandlerBase = function (dependencyContainer, select3D, name, direction) {
    ObjectControlsHandlerBase.prototype.constructor.call(this, name);

    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._stage = dependencyContainer.getService('stage');
    this._sceneHelper = dependencyContainer.getService('sceneHelper');
    this._objectControls = dependencyContainer.getService('objectControls');
    this._orbitControl = dependencyContainer.getService('orbitControl');
    this._geometryHelper = dependencyContainer.getService('geometryHelper');
    this._scene2DSyncSrvc = dependencyContainer.getService('scene2DSyncSrvc');
    this._collisionSrvc = dependencyContainer.getService('collisionSrvc');

    this._raycaster = new THREE.Raycaster();
    this._handled = false;
    this._groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this._container = new THREE.Object3D();
    this._container2 = new THREE.Object3D();
    this._container.add(this._container2);

    this._rotationPoint = null;

    this._lastValidAngle = 0;
    this._colliderCache = {};
    this._objectPosition = new THREE.Vector3();
    this._objectRotation = new THREE.Euler();
    this._staticObjects = null;

    this._select3D = select3D;

    this._direction = direction;

    //this.name = name;
};

RotateHandlerBase.prototype = Object.create(ObjectControlsHandlerBase.prototype);

RotateHandlerBase.prototype.constructor = RotateHandlerBase;

RotateHandlerBase.prototype._canBeRotated = function (objects) {
    var i = 0,
        obj;
    for (; i < objects.length; i++) {
        obj = objects[i];
        if (this._objectCheckerSrvc.isWallOrFloor(obj)
            || this._objectCheckerSrvc.iteractWithWall(obj))
            return false
    }
    return true;
};

RotateHandlerBase.prototype._wrap = function (objects) {
    this._container2.add.apply(this._container2, objects);
    this._stage.removeMany(objects);
    this._stage.add(this._container);
    this._lastValidAngle = this._container.rotation.y;
};

RotateHandlerBase.prototype._unWrap = function () {

    var i = 0,
        obj,
        objects = this._container2.children,
        containerRot = this._container.rotation.y;

    for (; i < objects.length; i++) {
        obj = objects[i];

        this._container2.localToWorld(obj.position);
        obj.rotation.set(0, obj.rotation.y + containerRot, 0);

        //this._scene2DSyncSrvc.rotate(obj);
        //this._scene2DSyncSrvc.moveObject(obj);
    }

    this._stage.addMany(objects);
    this._container2.children.length = 0;
    this._container.rotation.y = 0;
    this._stage.remove(this._container);
};

RotateHandlerBase.prototype.invokeAction = function (actionName, arg) {

    if (actionName === 'hold') {
        this._singleMove(this._select3D.getSelected());
    }

    return false;
};

//RotateHandlerBase.prototype._hold = function (objects) {

//    this._handled = true;

//    this._rotationPoint = this._geometryHelper.getObjectsCenter(objects);

//    this._container.position.copy(this._rotationPoint);
//    this._container2.position.copy(this._rotationPoint.clone().negate());

//    this._wrap(objects);

//    this._orbitControl.disable();

//    this._staticObjects = this._stage.getChildren().filter(function (obj) {
//        return obj instanceof THREE.Mesh &&
//            (obj.userData.entity && !obj.userData.entity.isFloor) &&
//            objects.indexOf(obj) === -1;
//    });
//};

RotateHandlerBase.prototype._isCollide = function (draggedObjs, staticObjs, angle) {

    var i = 0,
        isCollide,
        obj;

    for (; i < draggedObjs.length; i++) {

        obj = draggedObjs[i];

        this._objectPosition.copy(obj.position);

        this._container2.localToWorld(this._objectPosition);

        this._objectRotation.set(0, obj.rotation.y + angle, 0);

        isCollide = this._collisionSrvc.isCollide(obj, staticObjs, {
            draggedObjectPosition: this._objectPosition,
            newRotation: this._objectRotation//,
            //staticColliderCache: this._colliderCache
        });

        if (isCollide)
            return true;
    }

    return false;
};

//RotateHandlerBase.prototype._move = function (objects, e) {
//    if (this._handled) {

//        var coord = this._sceneHelper.getCanvasClientXY(e, this._scene3D.getHtmlElement());
//        this._scene3D.getPickingRay(coord.x, coord.y, this._raycaster);

//        var point = this._raycaster.ray.intersectPlane(this._groundPlane);

//        if (point) {
//            var angle = -Math.atan2(point.z - this._rotationPoint.z, point.x - this._rotationPoint.x);
//            this._container.rotation.y = THREE.Math.degToRad(Math.round(THREE.Math.radToDeg(angle)));

//            var isCollide = this._isCollide(objects,
//                this._staticObjects,
//                this._container.rotation.y);

//            if (!isCollide)
//                this._lastValidAngle = this._container.rotation.y;
//            else
//                this._container.rotation.y = this._lastValidAngle;
//        }

//        return false;
//    }
//};

RotateHandlerBase.prototype._singleMove = function (objects) {

    var rotationDegree = objects[0].userData.entity.defaultRotationDegree || 5;

    var conntainers = objects.map(function (o) {
        return o.parent;
    });

    this._rotationPoint = this._geometryHelper.getObjectsCenter(conntainers);

    this._container.position.copy(this._rotationPoint);
    this._container2.position.copy(this._rotationPoint.clone().negate());

    this._wrap(conntainers);

   // this._orbitControl.disable();

    this._staticObjects = this._stage.getChildren().filter(function (obj) {
        return obj.visible &&
                obj.userData.entity &&
                !this._objectCheckerSrvc.isFloor(obj) &&
              conntainers.indexOf(obj) === -1;
    }.bind(this));

    this._container.rotation.y += THREE.Math.degToRad(rotationDegree) * this._direction;

    var isCollide = this._isCollide(conntainers,
        this._staticObjects,
        this._container.rotation.y);

    if (!isCollide)
        this._lastValidAngle = this._container.rotation.y;
    else
        this._container.rotation.y = this._lastValidAngle;

    this._unWrap();
   // this._orbitControl.enable();
    this._colliderCache = {};
};

//RotateHandlerBase.prototype._cleanState = function () {
//    if (this._handled) {
//        this._unWrap();
//        this._orbitControl.enable();
//        this._colliderCache = {};
//    }

//    this._handled = false;
//};

RotateHandlerBase.prototype.canExecute = function (objects) {
    return this._canBeRotated(objects);
};