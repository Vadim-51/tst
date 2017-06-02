var Select3D = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    this._stage = dependencyContainer.getService('stage');
    this._constants = dependencyContainer.getService('constants');
    this._dimensionalRadialsManager = dependencyContainer.getService('dimensionalRadialsManager');
    this._rayHelper = dependencyContainer.getService('rayHelper');
    this._objectCheckerSrvc = dependencyContainer.getService('objectCheckerSrvc');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._raycaster = new THREE.Raycaster();

    this.selectedObjects = [];
};

Select3D.prototype = Object.create(ComponentBase.prototype);

Select3D.prototype.constructor = Select3D;

Select3D.prototype.mouseDown = function (e) {
    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;
};

Select3D.prototype._alreadySelected = function (pickedObj) {
    var index = this.selectedObjects.indexOf(pickedObj);
    if (this.selectedObjects.length == 1 && index !== -1) {
        this.selectedObjects[index].getObjectByName('selection').visible = false;
        this.selectedObjects.splice(index, 1);
        this.fireEvent('select', this.selectedObjects);
        return true;
    }
    return false;
};

Select3D.prototype.mouseUp = function (e) {

   // this._dimensionalRadialsManager.deleteDimensionalRadials();

    //check is mouse position change during mousedown
    if (e.offsetX !== this.mouseX && e.offsetY !== this.mouseY)
        return;

    this._sceneUtils.getRay(e.offsetX, e.offsetY, this._raycaster);

    var sceneObjs = this._stage.getChildren().filter(function (obj) {
        return obj.visible && (obj.userData.entity || obj.userData.isFloor);
    });

    var intersections = this._rayHelper.intersectObjectsObb(this._raycaster.ray, sceneObjs),
        intersection;

    for (var i = 0; i < intersections.length; i++) {
        if (!intersections[i].object.material.visible) {
            continue;
        }
        else {
            intersection = intersections[i];
            break;
        }
    }
    // intersection = this._rayHelper.intersectObjectsObb(this._raycaster.ray, sceneObjs)[0];
    // if (!intersection.object.material.visible) intersection = this._rayHelper.intersectObjectsObb(this._raycaster.ray, sceneObjs)[1];

    if (intersection) {

        var selectedObject = intersection.object;
            //this._objectCheckerSrvc.isWall(intersection.object) ? intersection.object : intersection.object.parent;
        //if (!this._objectCheckerSrvc.isWallOrFloor(selectedObject)) {
            //this._scene3D.add(this._dimensionalRadialsManager.getDimensionalRadials(selectedObject));
            // this._scene3D.drawDimensionalRadials(selectedObject);
        //}

        //var groupId = selectedObject.userData.groupId;
        //if (groupId) {

        //    this.fireEvent('groupSelect', true);

        //    this.setSelectionVisibility(false);
        //    this.selectedObjects.length = 0;

        //    for (var i = 0; i < sceneObjs.length; i++) {
        //        var chld = sceneObjs[i];
        //        if (chld.userData && chld.userData.groupId === groupId) {
        //            this.selectedObjects.push(chld);
        //            // this.fireEvent('select', this.selectedObjects);
        //        }
        //    }

        //    this.setSelectionVisibility(true);

        //} else {

            this.fireEvent('groupSelect', false);

            if (this._alreadySelected(selectedObject))
                return;

            if (e.shiftKey
                && this._objectCheckerSrvc.sameWallInteraction(selectedObject, this.selectedObjects[0])
                && !this._objectCheckerSrvc.isWallOrFloor(selectedObject)
                && (this.selectedObjects.length !== 0 && !this._objectCheckerSrvc.isWallOrFloor(this.selectedObjects[0]))) {

                this.selectedObjects.push(selectedObject);
                this.setSelectionVisibility(true);
                this.fireEvent('select', this.selectedObjects);

            }
            else {

                this.setSelectionVisibility(false);
                this.selectedObjects.length = 0;
                this.selectedObjects.push(selectedObject);
                this.fireEvent('select', this.selectedObjects);
                this.setSelectionVisibility(true);
            }
        }
    //}
    else {
        this.setSelectionVisibility(false);
        this.selectedObjects.length = 0
        this.fireEvent('select', this.selectedObjects);
    }
};

//Select3D.prototype.dblclick = function (e) {

//    //this._dimensionalRadialsManager.deleteDimensionalRadials();

//    this._scene3D.getPickingRay(e.offsetX, e.offsetY, this._raycaster);

//    var sceneObjects = this._scene3D.getChildren().filter(function (obj) {
//        return obj.visible && obj instanceof THREE.Mesh && !this._objectCheckerSrvc.isWallOrFloor(obj)
//    }.bind(this));
//    var intersection = this._rayHelper.intersectObjectsObb(this._raycaster.ray, sceneObjects);
//    //this._raycaster.intersectObjects(sceneObjects);

//    if (intersection.length !== 0) {
//        this.fireEvent('objectDoubleClick', intersection);
//        return false;
//    }
//};

Select3D.prototype.clearSelection = function () {
    this.setSelectionVisibility(false);
    this.selectedObjects.length = 0;
    this.fireEvent('select', this.selectedObjects);
};

Select3D.prototype.setSelectionVisibility = function (bool) {
    var i = 0,
        selection,
        selected = this.selectedObjects;
    for (; i < selected.length; i++) {
        selection = selected[i].getObjectByName('selection');
        if (selection)
            selection.visible = bool;
    }
};

Select3D.prototype.disable = function () {
    ComponentBase.prototype.disable.call(this);
    this.clearSelection();
};

Select3D.prototype.getSelected = function () {
    return this.selectedObjects;
};