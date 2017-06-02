(function () {

    var directive = function () {
        return {
            templateUrl: '/views/stepToolTip.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                key: '@',
                step: '@'
            },
            controller: ['$scope', '$timeout', function ($scope, $timeout) {
                $scope.checked = false;
                var timeout = null,
                    stepText = 'step' + $scope.step;

                $scope.tooltipVisibilityChange = function () {
                    $scope.checked = true;
                    if (!localStorage.getItem(this.key)) {
                        localStorage.setItem(this.key, 1);
                        this.show = false;
                    }
                };

                $scope.$on('stepActive', function (e, step) {
                    if (stepText === step) {
                        if (!localStorage.getItem($scope.key)) {
                            $scope.checked = false;
                            $scope.show = true;
                            timeout = $timeout(function() {
                                $scope.show = false;
                            }, 5000);
                        }
                    } else {
                        if (timeout !== null) {
                            $timeout.cancel(timeout);
                            $scope.show = false;
                            timeout = null;
                        }
                    }
                });
            }]
        }
    };

    angular.module('vigilantApp').directive('stepTooltip', directive);
})();