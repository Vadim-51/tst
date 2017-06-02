var Selection2D = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._constants = dependencyContainer.getService('constants');
    this._keyState = dependencyContainer.getService('keyState');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._step3Helper = dependencyContainer.getService('step3Helper');
    //this._roomStuffFactory = dependencyContainer.getService('roomStuffFactory');
    this._stage = dependencyContainer.getService('stage');
    this._model3D = dependencyContainer.getService('model3D');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._activeEntity = null;
    this.selectedObject = null;
};

Selection2D.prototype = Object.create(ComponentBase.prototype);

Selection2D.prototype.constructor = Selection2D;

Selection2D.prototype.setSelected = function (obj) {

    //unhighlight old object
    if (this.selectedObject !== obj)
        this._step3Helper.highlightIfDefined(this.selectedObject, this._constants.HighlightState.DEFAULT);

    this._step3Helper.highlightIfDefined(obj, this._constants.HighlightState.SELECTED);

    this.selectedObject = obj;
    this.fireEvent('objectSelect', obj);

    //this._Scene2d.render();
};

Selection2D.prototype.pickObject = function (e) {

    var raycaster = this._sceneUtils.getRay(e.offsetX, e.offsetY);
    raycaster.ray.origin.y = 1000;

    var result = null;

    var objects = this._stage.getChildren().filter(function (obj) {
        return obj.visible &&
            !this._objectCheckerSrvc.isWall(obj) &&
            obj.userData.entity;
    }.bind(this)).map(function (obj) {
        return obj.getObjectByName('2D');
    });

    var intersected = raycaster.intersectObjects(objects);

    if (intersected.length !== 0) {
        result = intersected.sort(function (a, b) {
            return b.object.renderOrder - a.object.renderOrder;
        })[0];
    }

    return result;
};

Selection2D.prototype.mouseDown = function (e) {

    this.mouseDownTime = new Date().getTime();

    var intersected = this.pickObject(e);

    if (this.selectedObject || !intersected)
        this.setSelected(null);

    if (intersected)
        this.setSelected(intersected.object.parent);
};

Selection2D.prototype.dblclick = function (e) {
    var intersected = this.pickObject(e);
    if (intersected) {
        this.fireEvent('objectDoubleClick', intersected.object);
    }
};

//Selection2D.prototype.touchStart = function (e) {
//    e.preventDefault();

//    var boundingRect = this._stage.getCanvas().getBoundingClientRect(),
//        touch = e.touches[0],
//        raycaster = this._stage.getRay(touch.clientX - boundingRect.left, touch.clientY - boundingRect.top);

//    raycaster.ray.origin.z = 1000;

//    var objects = this._stage.getChildren(function (obj) {
//        return !this._objectCheckerSrvc.isWall(obj) && obj.userData.entity;
//    }.bind(this));

//    var intersected = raycaster.intersectObjects(objects)[0];

//    if (this.selectedObject || !intersected) {
//        this.setSelected(null);

//        if (this._activeEntity) {
//            var obj = this._roomStuffFactory.buildRoomItem(this._activeEntity);
//            this._activeEntity = null;
//            obj.visible = false;
//            this._Scene2d.addModel(obj);
//            this.setSelected(obj);
//        }
//    }

//    if (intersected)
//        this.setSelected(intersected.object);
//};

Selection2D.prototype.mouseEnter = function () {
    if (this._activeEntity && this._keyState.isMouseHold) {
        //var obj = this._roomStuffFactory.buildRoomItem(this._activeEntity);
        //obj.visible = false;
        //this._stage.add(obj);

        var obj = this._model3D.create(this._activeEntity);
        this._stage.add(obj);

        this.setSelected(obj);
    }
};

Selection2D.prototype.mouseLeave = function () {
    if (this._keyState.isMouseHold && this.selectedObject) {
        this._stage.remove(this.selectedObject);
        this._activeEntity = null;
        this.setSelected(null);
      //  this._Scene2d.render();
    }
};

Selection2D.prototype.setActiveEntity = function (entity) {
    this._activeEntity = entity;
};


Selection2D.prototype.disable = function() {
    ComponentBase.prototype.disable.call(this);
    this.setSelected(null);
};