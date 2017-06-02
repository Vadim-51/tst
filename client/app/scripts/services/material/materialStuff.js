(function () {

    // REFACTOR

    var service = function (constants, $http, ResourceService) {
        // REFACTOR
        var floorMaterials = [],
            wallMaterials = [],
            floorGroupNames = ['Concrete', 'Brick', 'Stone', 'Paint', 'Textured', 'Tile', 'Vinyl'],
            wallGroupNames = ['Block', 'Brick', 'Concrete', 'Paint', 'Stone', 'Stucco', 'Tile', 'Wood'],
            materials = [];

        // $http.get('http://localhost:443/materials/materials').then(function (response) {
        ResourceService.getAllMaterials().then(function (data) {
            // var data = response.data;

            angular.forEach(data, function (mat) {
                if (mat.material === 'floor') {
                    floorMaterials.push(mat);
                }
                else {
                    wallMaterials.push(mat);
                }
            });
        })

        return {
            floorMaterials: floorMaterials,
            wallMaterials: wallMaterials,
            floorGroupNames: floorGroupNames,
            wallGroupNames: wallGroupNames,

            getFloorMaterialsByGroup: function (floorGroupName) {
                var group = [];
                for (var i = 0; i < floorMaterials.length; i++) {
                    if (floorMaterials[i].materialGroup === floorGroupName) {
                        group.push(floorMaterials[i]);
                    }
                }
                return group;
            },

            getWallMaterialsByGroup: function (wallGroupName) {
                var group = [];
                for (var i = 0; i < wallMaterials.length; i++) {
                    if (wallMaterials[i].materialGroup === wallGroupName) {
                        group.push(wallMaterials[i]);
                    }
                }
                return group;
            },

            getWallMaterialNamesByGroupName: function (groupName) {
                var resp = [];
                for (var i = 0; i < wallMaterials.length; i++) {
                    if (wallMaterials[i].materialGroup === groupName) {
                        resp.push(wallMaterials[i].name);
                    }
                }
                return resp;
            },

            getFloorMaterialNamesByGroupName: function (groupName) {
                var resp = [];
                for (var i = 0; i < floorMaterials.length; i++) {
                    if (floorMaterials[i].materialGroup === groupName) {
                        resp.push(floorMaterials[i].name);
                    }
                }
                return resp;
            },

            getFloorMaterialByName: function (materialName) {
                for (var i = 0; i < floorMaterials.length; i++) {
                    if (floorMaterials[i].name === materialName) {
                        return floorMaterials[i];
                    }
                }
            },

            getWallMaterialByName: function (materialName) {
                for (var i = 0; i < wallMaterials.length; i++) {
                    if (wallMaterials[i].name === materialName) {
                        return wallMaterials[i];
                        break;
                    }
                }
                return wallMaterials[5];
            }

        }
    };

    angular.module('vigilantApp').service('materialStuffService', ['constants', '$http', 'ResourceService', service]);

})();
