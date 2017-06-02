var TouchAndMouseMap = function () {
    ComponentBase.prototype.constructor.call(this);
};

TouchAndMouseMap.prototype = Object.create(ComponentBase.prototype);

TouchAndMouseMap.prototype.constructor = TouchAndMouseMap;

TouchAndMouseMap.prototype.mouseDown = function (e) {
   return this.hold(e);
};

TouchAndMouseMap.prototype.touchstart = function (e) {
    return this.hold(e);
};

TouchAndMouseMap.prototype.mouseUp = function (e) {
    return this.release(e);
};

TouchAndMouseMap.prototype.touchend = function (e) {
    return this.release(e);
};

TouchAndMouseMap.prototype.touchMove = function (e) {
    return this.move(e);
};

TouchAndMouseMap.prototype.mouseMove = function (e) {
    return this.move(e);
};

TouchAndMouseMap.prototype.hold = function (e) { };
TouchAndMouseMap.prototype.release = function (e) { };
TouchAndMouseMap.prototype.move = function (e) { };