var ComponentBase = function () {
    EventDispatch.prototype.constructor.call(this);
    this._enable = true;
};

ComponentBase.prototype = Object.create(EventDispatch.prototype);

ComponentBase.prototype.constructor = ComponentBase;
    
ComponentBase.prototype.disable = function () {
    this._enable = false;
};

ComponentBase.prototype.enable = function () {
    this._enable = true;
};

//called by engine
ComponentBase.prototype.isEnabled = function () {
    return this._enable;
};

//called by engine on init
ComponentBase.prototype.init = function (engine) {};