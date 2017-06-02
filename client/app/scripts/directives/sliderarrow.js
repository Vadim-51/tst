'use strict';

/**
 * @ngdoc directive
 * @name vigilantApp.directive:sliderArrow
 * @description
 * # sliderArrow
 */
angular.module('vigilantApp').directive('sliderArrow', function () {
    return {
        templateUrl: '../views/sliderarrow.html',
        restrict: 'E',
        scope: {
            images: '=data',
            itemClickCallback: '&itemClick',
            selectedItem: '='
        },
        link: function postLink(scope, element) {

            var change = element.children().children()[1];
            var callback = scope.itemClickCallback();

            scope.scroling = function (scrollWay) {
                change.scrollLeft += 65 * scrollWay;
            };

            scope.itemClick = function (item) {
                if (callback) {
                    event.preventDefault();
                    callback(item);
                }
            };

            scope.itemTouch = function (item, e) {
                if (e.originalEvent.touches && callback) {
                    event.preventDefault();
                    callback(item, e);
                }
            };
        }
    };
});
