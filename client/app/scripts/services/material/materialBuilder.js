(function () {

    var service = function () {

        var materialMaps = [
             'map',
            'normalMap',
            'displacementMap',
            'envMap',
            'specularMap',
            'bumpMap',
            'alphaMap'
        ];

        var setColor = function (material, propertyName, value) {
            if (value !== undefined && value !== "")
                material[propertyName].setHex(value);
        };

        var setValue = function (material, propertyName, value) {
            if (value !== undefined)
                material[propertyName] = value;
        };

        var applyMapSettings = function (texture,settings) {
            if (settings) {
                
                if (settings.repeat) {
                    texture.repeat = settings.repeat;
                }

                if (settings.wrapS) {
                    texture.wrapS = settings.wrapS;
                }

                if (settings.wrapT) {
                    texture.wrapT = settings.wrapT;
                }

            }
        };

        var setMaps = function (material, config) {
            var i = 0,
                mapName,
                image,
                mapping;
            for (; i < materialMaps.length; i++) {
                mapName = materialMaps[i];
                image = config[mapName];
                if (image) {
                    mapping = mapName === 'envMap' ? THREE.SphericalReflectionMapping : THREE.UVMapping;
                    material[mapName] = new THREE.Texture(image, mapping);
                    applyMapSettings(material[mapName], config[mapName + 'Settings']);
                    material[mapName].needsUpdate = true;
                }                 
            }
        };

        return {
            create: function (materialConfig) {
                var material = new THREE.MeshPhongMaterial();

                setColor(material, 'color', materialConfig.color);
                setColor(material, 'specular', materialConfig.specular);
                setValue(material, 'shininess', materialConfig.shininess);
                setValue(material, 'reflectivity', materialConfig.reflectivity);
                setValue(material, 'normalScale', materialConfig.normalScale);
                setValue(material, 'name', materialConfig.name || "");
                setValue(material, 'side', materialConfig.side);
                setMaps(material, materialConfig);

                return material;
            }
        }
    };

    angular.module('vigilantApp').service('materialBuilder', service);
})();
