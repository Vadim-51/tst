'use strict';

describe('Directive: sliderArrow', function () {

  // load the directive's module
  beforeEach(module('vigilantApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<slider-arrow></slider-arrow>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the sliderArrow directive');
  }));
});
