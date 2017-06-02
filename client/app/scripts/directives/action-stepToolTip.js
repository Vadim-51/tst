(function () {

    var directive = function () {
        return {
            templateUrl: '/views/action-stepToolTip.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                key: '@'
            },
            controller: ['$scope', '$timeout', function ($scope) {
                if (localStorage.getItem($scope.key)) {
                    $scope.action = false;
                }
                else{
                    $scope.action = true;
                }
                console.log($scope.action);
                $scope.changeActionShowToolTip = function(){
                    $scope.action = !$scope.action;
                    if($scope.action){
                        localStorage.removeItem(this.key);
                    }
                    else{
                        localStorage.setItem(this.key, 1);
                    }
                };

            }]
        }
    };

    angular.module('vigilantApp').directive('actionTooltip', directive);
})();