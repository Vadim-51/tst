var SnapHandler = function (dependencyContainer) {
    DragHandlerBase.prototype.constructor.call(this);

    this._objectGapHelperSrvc = dependencyContainer.getService('objectGapHelperSrvc');
    this._appSettings = dependencyContainer.getService('appSettings');

    this._draggedObjects = null;
    this._staticObjects = null;
};

SnapHandler.prototype = Object.create(DragHandlerBase.prototype);

SnapHandler.prototype.constructor = SnapHandler;

SnapHandler.prototype.drag = function (staticObjects, allDraggedObjects, curentlyDraggedObject, oldPos, newPos, dragState) {
    this._draggedObjects = allDraggedObjects;
    this._staticObjects = staticObjects;
    return this.prevHandlerComputedPosition;
};

SnapHandler.prototype.dragEnd = function () {

    if (Array.isArray(this._draggedObjects) && this._draggedObjects.length === 1 && !this._appSettings.getIsDisableSnapping()) {

        var draggedObject = this._draggedObjects[0];
        var container = draggedObject.parent;

        container.updateMatrixWorld();

        var draggedObjectEntity = draggedObject.userData.entity,
            staticObjects = this._staticObjects.map(function (o) {
                if (o.name == 'roomObject')
                    return o.getObjectByName('3D');
                else return o;
            }),
            leftEdge = new THREE.Vector3(-draggedObjectEntity.length / 2, 0, 0).applyMatrix4(container.matrixWorld),
            rightEdge = new THREE.Vector3(draggedObjectEntity.length / 2, 0, 0).applyMatrix4(container.matrixWorld),
            leftDirection = leftEdge.clone().sub(container.position).normalize(),
            rightDirection = rightEdge.clone().sub(container.position).normalize(),
            data = [{
                ray: new THREE.Raycaster(leftEdge, leftDirection, 0, 15),
                direction: new THREE.Vector3(-1, 0, 0)
            }, {
                ray: new THREE.Raycaster(rightEdge, rightDirection, 0, 15),
                direction: new THREE.Vector3(1, 0, 0)
            }],
            i = 0,
            item,
            intersection;

        for (; i < data.length; i++) {
            item = data[i];
            intersection = item.ray.intersectObjects(staticObjects)[0];
            if (this._snapObject(intersection, draggedObject, item.direction))
                break;
        }
    }

    this._draggedObjects = this._staticObjects = null
};

SnapHandler.prototype._snapObject = function (intersection, draggedObject, rayDirection) {
    if (intersection) {
        var intersectedObject = intersection.object,
            intersectedObjectContainer = intersectedObject.parent,
            intersectedEntity = intersectedObject.userData.entity,
            draggedObjectContainer = draggedObject.parent,
            draggedObjectEntity = draggedObject.userData.entity,
            hasSameRotation = intersectedObjectContainer.rotation.y === draggedObjectContainer.rotation.y,
            hasSameCategory = intersectedEntity.category === draggedObjectEntity.category;
        if (hasSameRotation && hasSameCategory) {

            var opositeDirection = rayDirection.negate();
            var edgePoint = opositeDirection.clone();
            edgePoint.multiplyScalar(intersectedEntity.length / 2);
            edgePoint.y -= intersectedEntity.height / 2;
            edgePoint.add(opositeDirection.clone().multiplyScalar(draggedObjectEntity.length / 2));

            var gap = this._objectGapHelperSrvc.getGapBetweenTwoObjects(draggedObjectEntity, intersectedEntity);
            edgePoint.add(opositeDirection.multiplyScalar(gap));

            intersectedObjectContainer.updateMatrixWorld();
            edgePoint.applyMatrix4(intersectedObjectContainer.matrixWorld);

            draggedObjectContainer.position.copy(edgePoint);
            draggedObjectContainer.position.y += draggedObjectEntity.height / 2;
            return true;
        }
    }
    return false;
};
