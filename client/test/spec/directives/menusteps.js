'use strict';

describe('Directive: menuSteps', function () {

  // load the directive's module
  beforeEach(module('vigilantApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<menu-steps></menu-steps>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the menuSteps directive');
  }));
});
