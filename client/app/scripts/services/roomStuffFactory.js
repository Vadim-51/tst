; (function () {

    var windowSprite = THREE.ImageUtils.loadTexture('/images/window2DSprite.png');
    var doorLeftSprite = THREE.ImageUtils.loadTexture('/images/doorLeftSprite.png');
    var doorRightSprite = THREE.ImageUtils.loadTexture('/images/doorRightSprite.png');
    var doorDouble = THREE.ImageUtils.loadTexture('/images/doorDoubleSprite.png');

    var dependencies = ['geometryHelper', 'constants', 'resourceLoader'];

    var service = function (geometryHelper, constants, resourceLoader) {

        var rotateMinus90DegMatx = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90));

        var setSprite = function (mesh, sprite) {

            if (!sprite)
                return;

            if (sprite instanceof THREE.Texture) {
                sprite.anisotropy = constants.maxAnisotropy;
                mesh.material.map = sprite;
                sprite.needsUpdate = true;
                mesh.material.needsUpdate = true;
                return;
            }

            resourceLoader.load(sprite).then(function (img) {
                var texture = new THREE.Texture(img[0]);
                texture.anisotropy = constants.maxAnisotropy;
                texture.needsUpdate = true;
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
            });
        };

        var buildBorder = function (width, height) {
            var geometry = new THREE.EdgesGeometry(new THREE.PlaneBufferGeometry(width, height)),
                material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, depthTest: false }),
                border = new THREE.LineSegments(geometry, material);

            border.position.y = 1;
            border.name = 'border';
            border.visible = false;
            border.rotation.x = Math.PI / 2;
            return border;
        };

        var buildDoor = function (entity, flip) {

            var length = entity.length,
                width = entity.width,
                halfOfLength = length / 2,
                halfOfWidth = width / 2,
                doorHole,
                border = buildBorder(length, width);

            if (entity.hasDoors === false) {

                doorHole = new THREE.Mesh(new THREE.PlaneBufferGeometry(length, width),
                    new THREE.MeshBasicMaterial({
                        depthTest: false
                    }));

                setSprite(doorHole, entity.sprite);

            } else {

                doorHole = new THREE.Mesh(new THREE.PlaneBufferGeometry(length, width),
                    new THREE.MeshBasicMaterial({
                        transparent: true,
                        opacity: 0
                    }));

                var mainGeometry = new THREE.PlaneBufferGeometry(length, entity.isDouble ? halfOfLength : length),
                    offset = entity.isDouble ? -halfOfLength / 2 + halfOfWidth : -halfOfLength + halfOfWidth,
                    sprite = entity.sprite || (entity.isDouble ? doorDouble : (flip.x ? doorLeftSprite : doorRightSprite)) || null,
                    mainMesh = new THREE.Mesh(mainGeometry,
                        new THREE.MeshBasicMaterial({
                            transparent: true,
                            depthTest: false,
                            side: THREE.DoubleSide
                        }));

                setSprite(mainMesh, sprite);

                mainMesh.position.set(0, flip.y ? -offset : offset, 0);
                mainMesh.rotation.x = flip.y ? Math.PI : 0;
                doorHole.add(mainMesh);

                //used to create wider bounding box for wall intersection
                doorHole.userData.boundingBox = new THREE.Box3().setFromCenterAndSize(
                    new THREE.Vector3(0, flip.y ? -offset : offset, 0),
                    new THREE.Vector3(length, entity.isDouble ? halfOfLength : length, entity.height));
            }

            doorHole.add(border);
            doorHole.userData.flip = flip;
            return doorHole;
        };

        var create2DRectangle = function (entity, sprite) {

            var width = entity.length,
                height = entity.width,
                border = buildBorder(width, height),
                geometry = new THREE.PlaneBufferGeometry(width, height).applyMatrix(rotateMinus90DegMatx),
                main = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({
                     color: 0xffffff,
                     depthTest: false,
                     transparent: true,
                 }));

            border.renderOrder = 1;
            main.add(border);

            setSprite(main, sprite);

            return main;
        };

        return {
            buildRoomItem: function (entity, extra) {

                var object,
                    renderOrder = 1;

                if (entity instanceof constants.RoomObject.Window) {
                    object = create2DRectangle(entity, windowSprite);
                    //floorOffset = entity.defaultHeightFromFloor || constants.windowFloorOffset;
                }
                else if (entity instanceof constants.RoomObject.Door) {
                    if(entity.isOpening){
                        object = create2DRectangle(entity);
                    }
                    else{
                        var doorFlip = extra || { x: false, y: false };
                        object = buildDoor(entity, doorFlip);
                    }
                }
                else if (entity instanceof constants.RoomObject.Cabinet) {
                    object = create2DRectangle(entity, entity.sprite);
                }
                else if (entity instanceof constants.RoomObject.Table) {
                    object = create2DRectangle(entity, entity.sprite);
                }
                else return null;

                //var r = new THREE.Object3D();
               // r.userData.entity = entity;
               
               
                //for (var k in object.userData) {
                //    r.userData[k] = object.userData[k];
                //    //delete object.userData[k];
                //}

                //r.name = 'roomObject';

                object.name = '2D';
                object.userData.entity = entity;
               // r.add(object);

                //if (!floorOffset) {
                //    r.position.y = entity.height / 2;
                //}
                //else {
                //    r.position.y = floorOffset + entity.height / 2;
                //}


                return object;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('roomStuffFactory', service);

})();
