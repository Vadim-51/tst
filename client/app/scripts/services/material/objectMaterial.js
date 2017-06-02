; (function () {

    var dependencies = ['materialBuilder', 'resourceLoader', '$q', 'materialConfigManager',
        'constants', 'objectCheckerSrvc'];

    var service = function (materialBuilder, resourceLoader, $q, materialConfigManager, constants, objectCheckerSrvc) {

        var cachedMaterials = {
            //hash:material
        };

        var materialMaps = [
            'map',
            'normalMap',
            'displacementMap',
            'envMap',
            'specularMap',
            'bumpMap',
            'alphaMap'
        ];

        var getMapsUrls = function (config) {
            var result = [],
                i = 0,
                mapName,
                url;
            for (; i < materialMaps.length; i++) {
                mapName = materialMaps[i];
                url = config[mapName];
                result.push(url || null);
            }
            return result;
        };

        var setMapsToConfig = function (maps, config) {
            for (var i = 0; i < materialMaps.length; i++) {
                var mapName = materialMaps[i];
                config[mapName] = maps[i];
            }
        };

        var applyForWall = function (newMaterial, mesh) {
            var inner = mesh.material.materials[4];
            var outer = mesh.material.materials[5];
            var cutPlanes = inner.cutPlanes;
            inner.map = newMaterial.map;
            outer.map = newMaterial.map;
            inner.needsUpdate = true;
            outer.needsUpdate = true;
            inner.map.needsUpdate = true;
            outer.map.needsUpdate = true;
            newMaterial.map = null;
        };

        var imagesLoaded = function (materialConfig, counter, deferred, mesh, materialIndex, loadedImages) {

            var configCopy = $.extend(true, {}, materialConfig);
            setMapsToConfig(loadedImages, materialConfig);
            var newMaterial = materialBuilder.create(materialConfig);

            if (objectCheckerSrvc.isWall(mesh)) {
                applyForWall(newMaterial, mesh);
            } else {
                if (mesh.material instanceof THREE.MeshFaceMaterial) {
                    mesh.material.materials[materialIndex] = newMaterial;
                }
                else {
                    mesh.material = newMaterial;
                    if (objectCheckerSrvc.isFloor(mesh))
                        mesh.material.side = THREE.DoubleSide;
                }
            }

            var hash = JSON.stringify(configCopy);
            cachedMaterials[hash] = newMaterial.clone();

            counter.value--;

            if (counter.value <= 0) {
                deferred.resolve();
            }

        };

        var getMaterials = function (mesh) {

            var result = [];

            if (objectCheckerSrvc.isWall(mesh)) {
                return [
                    {
                        name: 'Wall',
                        index: 0
                    }
                ];
            }

            if (mesh.material instanceof THREE.MeshFaceMaterial) {
                var objectMaterials = mesh.material.materials,
                    materialIndex = 0,
                    materialName,
                    definedMaterialNames = materialConfigManager.definedMaterialNames;

                for (; materialIndex < objectMaterials.length; materialIndex++) {
                    materialName = objectMaterials[materialIndex].name;
                    result.push({
                        name: materialName,
                        index: materialIndex
                    })
                }
            }
            else {
                result.push({
                    name: mesh.material.name,
                    index: materialIndex
                });
            }

            return result;
        };

        return {
            setMaterial: function (mesh, colorScheme) {

                var objectMaterials = mesh.material.materials,
                    i = 0,
                    materialIndex,
                    material,
                    deferred = $q.defer(),
                    materialConfig,
                    materials = getMaterials(mesh),
                    counter = { value: materials.length },
                    hash;

                for (; i < materials.length; i++) {
                    material = materials[i];

                    materialConfig = materialConfigManager.getConfig(mesh, material.name, colorScheme);

                    hash = JSON.stringify(materialConfig);

                    if (cachedMaterials[hash]) {

                        if (mesh.material instanceof THREE.MeshFaceMaterial)
                            objectMaterials[material.index] = cachedMaterials[hash].clone();
                        else mesh.material = cachedMaterials[hash].clone();

                        counter.value--;
                    }
                    else if (materialConfig) {
                        var maps = getMapsUrls(materialConfig);
                        resourceLoader.load(maps)
                            .then(imagesLoaded.bind(null, materialConfig, counter, deferred, mesh, material.index))
                            .catch(function () {
                                console.error('resource load fail');
                                deferred.reject();
                            })
                    } else {
                        counter.value--;
                    }

                    if (counter.value <= 0)
                        deferred.resolve();
                }

                return deferred.promise;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objectMaterial', service);
})();
