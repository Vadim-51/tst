'use strict';

describe('Service: Scene2d', function () {

  // load the service's module
  beforeEach(module('vigilantApp'));

  // instantiate service
  var Scene2d;
  beforeEach(inject(function (_Scene2d_) {
    Scene2d = _Scene2d_;
  }));

  it('should do something', function () {
    expect(!!Scene2d).toBe(true);
  });

});
