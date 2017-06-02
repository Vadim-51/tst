var ObjectDimensions = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._objectDimensions = dependencyContainer.getService('objectDimensions');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
};

ObjectDimensions.prototype = Object.create(ComponentBase.prototype);

ObjectDimensions.prototype.constructor = ObjectDimensions;

ObjectDimensions.prototype.init = function (engine) {
    ComponentBase.prototype.init.call(this, engine);

    this._dimensions = this._objectDimensions.build();

    this._select3D = engine.findComponentByType(Select3D);
    var drag3D = engine.findComponentByType(Drag3D);
    var objectControls = engine.findComponentByType(ObjectControls);
    this._select2DComponent = engine.findComponentByType(Selection2D);

    this._selectUnsubscribe = this._select3D.on('select', function (selected) {
        this._stage.add(this._dimensions);
        this._update3D();
    }.bind(this));

    this._dragUnsubscribe = drag3D.on('drag', function () {
        this._update3D();
    }.bind(this));

    this._objectControlsUnsubscribe = objectControls.on('click', function (button) {
        if (button.indexOf('rotate') !== -1)
            this._update3D();
    }.bind(this));

    //this._select2DUnsubscribe = this._select2DComponent.on('objectSelect', function (selected) {
    //    this._update2D(selected);
    //}.bind(this));
};

ObjectDimensions.prototype._update3D = function (selected) {

    var selected = this._select3D.selectedObjects;
    var first = selected[0];

    if (selected.length !== 1 || (this._objectCheckerSrvc.isWall(first) || this._objectCheckerSrvc.isFloor(first))) {
        this._dimensions.visible = false;
        return;
    }

    var staticObj = this._stage.getChildren().filter(function (obj) {
        return obj !== first.parent &&
            obj.visible &&
            obj.userData.entity;
    });

    this._objectDimensions.update(first.parent, staticObj);
};

ObjectDimensions.prototype._update2D = function (selected) {
    if (selected) {

        var staticObj = this._stage.getChildren().filter(function (obj) {
            return obj !== selected &&
                obj.visible &&
                obj.userData.entity;
        });

        this._objectDimensions.update(selected, staticObj);
    }
    else {
        this._dimensions.visible = false;
    }
};

ObjectDimensions.prototype.dispose = function () {
    ComponentBase.prototype.dispose.call(this);
    this._selectUnsubscribe();
    this._dragUnsubscribe();
    this._objectControlsUnsubscribe();
   // this._select2DUnsubscribe();
    this._selectUnsubscribe = this._dragUnsubscribe =
        this._objectControlsUnsubscribe =
      //  this._select2DUnsubscribe =
        null;
};