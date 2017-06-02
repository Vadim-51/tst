; (function () {

    //use this service to check mouse status(hold or not)
    var service = function () {

        var result = {
            isMouseHold: false,
            ctrlHold : false
        };

        var mouseDown = function (e) {
            result.isMouseHold = true;
        };

        var mouseUp = function (e) {
            result.isMouseHold = false;
        };

        var dblclick = function (e) {
            result.isMouseHold = false;
        };

        var onKeyPress = function (e) {
            result.ctrlHold = e.ctrlKey;
        };

        var body = document.body;
        body.addEventListener('mousedown', mouseDown, false);
        body.addEventListener('mouseup', mouseUp, false);
        body.addEventListener('dblclick', dblclick, false);
        body.addEventListener('keydown', onKeyPress, false);
        body.addEventListener('keyup', onKeyPress, false);

        return result;
    };

    angular.module('vigilantApp').service('keyState', service);
})();
