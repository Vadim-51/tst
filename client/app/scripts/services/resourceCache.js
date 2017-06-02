(function () {

    var service = function () {

        var _cache = {};

        return {
            get: function (url) {
                return _cache[url];
            },
            set: function (url, image) {
                _cache[url] = image;
            }
        }
    };

    angular.module('vigilantApp').service('resourceCache', service);
})();
