'use strict';

describe('Directive: step3', function () {

  // load the directive's module
  beforeEach(module('vigilantApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<step3></step3>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the step3 directive');
  }));
});
