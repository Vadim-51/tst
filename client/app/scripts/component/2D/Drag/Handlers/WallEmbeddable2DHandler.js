var WallEmbeddable2DHandler = function (dependencyContainer) {
    this._wallHelper = dependencyContainer.getService('wallHelper');
    this._step3Helper = dependencyContainer.getService('step3Helper');
    this._collisionSrv = dependencyContainer.getService('collisionSrvc');
    this._wallHoles = dependencyContainer.getService('wallHoles');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._stage = dependencyContainer.getService('stage');
};

WallEmbeddable2DHandler.prototype.constructor = WallEmbeddable2DHandler;

WallEmbeddable2DHandler.prototype.canExecute = function (selected) {
    return this._objectCheckerSrvc.isWallEmbeddable(selected);
};

WallEmbeddable2DHandler.prototype.move = function (draggedObject, newPosition) {

    this._step3Helper.unHighlightWall(this._selectedWall);

    draggedObject.position.copy(newPosition);
    draggedObject.updateMatrixWorld();

    this._selectedWall = this._wallHelper.getIntersectedWall(this._stage.getWalls(), draggedObject);

    if (this._selectedWall) {

        if (!this._isObjectOnWall(draggedObject.getObjectByName('2D'), this._selectedWall)) {
            return;
        }

        newPosition = this._step3Helper.mountToWall(newPosition, this._selectedWall);
        draggedObject.position.copy(newPosition);
    }

    draggedObject.rotation.y = this._selectedWall ? this._selectedWall.rotation.y : draggedObject.rotation.y;

    this._step3Helper.highlightWall(this._selectedWall);

};

WallEmbeddable2DHandler.prototype.release = function (draggedObject, staticObjs) {

    var shouldRemove = false;

    if (this._selectedWall) {

        var position = this._step3Helper.mountToWall(draggedObject.position, this._selectedWall);

        if (position && !this._collisionSrv.isCollide(draggedObject, staticObjs, {
            draggedObjectPosition: position
        })) {
            var newWallName = this._selectedWall.name;
            var oldWallName = draggedObject.userData.wall;

            draggedObject.position.copy(position);

            //object dragged to other wall , remove holes from previous
            if (oldWallName && oldWallName !== newWallName) {
                delete draggedObject.userData.wall;
                this._wallHoles.update(oldWallName);
            }

            draggedObject.userData.wall = newWallName;

            this._wallHoles.update(newWallName);
        } else {
            shouldRemove = true;
        }
    }

    this._step3Helper.unHighlightWall(this._selectedWall);

    if (!this._selectedWall || shouldRemove) {
        this._stage.remove(draggedObject);
        this._wallHoles.update(draggedObject.userData.wall);
    }

    this._selectedWall = null;
};

WallEmbeddable2DHandler.prototype._isObjectOnWall = function (object, wall) {

    var wallBB = new THREE.Box3().setFromObject(wall);
    var objectBB = new THREE.Box3().setFromObject(object);

    return wallBB.containsBox(objectBB);
};

WallEmbeddable2DHandler.prototype.getStaticObjects = function (draggedObject) {
    return this._stage.getChildren().filter(function (item) {
        return item !== draggedObject &&
            item.userData.entity &&
            !this._objectCheckerSrvc.isWall(item) &&
            this._objectCheckerSrvc.isWallEmbeddable(item);
    }.bind(this));
};