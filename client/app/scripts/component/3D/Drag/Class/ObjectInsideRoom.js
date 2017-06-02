var ObjectInsideRoom = function (dependencyContainer) {
    this._stage = dependencyContainer.getService('stage');
    this._rc = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
    this._floor = null;
};

ObjectInsideRoom.prototype.constructor = ObjectInsideRoom;

ObjectInsideRoom.prototype.check = function (newPosition) {
    this._floor = this._floor || this._stage.getFloor();
    this._rc.ray.origin.copy(newPosition);
    if (this._rc.intersectObject(this._floor).length === 0) 
        return false;
    return true;
};

ObjectInsideRoom.prototype.clearState = function () {
    this._floor = null;
};