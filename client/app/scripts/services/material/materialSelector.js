; (function () {

    var service = function (constants) {
        
        return {
            getMaterials: function (entity) {
                return entity.color_scheme;
            }
        };
    };

    angular.module('vigilantApp').service('materialSelector', ['constants', service]);
})();
