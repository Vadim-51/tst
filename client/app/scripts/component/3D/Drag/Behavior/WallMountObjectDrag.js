var WallMountObjectDrag = function (dependencyContainer, handlers) {
    WallObjectDrag.prototype.constructor.call(this, dependencyContainer, handlers);

    //this._wallCutHelper = dependencyContainer.getService('wallCutHelper');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    //this._scene3D = dependencyContainer.getService('scene3D');
    this._stage = dependencyContainer.getService('stage');
    this._wallHoles = dependencyContainer.getService('wallHoles');
    
    this._objectWallRangeChecker = new ObjectInWallRangev2(dependencyContainer);
};

WallMountObjectDrag.prototype = Object.create(WallObjectDrag.prototype);

WallMountObjectDrag.prototype.constructor = WallMountObjectDrag;

WallMountObjectDrag.prototype.canExecute = function (selected) {

    var i = 0,
        wall,
        obj,
        userData;

    for (; i < selected.length; i++) {
        obj = selected[i];
        userData = obj.userData;
        wall = i === 0 ? userData.wall : wall;
        if (userData.wall === wall &&
            this._objectCheckerSrvc.isWallEmbeddable(obj))
            continue;
        else
            return false;
    }

    return true;
};

WallMountObjectDrag.prototype.drag = function (staticObjects, allDraggedObjects,
    curentlyDraggedObject, oldPos, newPos, dragState) {

    this._wallName = curentlyDraggedObject.parent.userData.wall;

    var resultingPosition = WallObjectDrag.prototype.drag.apply(this, arguments);
    var entity = curentlyDraggedObject.userData.entity;
    var wall = this._stage.getObjectByName(this._wallName);

    if (!      
         this._objectWallRangeChecker.check(wall, entity, resultingPosition, wall.rotation)
        )
        return null;
    
    this._wallHoles.update(this._wallName);
   
    return resultingPosition;
};

WallMountObjectDrag.prototype.dragEnd = function () {
    //this._objectWallRangeChecker.clearState();
    WallObjectDrag.prototype.dragEnd.call(this);
    this._wallHoles.update(this._wallName);
};

WallMountObjectDrag.prototype.getStaticObjectsFilter = function (draggedObjs) {
    var base = WallObjectDrag.prototype.getStaticObjectsFilter.call(this, draggedObjs);
    return function (obj) {
        return base(obj) &&
           !this._objectCheckerSrvc.isWall(obj);
    }.bind(this);
};