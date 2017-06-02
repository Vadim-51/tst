var InfoHandler = function (dependencyContainer, select3D) {
    ObjectControlsHandlerBase.prototype.constructor.call(this, 'info');

    this._Scene2d = dependencyContainer.getService('Scene2d');
    this._scene3D = dependencyContainer.getService('scene3D');
    this._productDetailDialogSrvc = dependencyContainer.getService('productDetailDialogSrvc');

    this._select3D = select3D;
};

InfoHandler.prototype = Object.create(ObjectControlsHandlerBase.prototype);

InfoHandler.prototype.constructor = InfoHandler;

InfoHandler.prototype.invokeAction = function (actionName, arg) {

    if (actionName === 'hold') {

        var selected = this._select3D.getSelected()[0],
            model2D = this._Scene2d.getObjectByUUID(selected.uuid);
        this._productDetailDialogSrvc.show(selected.userData.entity, selected, '3d', model2D)

    }

    return false;
};

InfoHandler.prototype.canExecute = function (objects) {
    return ObjectControlsHandlerBase.prototype.canExecute.call(this, objects) && this._canInfo(objects);
};

InfoHandler.prototype._canInfo = function (objects) {
    var i = 0,
        entity;

    if (objects.length > 1)
        return false;

    entity = objects[0].userData.entity;
    if (entity.isWall || entity.isFloor)
        return false


    return true;
};
