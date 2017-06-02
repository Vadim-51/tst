; (function () {

    var dependencies = ['constants', 'materialStuffService', 'ResourceService', 'objectCheckerSrvc', 'wall3DDataManager'];

    var service = function (constants, materialStuffService, ResourceService, objectCheckerSrvc, wall3DDataManager) {

        var common = {
            M2: {
                color: 0x121212,
                specular: 0xFFFFFF
            }
        };

        var colorScheme = [];

        ResourceService.getAllColorSchemes().then(function (data) {
            colorScheme = data;
        })

        var main = {
            M1: {
                shininess: 30,
                reflectivity: 0.1
            },
            M2: {
                shininess: 60,
                reflectivity: 0.68,
                normalMap: '/textures/cabinets/nm.jpg',
                normalScale: new THREE.Vector2(0.5, 0.5),
                normalMapSettings: {
                    wrapS: THREE.RepeatWrapping,
                    wrapT: THREE.RepeatWrapping,
                    repeat: new THREE.Vector2(10, 10)
                }
            },
            chrome: {
                color: 0xFFFFFF,
                specular: 0xFFFFFF,
                shininess: 90,
                reflectivity: 1,
                envMap: '/textures/cabinets/envMap.png'
            },
            wheel: {
                color: 0xffffff,
                specular: 0xFFFFFF,
                shininess: 90,
                reflectivity: 1,
                map: '/textures/cabinets/wheel.jpg'
            },
            Standard_1: {},
            Standard_3: {
                map: '/textures/Mah_Laq_Ebony_STL.jpg'
            },
            // Standard_10: {
            //    map: '/textures/red_wine_A.jpg'
            // }
        };

        var merge = function (materialName, baseConfig, colorSchemeName) {
            for (var i = 0; i < colorScheme.length; i++) {
                if (colorScheme[i].colorSchemeUniqueName === colorSchemeName) {
                    var schemeId = i;
                    break;
                }
            }
            if (typeof schemeId !== 'undefined') {
                for (var j = 0; j < colorScheme[schemeId].materials.length; j++) {
                    if (colorScheme[schemeId].materials[j].materialName === materialName) {
                        var colorSchemeConfig = colorScheme[schemeId].materials[j];
                        break;
                    }
                }
            }
            if (colorSchemeConfig) {
                var result = $.extend(true, {}, baseConfig);
                return $.extend(true, result, colorSchemeConfig);
            }
            return null;
        };

        var mergeWallsFloor = function (materialName, baseConfig, colorSchemeConfig) {
            var result = $.extend(true, {}, baseConfig);
            if (colorSchemeConfig) {
                result = $.extend(true, result, colorSchemeConfig);
            }
            return result;
        };

        return {

            colorSchemes: function () {
                return colorScheme;
            },

            getConfigForFloor: function (materialName, material, mesh) {
                var materialObject = materialStuffService.getFloorMaterialByName(material);
                var repeatX = (Math.abs(mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x)) / (materialObject.width * materialObject.scale) * 0.01,
                    repeatY = (Math.abs(mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y)) / (materialObject.height * materialObject.scale) * 0.01;
                var base = {
                    mapSettings: {
                        wrapS: THREE.RepeatWrapping,
                        wrapT: THREE.RepeatWrapping,
                        repeat: new THREE.Vector2(repeatX, repeatY)
                    }
                };
                var colorSchemeConfig = { map: materialObject.path };
                var merged = mergeWallsFloor(materialName, base, colorSchemeConfig);
                merged.name = materialName;
                return merged;
            },

            getConfigForWall: function (materialName, material, wallLength) {
                var materialObject = materialStuffService.getWallMaterialByName(material);
                var repeatX = (wallLength * 10) / (materialObject.width * materialObject.scale),
                    repeatY = (constants.wallHeight * 10) / (materialObject.height * materialObject.scale);
                var base = {
                    mapSettings: {
                        wrapS: THREE.RepeatWrapping,
                        wrapT: THREE.RepeatWrapping,
                        repeat: new THREE.Vector2(repeatX, repeatY)
                    }
                };
                var colorSchemeConfig = { map: materialObject.path };
                var merged = mergeWallsFloor(materialName, base, colorSchemeConfig);
                merged.name = materialName;
                return merged;
            },

            getConfigForObject: function (materialName, colorScheme, entity) {
                var result;
                var base = {
                    mapSettings: {
                        wrapS: THREE.RepeatWrapping,
                        wrapT: THREE.RepeatWrapping
                    }
                };
                result = merge(materialName, base, colorScheme);

                result && (result.name = materialName);

                return result;
            },

            getConfig: function (mesh, materialName, colorScheme) {

                if (objectCheckerSrvc.isFloor(mesh)) {
                    return this.getConfigForFloor(materialName, colorScheme, mesh);
                }
                else if (objectCheckerSrvc.isWall(mesh)) {
                    var wallLength = wall3DDataManager.getSize(mesh.name).length;
                    return this.getConfigForWall(materialName, colorScheme, wallLength)

                } else {
                    return this.getConfigForObject(materialName, colorScheme, mesh.userData.entity);
                }
            },

            definedMaterialNames: Object.getOwnPropertyNames(main)
        };
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('materialConfigManager', service);
})();
