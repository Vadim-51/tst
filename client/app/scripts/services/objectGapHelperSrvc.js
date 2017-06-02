; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        return {

            getGapBetweenTwoObjects: function (entity1, entity2) {
                var entity1Border = entity1.borders;
                var entity2Border = entity2.borders;
                var gap = entity1Border && entity1Border.default ? parseFloat(entity1Border.default) : 0;
                gap = (entity2Border && entity2Border.default) ? gap + parseFloat(entity2Border.default) : gap;
                return gap;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objectGapHelperSrvc', service);

})();
