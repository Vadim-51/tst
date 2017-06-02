'use strict';

describe('Directive: ftin', function () {

  // load the directive's module
  beforeEach(module('vigilantApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ftin></ftin>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ftin directive');
  }));
});
