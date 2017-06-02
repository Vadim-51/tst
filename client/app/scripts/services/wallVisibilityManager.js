(function () {

    var changeMaterialOpacity = function (material, isVisible) {
        var materials = material.materials;
        for (var i = 0; i < materials.length; i++) {
            var mat = materials[i];
            mat.transparent = !isVisible;
            mat.opacity = isVisible ? 1 : 0.1;
            mat.needsUpdate = true;
        }
    };

    var getWallChildren = function (allWallsChilds,wallName) {   
        var result = [];
        for (var i = 0; i < allWallsChilds.length; i++) {
            var ch = allWallsChilds[i];
            if (ch.userData.wall === wallName)
                result.push(ch);
        }
        return result;
    };

    var changeWallOpacity = function (wall, isVisible, recursive, children) {

        if (!wall)
            return;

        var i,
            j,
            children = getWallChildren(children, wall.name),
            material,
            materials,
            child;

        changeMaterialOpacity(wall.material, isVisible);

        if (recursive) {
            for (i = 0; i < children.length; i++) {
                child = children[i];
                if (child.material instanceof THREE.MeshFaceMaterial) {
                    materials = child.material.materials;
                    for (j = 0; j < materials.length; j++) {
                        material = materials[j];
                        if (material.visible)
                            changeMaterialOpacity(material, isVisible);
                    }
                }
            }
        }
    };

    var dependencies = ['obbBuilder'];

    var service = function (obbBuilder) {

        var box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

        return {
            reset: function (walls, children) {
                if (!walls)
                    return;
                for (var i = 0; i < walls.length; i++)
                    changeWallOpacity(walls[i], true, true, children);
            },
            hideLookBlockWalls: function (walls, cameraLookDirection, children) {

                var i = 0,
                    wall,
                    direction,
                    result = [],
                    dotProduct,
                    isVisible;

                for (; i < walls.length; i++) {
                    wall = walls[i];
                    direction = wall.getWorldDirection();
                    dotProduct = direction.dot(cameraLookDirection);
                    isVisible = dotProduct < 0.3;
                    changeWallOpacity(wall, isVisible, true, children);
                }
            },
            hideWallModeLookBlockWalls: function (viewedWall, walls, data) {

                box.scale.copy(data.size);
                box.position.copy(data.position);

                var cameraBoindingBox = obbBuilder.create().build(box),
                    i = 0,
                    wall,
                    wallBoundingBox;

                for (; i < walls.length; i++) {
                    wall = walls[i];
                    if (wall !== viewedWall) {
                        wallBoundingBox = obbBuilder.create().build(wall);
                        if (cameraBoindingBox.isIntersectionOBB(wallBoundingBox))
                            wall.material.visible = false;                       
                    }
                }
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallVisibilityManager', service);

})();