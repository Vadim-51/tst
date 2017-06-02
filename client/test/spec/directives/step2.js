'use strict';

describe('Directive: step2', function () {

  // load the directive's module
  beforeEach(module('vigilantApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<step2></step2>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the step2 directive');
  }));
});
