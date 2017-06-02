var CounterClockwiseRotateHandler = function (dependencyContainer, select3D) {
    RotateHandlerBase.prototype.constructor.call(this, dependencyContainer,
        select3D, 'rotateCounterClockwise', 1);
};

CounterClockwiseRotateHandler.prototype = Object.create(RotateHandlerBase.prototype);

CounterClockwiseRotateHandler.prototype.constructor = CounterClockwiseRotateHandler;