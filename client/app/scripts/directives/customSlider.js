(function () {

    var directive = function ($timeout) {

        return {
            restrict: 'A',
            link: function (scope, element) {

                var arrowClick = function (up, down, e) {

                    var arrowClick = false;

                    if (e.target === down && this.rotationAngle + 1 <= 360) {
                        arrowClick = true;
                        this.rotationAngle++;
                    }

                    if (e.target === up && this.rotationAngle - 1 >= 0) {
                        arrowClick = true;
                        this.rotationAngle--;
                    }

                    if (arrowClick) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.$apply();
                    }
                };

                var up = document.createElement('img'),
                    down = document.createElement('img'),
                    callBack = angular.bind(scope, arrowClick, up, down);

                up.setAttribute('class', 'upArrow');
                up.setAttribute('src', 'images/Small-arrow-up-icon.png');

                down.setAttribute('class', 'downArrow');
                down.setAttribute('src', 'images/Small-arrow-down-icon.png');

                $timeout(function () {

                    var handle = element.find('.min-slider-handle')[0],
                        track = element.find('.slider-track')[0],
                        isTouchDevice = "ontouchstart" in document.documentElement;

                    if (isTouchDevice)
                        track.addEventListener('touchstart', callBack, false);
                    else
                        track.addEventListener('mousedown', callBack, false);

                    handle.appendChild(up);
                    handle.appendChild(down);

                }, 0);
            }
        }
    };

    angular.module('vigilantApp').directive('customSlider', ['$timeout', directive]);
})();