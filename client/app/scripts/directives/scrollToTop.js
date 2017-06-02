angular.module('vigilantApp').directive('scrollToTop', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, elem, attrs) {
            scope.$watch(attrs.scrollToTop, function () {
                elem[0].scrollTop = 0;
            });
        }
    };
});