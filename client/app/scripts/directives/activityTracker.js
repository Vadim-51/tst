; (function () {

    var directive = function (googleAnalitycs) {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, element) {

                var click = false;

                setInterval(function () {
                    if (click) {
                        click = false;
                        googleAnalitycs.activityTrack();
                    }
                }, 3 * 60 * 1000);

                $(element).click(function () {
                    click = true;
                });
            }
        }
    };

    angular.module('vigilantApp').directive('activityTracker', ['googleAnalitycs', directive]);
})();