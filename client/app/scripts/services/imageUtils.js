; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        return {
            textToImage: function (text, config) {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext("2d");

                canvas.setAttribute('width', 128);
                canvas.setAttribute('height', 64);

                ctx.font = "22px Arial";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                return canvas;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('imageUtils', service);

})();
