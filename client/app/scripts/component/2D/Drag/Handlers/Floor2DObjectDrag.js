var Floor2DObjectDrag = function (dependencyContainer) {
    this._stage = dependencyContainer.getService('stage');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._step3Helper = dependencyContainer.getService('step3Helper');
    this._constants = dependencyContainer.getService('constants');
    this._collisionSrv = dependencyContainer.getService('collisionSrvc');
    this._wallHelper = dependencyContainer.getService('wallHelper');
};

Floor2DObjectDrag.prototype.constructor = Floor2DObjectDrag;

Floor2DObjectDrag.prototype.canExecute = function (selected) {
    return !this._objectCheckerSrvc.isWallMountable(selected) &&
        !this._objectCheckerSrvc.isWallEmbeddable(selected);
};

Floor2DObjectDrag.prototype.move = function (draggedObject, newPosition) {

    this._step3Helper.unHighlightWall(this._selectedWall);

    this._selectedWall = this._wallHelper.getIntersectedWall(this._stage.getWalls(), draggedObject);

    if (this._selectedWall) {
        if (!draggedObject.userData.entity.disableAutoOrientation)
            draggedObject.rotation.y = this._selectedWall.rotation.y;

        this._step3Helper.highlightWall(this._selectedWall);
    }

    draggedObject.position.copy(newPosition);
};

Floor2DObjectDrag.prototype.release = function (draggedObject, staticObjs) {

    if (this._selectedWall) {

        var snapPosition = this._step3Helper.snapToWallWithGap(draggedObject, this._selectedWall);
 
        var collided = this._collisionSrv.isCollide(draggedObject, staticObjs, {
            draggedObjectPosition: snapPosition
        });

        var allWallsExceptSelected = this._stage.getWalls().filter(function (w) {
            return w !== this._selectedWall;
        }.bind(this));

        var secondWall = this._collisionSrv.isCollide(draggedObject, allWallsExceptSelected, {
            draggedObjectPosition: snapPosition
        });

        if (!collided && !secondWall) {
            draggedObject.position.copy(snapPosition);
        } else {
            if (collided) {
                //this.edgeSnap(draggedObject, collided);
            }
            else {
                this._cornerSnap(draggedObject, secondWall, this._selectedWall);
            }
        }
    }

    this._step3Helper.unHighlightWall(this._selectedWall);
    this._selectedWall = null;
};

Floor2DObjectDrag.prototype._cornerSnap = function (obj, wallA, wallB) {
    var collidedPosition = this._step3Helper.snapToWallWithGap(obj, wallA);
    obj.position.copy(collidedPosition);
    collidedPosition = this._step3Helper.snapToWallWithGap(obj, wallB);
    obj.position.copy(collidedPosition);
};

Floor2DObjectDrag.prototype.getStaticObjects = function (draggedObject) {
    return this._stage.getChildren().filter(function (item) {
        return item.userData.entity &&
            item !== draggedObject
                && !this._objectCheckerSrvc.isWall(item);
    }.bind(this));
};