var CloneHandler = function (dependencyContainer, select3D) {
    ObjectControlsHandlerBase.prototype.constructor.call(this, 'clone');

   // this._sceneSyncSrvc = dependencyContainer.getService('scene2DSyncSrvc');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._object3DCloneSrvc = dependencyContainer.getService('object3DCloneSrvc');
    this._stage = dependencyContainer.getService('stage');
    this._roomStateManager = dependencyContainer.getService('roomStateManager');
    this._wallHoles = dependencyContainer.getService('wallHoles');
    //this._Scene2d = dependencyContainer.getService('Scene2d');
    this._model3D = dependencyContainer.getService('model3D');

    this._select3D = select3D;
};

CloneHandler.prototype = Object.create(ObjectControlsHandlerBase.prototype);

CloneHandler.prototype.constructor = CloneHandler;

CloneHandler.prototype.invokeAction = function (actionName, arg) {

    if (actionName === 'hold') {

        var selected = this._select3D.getSelected()[0];
        var clone = this._object3DCloneSrvc.clone(selected);

        if (clone) {

            var entity = selected.userData.entity;
            var wallName = selected.parent.userData.wall;
            var cs = this._roomStateManager.getColorSchemeByObjectId(selected.uuid);

            this._roomStateManager.saveObjectColorScheme({
                entityId: entity.id,
                objectId: clone.uuid,
                scheme: cs ? cs.scheme : null
            });
         
            var obj = this._model3D.create(entity, {
                object3D: clone.mesh,
                position: clone.position,
                rotation : clone.rotation,
                wall: wallName
            });

            this._stage.add(obj);

            this._wallHoles.update(wallName);
        }
    }

    return false;
};

CloneHandler.prototype.canExecute = function (objects) {
    return ObjectControlsHandlerBase.prototype.canExecute.call(this, objects)
        && this._canClone(objects);
};

CloneHandler.prototype._canClone = function (objects) {

    var onlyOneSelected = objects.length === 1;

    if (!onlyOneSelected)
        return false;

    var mesh = objects[0];

    var isValidObjectType = !this._objectCheckerSrvc.isWall(mesh) &&
        !this._objectCheckerSrvc.isFloor(mesh);
    // !this._objectCheckerSrvc.isWallEmbeddable(mesh);

    if (!isValidObjectType)
        return false;

    return true;
};

//CloneHandler.prototype._updateWall = function (wallEmbeddableObj) {
//    var wallName = wallEmbeddableObj.userData.wall,
//        nonCuttedWall = this._scene3D.getNonCuttedWallByName(wallName),
//        oldWall = this._scene3D.getObject(wallName),
//        wallObjects = this._scene3D.getWallChildren(wallName),
//        newWall = this._wallCutHelper.cutHolesInWall(nonCuttedWall, wallObjects, []);

//    newWall.add.apply(newWall, oldWall.children);
//    // oldWall.remove.apply(oldWall, oldWall.children);

//    this._scene3D.replace(oldWall, newWall);
//};