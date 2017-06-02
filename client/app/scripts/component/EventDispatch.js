var EventDispatch = function () {
    this._events = {};
};

EventDispatch.prototype.constructor = EventDispatch;

EventDispatch.prototype.fireEvent = function () {
    var eventName = arguments[0],
        params = Array.prototype.slice.call(arguments, 1, arguments.length),
        callBacks = this._events[eventName];
    if (!callBacks) return;
    callBacks.forEach(function (cb) {
        cb.apply(null, params);
    });
};

//subscribe for events
EventDispatch.prototype.on = function (eventName, callback, thisArg) {

    var events = this._events;

    if (!events[eventName])
        events[eventName] = [];

    callback = thisArg ? callback.bind(thisArg) : callback;

    events[eventName].push(callback);

    return function () {
        var index = events[eventName].indexOf(callback);
        events[eventName].splice(index, 1);
    };
};

EventDispatch.prototype.dispose = function () {
    this._events = null;
};