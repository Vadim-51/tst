var Engine = function () {
    this.components = [];
    this._isInitialized = false;
    this._componentsCount = 0;
    this._events = {};
    //this._element = null;
    this._enable = false;
    this._isSbscribedToEvents = false;

    this._canvas = [];
};

Engine.prototype.constructor = Engine;

Engine.prototype.addComponent = function (component) {
    this.components.push(component);
    this._componentsCount = this.components.length;
};

Engine.prototype.addComponents = function (components) {
    for (var i = 0; i < components.length; i++) {
        this.components.push(components[i]);
    }
    this._componentsCount = this.components.length;
};

Engine.prototype._prepareEventFuncs = function () {
    this._events.mouseup = this._callEvent.bind(this, 'mouseUp');
    this._events.mousemove = this._callEvent.bind(this, 'mouseMove');
    this._events.mouseenter = this._callEvent.bind(this, 'mouseEnter');
    this._events.mouseleave = this._callEvent.bind(this, 'mouseLeave');
    this._events.mousedown = this._callEvent.bind(this, 'mouseDown');
    this._events.touchstart = this._callEvent.bind(this, 'touchStart');
    this._events.touchmove = this._callEvent.bind(this, 'touchMove');
    this._events.touchend = this._callEvent.bind(this, 'touchEnd');
    this._events.dblclick = this._callEvent.bind(this, 'dblclick');
    this._events.mouseScroll = this._callEvent.bind(this, 'mouseScroll');
    this._events.keydown = this._callEvent.bind(this, 'keyDown');
};

Engine.prototype._eventsSubscribe = function (subscribe, element) {

    var funcName = subscribe ? 'addEventListener' : 'removeEventListener';//,
        //element = this._element;

    //if (subscribe != this._isSbscribedToEvents) {
       // this._isSbscribedToEvents = subscribe;
        element[funcName]('mouseup', this._events.mouseup, false);
        element[funcName]('mousemove', this._events.mousemove, false);
        element[funcName]('mouseenter', this._events.mouseenter, false);
        element[funcName]('mouseleave', this._events.mouseleave, false);
        element[funcName]('mousedown', this._events.mousedown, false);
        element[funcName]('touchstart', this._events.touchstart, false);
        element[funcName]('touchmove', this._events.touchmove, false);
        element[funcName]('touchend', this._events.touchend, false);
        element[funcName]('dblclick', this._events.dblclick, false);
        element[funcName]('mousewheel', this._events.mouseScroll, false);
        element[funcName]('DOMMouseScroll', this._events.mouseScroll, false);
        window[funcName]('keydown', this._events.keydown, false);
    //}
};

Engine.prototype.init = function () {
    if (!this._isInitialized) {
        //this._element = element;
        this._isInitialized = true;

        //call init on each component
        for (var i = 0; i < this._componentsCount; i++) {
            var component = this.components[i];
            component.init.call(component, this);
        }

        this._prepareEventFuncs();

        this.enable();
       // this._eventsSubscribe(true);
    }
};

Engine.prototype.registerEvents = function (canvas) {
    if (this._canvas.indexOf(canvas) === -1) {
        this._canvas.push(canvas);
        this._eventsSubscribe(true, canvas);
    }
};

Engine.prototype._callEvent = function (eventName, e) {

    if (!this._enable)
        return;

    var i = 0,
        component,
        componentEvent,
        breaker;
    for (; i < this._componentsCount; i++) {
        component = this.components[i];
        componentEvent = component[eventName];
        if (componentEvent && component.isEnabled()) {
            breaker = componentEvent.call(component, e);
            if (breaker === false)
                return;
        }
    }
};

Engine.prototype.dispose = function () {
    if (this._isInitialized) {

        this._isInitialized = false;

        for (var i = 0; i < this._canvas.length; i++) {
            this._eventsSubscribe(false, this._canvas[i]);
        }

        //this._eventsSubscribe(false);

        var components = this.components;
        for (var i = 0; i < components.length; i++) {
            if (components[i].dispose)
                components[i].dispose();
        }

        this._canvas.length = 0;
        this.components.length = 0;
        //this._element =
            this._events = null;
    }
};

Engine.prototype.findComponentByType = function (type) {
    var components = this.components,
        i = 0,
        component;
    for (; i < this._componentsCount; i++) {
        component = components[i];
        if (component instanceof type)
            return component;
    }
    return component;
};

Engine.prototype.disable = function () {
    this._enable = false;
    //this._eventsSubscribe(false);
};

Engine.prototype.enable = function () {
    this._enable = true;
   // this._eventsSubscribe(true);
};