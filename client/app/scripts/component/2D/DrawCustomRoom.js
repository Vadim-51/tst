var DrawCustomRoom = function (dependencyContainer) {
    ComponentBase.prototype.constructor.call(this);

    //this._Scene2d = dependencyContainer.getService('Scene2d');
    this._stage = dependencyContainer.getService('stage');
    this._geometryHelper = dependencyContainer.getService('geometryHelper');
    this._sizeManager = dependencyContainer.getService('roomSizeManager');
    this._room2DBuilder = dependencyContainer.getService('room2DBuilder');
    this._constants = dependencyContainer.getService('constants');
    this._helperLines = dependencyContainer.getService('helperLines');
    this._sceneUtils = dependencyContainer.getService('sceneUtils');

    this._fistClick = false;

    this._roomCloseTrigger = new THREE.Sphere();
    this._roomCloseTrigger.radius = 10;
    this._roomCloseRay = new THREE.Ray(new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -1, 0));

    this._lastPoint = null;
    this._points = [];
};

DrawCustomRoom.prototype = Object.create(ComponentBase.prototype);

DrawCustomRoom.prototype.constructor = DrawCustomRoom;

DrawCustomRoom.prototype._createLine = function () {

    var container = new THREE.Object3D();

    var material = new THREE.LineBasicMaterial({
        color: 0x000000
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(1, 0, 0)
    );

    var line = new THREE.Line(geometry, material);
    line.name = 'Wall';

    container.add(line);

    return container;
};

DrawCustomRoom.prototype.mouseDown = function (e) {

    if (this._currentWallLine) {
        this._currentWallLine.updateMatrixWorld();
        var line = this._currentWallLine.getObjectByName('Wall');
        this._lastPoint = this._currentWallLine.localToWorld(new THREE.Vector3(line.scale.x, 0, 0));
    } else {
        this._lastPoint = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY);
    }

    this._lastPoint.y = 0;

    this._points.push(this._lastPoint);

    if (!this._fistClick) {
        this._fistClick = true;
        this._roomCloseTrigger.center.copy(this._lastPoint);
        this._stage.addMany(this._helperLines.getLines());
    }

    this._currentWallLine = this._createLine();
    this._currentWallLine.position.copy(this._lastPoint);
    this._stage.add(this._currentWallLine);
    this._sizeManager.buildForCustomRoom(this._currentWallLine.getObjectByName('Wall'));

   // this._Scene2d.render();

    return false;
};

DrawCustomRoom.prototype._getAngle = function (angleRad) {
    var angleDeg = Math.abs(THREE.Math.radToDeg(angleRad));
    if ((angleDeg >= 177 && angleDeg <= 183))
        return THREE.Math.degToRad(180);
    else if (angleDeg <= 2)
        return 0;
    else if (angleDeg >= 87 && angleDeg <= 93)
        return THREE.Math.degToRad(90) * Math.sign(angleRad);
    else
        return angleRad;
};

DrawCustomRoom.prototype._drawWall = function(e){
    if (this._lastPoint) {

        var pos = this._sceneUtils.screenToWorld(e.offsetX, e.offsetY).setY(0),
            diff = pos.clone().sub(this._lastPoint),
            newLength = diff.length(),
            angle = -Math.atan2(diff.z, diff.x),
            line = this._currentWallLine.getObjectByName('Wall'),
            pointIntersection,
            delta;

        line.scale.x = newLength >= 1 ? newLength : line.scale.x;
        this._currentWallLine.rotation.y = this._getAngle(angle);

        pointIntersection = this._helperLines.test(pos, this._points);

        if (pointIntersection) {
            delta = pointIntersection.sub(this._lastPoint);
            this._currentWallLine.rotation.y = -Math.atan2(delta.z, delta.x);
            newLength = delta.length();
            line.scale.x = newLength >= 1 ? newLength : line.scale.x;
        }

        this._roomCloseRay.origin.copy(pos);
        if (this._points.length >= 3 && this._roomCloseRay.intersectSphere(this._roomCloseTrigger)) {
            this._closeCustomRoom();
            return;
        }

        this._sizeManager.updateWallSizeCustomRoom(this._currentWallLine);
        //this._Scene2d.render();
    }
}
var draw = false;

DrawCustomRoom.prototype.mouseMove = function (e) {

        this._drawWall(e);

        //var canvas = document.getElementsByTagName("CANVAS")[0];
        //if(canvas){
        //    var canvasPosition = canvas.getBoundingClientRect();
        //    if(e.x+10 >= canvasPosition.right || e.x-10 <= canvasPosition.left
        //        || e.y+10 >= canvasPosition.bottom || e.y-10 <= canvasPosition.top){
        //            console.debug("Out of scene");
        //            this.fireEvent("zoomOut");
        //            this._drawWall({offsetX: e.offsetX, offsetY: e.offsetY, x: e.x, y: e.y});
        //            // this.mouseMove({offsetX: e.offsetX,
        //            //                 offsetY: 0,
        //            //                 x: e.x,
        //            //                 y: e.y});
        //    }else{draw = false;}
        //}

        // this._Scene2d.render();

    return false;
};

DrawCustomRoom.prototype.keydown = function (e) {
    if (e.keyCode === 27) {
        this._closeCustomRoom();
      //  this._Scene2d.render();
    }
};

DrawCustomRoom.prototype._closeCustomRoom = function () {

    var scene2D = this._stage;

    var wallDefaultWidth = this._constants.wallWidth;

   // var isClockwise = this._geometryHelper.isClockwisePolygon(this._points);

    //var ps = this._points.map(function (p) {
    //    return { x: p.x, y: -p.z };
    //});

    //var r = THREE.ShapeUtils.isClockWise(ps);

    //if (!isClockwise)
    //    this._points.reverse();

    scene2D.clean();

    var points = this._points.map(function (p) {
        return {
            x: p.x,
            z: p.z,
            depth: wallDefaultWidth
        }
    });

    //var objects = this._room2DBuilder.buildWalls(points);

    //scene2D.addMany(objects);

    this.fireEvent('created', points);

    //scene2D.render();

    this.disable();
};

DrawCustomRoom.prototype.disable = function () {
    ComponentBase.prototype.disable.call(this);
    this._points.length = 0;
    this._fistClick = false;
    this._currentWallLine = this._lastPoint = null;
};

//DrawCustomRoom.prototype.dispose = function () {
//    ComponentBase.prototype.dispose.call(this);
//    this._Scene2d = this._geometryHelper = null;
//};
