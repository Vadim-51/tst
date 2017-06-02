'use strict';
angular.module('vigilantApp').directive('loading', function () {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="loading">' +
      '<div class="loading-overlay"></div>' +
        '<div class="loading-content">' +
          '<img src="images/loading.gif" width="72" height="72" />' +
        '</div>' +
      '/div',
    link: function postLink (scope, element, attr) {

      scope.$watch('isLoading', function (v) {
        if (v) {
          $(element).show();
        } else {
          $(element).hide();
        }
      });
    }

  }
});
