(function () {

    var service = function ($q, object3DSelectionBox) {

        var cache = {
            //key : { model : ...,deferred:...  }
        };

        var loader = new THREE.BinaryLoader(true);

        var makeCopy = function (modelLocation, model) {
            if(cache[modelLocation] && cache[modelLocation].model){
                model = cache[modelLocation].model;
            }
            var clone = model.clone();
            clone.material = model.material.clone();

            object3DSelectionBox.addSelectionBoxToMesh(clone);

            return clone;
        };

        var onModelLoaded = function (modelPath, entity, geometry, materials) {

            var face = new THREE.MeshFaceMaterial(),
                copy,
                meshSize,
                center,
                scaleMatrix = new THREE.Matrix4(),
                offsetMatrix = new THREE.Matrix4();

            face.materials = materials;

            //some models parts came fully transparent
            materials.forEach(function (m) { m.opacity = 1 });

            geometry.computeBoundingBox();
            meshSize = geometry.boundingBox.size();
            center = geometry.boundingBox.center().negate();

            offsetMatrix.makeTranslation(center.x, center.y, center.z);
            scaleMatrix.makeScale(entity.length / meshSize.x, entity.height / meshSize.y, entity.width / meshSize.z);
            offsetMatrix.multiply(scaleMatrix);

            geometry.applyMatrix(offsetMatrix);

            var mesh = new THREE.Mesh(geometry, face);

            cache[modelPath].model = mesh;

            copy = makeCopy(modelPath, mesh);

            cache[modelPath].deferred.resolve(copy);
        };

        var buildBox = function (entity) {
            var geometry = new THREE.BoxBufferGeometry(entity.length, entity.height, entity.width);
            var box = new THREE.Mesh(geometry);
            box.material.transparent = true;
            box.material.opacity = 0;
            object3DSelectionBox.addSelectionBoxToMesh(box);
            return box;
        };

        var startLoad = function (deferred, modelLocation, entity) {
            if (modelLocation) {
                cache[modelLocation] = { deferred: deferred };
                loader.load(modelLocation, angular.bind(null, onModelLoaded, modelLocation, entity));
            }
            else {
                //opening case
                var box = buildBox(entity);
                deferred.resolve(box);
            }
        };

        return {
            load: function (meshData, nocache) {
                var model, deferred = $q.defer(),
                    entity = meshData.entity,
                    modelLocation = angular.isFunction(entity.getModel) ? entity.getModel(meshData) : entity.model,
                    cached = cache[modelLocation];
                if(nocache) {cached = false;}
                if (cached && cached.model) {
                    if (cached.deferred)
                        cached.deferred = null;
                    model = makeCopy(modelLocation, cached.model);
                    deferred.resolve(model);
                } else {
                    if (cached && cached.deferred) { //model is loading
                        return cached.deferred.promise.then(angular.bind(null, makeCopy, modelLocation));
                    } else {
                        startLoad(deferred, modelLocation, entity);
                    }
                }

                return deferred.promise;
            }
        }
    };

    angular.module('vigilantApp').service('modelLoader', ['$q', 'object3DSelectionBox', service]);
})();
