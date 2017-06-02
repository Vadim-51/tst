angular.module('vigilantApp').service('ScaleService', [function () {

    var scale = function (mesh, isMode3D) {
        var x, y, z, x1, y1, z1;
        if (isMode3D) {
            x = mesh.userData.length;
            y = mesh.userData.height;
            z = mesh.userData.width;
            x1 = mesh.userData.entity.length;
            y1 = mesh.userData.entity.height;
            z1 = mesh.userData.entity.width;
        } else {
            x = mesh.userData.length;
            y = mesh.userData.width;
            z = mesh.userData.height;
            x1 = mesh.userData.entity.length;
            y1 = mesh.userData.entity.width;
            z1 = mesh.userData.entity.height;
        }
        mesh.scale.set(x / x1, y / y1, z / z1);
    };
    function convertToCm(value) {
        return value * 2.54;
    };
    var setDimensions = function (userData, dimensions, cm) {
        if (cm) {
            userData.width = dimensions.width;
            userData.height = dimensions.height;
            userData.length = dimensions.length;
        } else {
            userData.width = convertToCm(dimensions.width);
            userData.height = convertToCm(dimensions.height);
            userData.length = convertToCm(dimensions.length);
        }
    }
    return {
        scale: scale,
        setDimensions: setDimensions
    };
}]);