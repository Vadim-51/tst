;(function () {

    var dependencies = [];

    var service = function () {

        //store object color scheme
        var colorScheme = [
            // {scheme:..,objectId:...}
        ];

        // REFACTOR
        // make an array with string for each wall
        var savedWallMaterial;
        var savedFloorMaterial;

        //store room points as array of {x:0,y:0,depth:0}
        var roomPoints;

        //store room points as vector array 
        var points = [];

        var lastColorScheme = 'MahNaturalLaq';

        var getColorSchemeByObjectId = function (objectId) {
            var i = 0,
                item;
            for (; i < colorScheme.length; i++) {
                item = colorScheme[i];
                if (item.objectId === objectId)
                    return item;
            }
            return null;
        };

        var convertPoints = function (roomPoints) {
            var result = [],
                i = 0,
                point;

            for (; i < roomPoints.length; i++) {
                point = roomPoints[i];
                result.push(new THREE.Vector3(point.x, 0, point.z));
            }

            return result;
        };

        return {
            getSavedWallMaterial: function () {
                return savedWallMaterial;
            },

            setWallMaterial : function (val) {
                savedWallMaterial = val;
            },

            getSavedFloorMaterial: function () {
                return savedFloorMaterial;
            },

            setFloorMaterial : function (val) {
                savedFloorMaterial = val;
            },

            clearCurrentRoomState: function () {
                colorScheme.length = 0;
                roomPoints = [];
                points = [];
            },
            saveObjectColorScheme: function (data) {
                var item = this.getColorSchemeByObjectId(data.objectId);
                if (item) {
                    if (data.updateIfExist !== false)
                        item.scheme = data.scheme;
                }
                else {
                    colorScheme.push({
                        objectId: data.objectId,
                        scheme: data.scheme
                    });
                }
            },
            getObjectsColorSchemes: function () {
                return colorScheme;
            },
            removeObjectColorScheme: function (objectId) {
                var item = this.getColorSchemeByObjectId(objectId);
                if (item) {
                    var index = colorScheme.indexOf(item);
                    colorScheme.splice(index, 1);
                }
            },
            getColorSchemeByObjectId: getColorSchemeByObjectId,
            setPoints: function (pts) {
                //  var clone = points.slice(0);
                roomPoints = pts;
                points = convertPoints(pts);
            },
            getNextPointIndex: function (index) {
                return index === roomPoints.length - 1 ? 0 : index + 1;
            },
            getPrevPointIndex: function (index) {
                return index === 0 ? roomPoints.length - 1 : index - 1;
            },
            getPoint: function (index) {
                return points[index];
            },
            getPoints: function () {
                return points;
            },
            updatePoint: function (index, point, depth) {
                var p = roomPoints[index];
                p.x = point.x;
                p.y = point.z;
                p.depth = depth || p.depth;
                points[index].set(point.x, 0, point.z);
            },
            getRoomPoints: function () {
                return roomPoints;
            },
            insertPoint: function (addIndex, point) {
                roomPoints.splice(addIndex, 0, point);
                points.splice(addIndex, 0, new THREE.Vector3(point.x, 0, point.z));
            },
            hasPoints: function () {
                return roomPoints && roomPoints.length !== 0;
            },
            removePoint: function (index) {
                roomPoints.splice(index, 1);
                points.splice(index, 1);
            },
            setLastColorScheme: function (colorScheme) {
                lastColorScheme = colorScheme;
            },
            getLastColorScheme: function () {
                return lastColorScheme;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('roomStateManager', service);

})();
