; (function () {
    'use strict';

    var dependencies = ['constants'];

    var service = function (constants) {

        var sizeUnits = constants.SizeUnit.FT;
        var isSnappingDisabled = false;

        return {
            setSizeUnits: function (u) {
                sizeUnits = u;
            },
            getSizeUnits: function () {
                return sizeUnits;
            },

            setIsDisableSnapping: function (val) {
                isSnappingDisabled = val;
            },
            getIsDisableSnapping: function () {
                return isSnappingDisabled;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('appSettings', service);

})();
