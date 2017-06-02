var DeleteHandler = function (dependencyContainer, select3D) {
    ObjectControlsHandlerBase.prototype.constructor.call(this, 'delete');

    // this._sceneSyncSrvc = dependencyContainer.getService('sceneSyncSrvc');
    this._dimensionalRadialsManager = dependencyContainer.getService('dimensionalRadialsManager');
    this._stage = dependencyContainer.getService('stage');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._wallHoles = dependencyContainer.getService('wallHoles');

    this._select3D = select3D;
};

DeleteHandler.prototype = Object.create(ObjectControlsHandlerBase.prototype);

DeleteHandler.prototype.constructor = DeleteHandler;

DeleteHandler.prototype.invokeAction = function (actionName, arg) {

    if (actionName === 'hold') {

        var selected = this._select3D.getSelected(),
            i = 0,
            wallName,
            container;

        for (; i < selected.length; i++) {
            container = selected[i].parent;
            wallName = container.userData.wall;
            this._stage.remove(container);
        }

        this._wallHoles.update(wallName);
        //this._sceneSyncSrvc.deleteObjects();
        this._select3D.clearSelection();
        // this._dimensionalRadialsManager.deleteDimensionalRadials();
    }

    return false;
};

DeleteHandler.prototype.canExecute = function (objects) {
    return ObjectControlsHandlerBase.prototype.canExecute.call(this, objects) && this._canDelete(objects);
};

DeleteHandler.prototype._canDelete = function (objects) {
    var i = 0,
        obj;

    for (; i < objects.length; i++) {
        obj = objects[i];
        if (this._objectCheckerSrvc.isWall(obj)
            || this._objectCheckerSrvc.isFloor(obj))
            return false
    }

    return true;
};