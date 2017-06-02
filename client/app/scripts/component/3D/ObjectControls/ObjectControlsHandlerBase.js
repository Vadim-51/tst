var ObjectControlsHandlerBase = function (name) {
    this.name = name;
};

ObjectControlsHandlerBase.prototype.constructor = ObjectControlsHandlerBase;

ObjectControlsHandlerBase.prototype.invokeAction = function (actionName, arg) {
    return true;
};

ObjectControlsHandlerBase.prototype.canExecute = function (objects) {
    return objects.length !== 0;
};