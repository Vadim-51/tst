(function () {

    var service = function (resourceCache) {

        var _loader = new THREE.ImageLoader();
        _loader.setCrossOrigin("Anonymous");

        var _promises = {};

        var _success = function (url, resolve, image) {
            delete _promises[url];
            resourceCache.set(url, image);
            resolve(image);
        };

        var _error = function (url, reject) {
            delete _promises[url];
            reject();
        };

        var _loadPromise = function (url) {

            var promise = _promises[url];

            if (!promise) {

                promise = new Promise(function (resolve, reject) {
                    _loader.load(url, _success.bind(null, url, resolve), undefined,
                        _error.bind(null, url, reject));
                });

                _promises[url] = promise;
            }

            return promise;
        };

        var _fromCachePromise = function (recource) {
            return Promise.resolve(recource);
        };

        return {
            load: function (urls) {

                urls = Array.isArray(urls) ? urls : new Array(urls);

                var i = 0,
                    cachedImage,
                    promise,
                    promises = [],
                    url;

                for (; i < urls.length; i++) {

                    url = urls[i];

                    if (url) {

                        cachedImage = resourceCache.get(url);

                        if (!cachedImage) {
                            promise = _loadPromise(url);
                        } else {
                            promise = _fromCachePromise(cachedImage);
                        }

                        promises.push(promise);
                    } else {
                        var empty = _fromCachePromise(null);
                        promises.push(empty);
                    }
                }

                return promises.length > 0 ? Promise.all(promises) : null;
            }
        }
    };

    angular.module('vigilantApp').service('resourceLoader', ['resourceCache', service]);
})();
