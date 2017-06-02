; (function () {

    var dependency = ['Scene2d', 'constants'];

    var service = function (Scene2d, constants) {

        return {

            clipEmptySpace2D: function (base64ImageData) {

                var img = new Image();
                img.src = base64ImageData;

                var floor = Scene2d.scene.children.find(function (obj) { return obj.floor });

                if (floor) {

                    floor.geometry.computeBoundingBox();

                    var size = floor.geometry.boundingBox.size();
                    var center = floor.geometry.boundingBox.center();

                    var canvas = document.createElement('canvas');
                    var cnx = canvas.getContext("2d");

                    var wallWidth = constants.wallWidth;

                    var topLeft = center.clone();
                    topLeft.x -= size.x / 2 + wallWidth;
                    topLeft.y += size.y / 2 + wallWidth;
                    Scene2d.worldToScreen(topLeft);

                    var bottomRight = center.clone();
                    bottomRight.x += size.x / 2 + wallWidth;
                    bottomRight.y -= size.y / 2 + wallWidth;
                    Scene2d.worldToScreen(bottomRight);

                    var clipWidth = bottomRight.x - topLeft.x;
                    var clipHeight = bottomRight.y - topLeft.y;
                    var x = topLeft.x;
                    var y = topLeft.y;
                   
                    canvas.width = clipWidth;
                    canvas.height = clipHeight;

                    cnx.drawImage(img, x, y, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight);

                    return canvas.toDataURL();
                }

                return base64ImageData;
            }
        }
    };

    service.$inject = dependency;

    angular.module('vigilantApp').service('screenshotPreprocess', service);

})();