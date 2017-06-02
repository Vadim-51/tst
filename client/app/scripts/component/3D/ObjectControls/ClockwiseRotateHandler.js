var ClockwiseRotateHandler = function (dependencyContainer, select3D) {
    RotateHandlerBase.prototype.constructor.call(this, dependencyContainer, select3D,
        'rotateClockwise', -1);
};

ClockwiseRotateHandler.prototype = Object.create(RotateHandlerBase.prototype);

ClockwiseRotateHandler.prototype.constructor = ClockwiseRotateHandler;