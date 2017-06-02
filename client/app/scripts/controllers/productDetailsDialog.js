'use strict';

// refactor
angular.module('vigilantApp').controller('ProductDetailsController', ['roomStuff', 'roomStateManager',
    'constants', 'Scene2d', 'roomStuffFactory', '$scope', 'ngDialog', 'scene3D', 'sceneSyncSrvc',
    'wallCutHelper', 'engine2DSrvc', 'modelLoader', 'objectMaterial', 'scene2DSyncSrvc', 'ScaleService', 'collisionSrvc',
    function (roomStuff, roomStateManager, constants, Scene2d, roomStuffFactory, $scope, ngDialog,
        scene3D, sceneSyncSrvc, wallCutHelper, engine2DSrvc, modelLoader, objectMaterial, scene2DSyncSrvc,
        ScaleService, collisionSrvc) {

        if ($scope.ngDialogData.sender == '2d' || $scope.ngDialogData.sender == '3d') {
            $scope.showButtons = true;
        }
        else {
            $scope.showButtons = false;
        }
        if (!$scope.ngDialogData.item.isGeneric) {
            $scope.isCEG = true;
        }
        else {
            $scope.isCEG = false;
            $scope.isSelected = 'Dimensions';
        }

        $scope.swapGroupProducts = [];
        $scope.product = $scope.ngDialogData.item;
        $scope.mesh = $scope.ngDialogData.mesh;

        $scope.convertToInch = function (value) {
            return Math.round(value / 2.54);
        }

        $scope.changeColor = function (color) {
            if ($scope.isCEG) {
                $scope.product.img = '../images/ProductImage/' + $scope.product.base_model_name + color + '.png'
                if ($scope.product.left_menu_alias === 'Wall Panels') {
                    $scope.product.productCode = $scope.product.base_model_name;
                }
                else {
                    $scope.product.productCode = $scope.product.base_model_name + color;
                }
            } else {
                $scope.product.productImage = '/images/generic/ProductImage/' + $scope.product.left_menu_alias + '/' +
                    $scope.product.base_model_name + color + '.png';
            }
            $scope.oldColor = $scope.isColorSelected;
            $scope.isColorSelected = color;
        }


        var selection2D;
        var constantsService = constants;
        selection2D = engine2DSrvc.get().findComponentByType(Selection2D)
        $scope.products;
        $scope.swapGroupProducts = [];
        if ($scope.isCEG) {
            var entityId = $scope.mesh ? $scope.mesh.userData.entity.id : $scope.product.id;
            var cs = $scope.mesh ?
                roomStateManager.getColorSchemeByObjectId($scope.mesh.uuid) :
                null;
            $scope.oldColor = $scope.isColorSelected = cs ? cs.scheme :
                roomStateManager.getColorSchemeByEntityId(entityId);
            $scope.changeColor($scope.isColorSelected);
            if (!$scope.isColorSelected) {
                $scope.isColorSelected = $scope.product.color_scheme[0];
            }
            if ($scope.product.left_menu_alias === 'Wall Panels') {
                $scope.product.productCode = $scope.product.base_model_name;
            }
            else {
                $scope.product.productCode = $scope.product.base_model_name + $scope.isColorSelected;
            }

            $scope.isSelected = 'Description';
        } else {
            $scope.dimensions = {};
            $scope.dimensions.width = $scope.convertToInch($scope.mesh ?
                $scope.mesh.userData.width || $scope.product.width : $scope.product.width);
            $scope.dimensions.height = $scope.convertToInch($scope.mesh ?
                $scope.mesh.userData.height || $scope.product.height : $scope.product.height);
            $scope.dimensions.length = $scope.convertToInch($scope.mesh ?
                $scope.mesh.userData.length || $scope.product.length : $scope.product.length);
        }
        $scope.valleyCraftItems = [
            { text: 'Suites', items: roomStuff.suites },
            { text: 'High Capacity', items: roomStuff.highCapacityCabinets },
            { text: 'Tool Storage', items: roomStuff.toolStorageCabinets },
            { text: 'Wall Cabinets', items: roomStuff.wallCabinets },
            { text: 'Work Tables', items: roomStuff.tables },
            { text: 'Wall Panels', items: roomStuff.wallPanels },
            { text: 'Accessories', items: roomStuff.accessories },
            { text: 'Windows', items: roomStuff.windows },
            { text: 'Stairs', items: roomStuff.stairs },
            { text: 'Doors - Entry', items: roomStuff.doors },
            { text: 'Vehicles', items: roomStuff.vehicles },
            { text: 'Misc', items: roomStuff.misc },
            { text: 'Doors - Garage', items: roomStuff.garageDoors }
        ];

        angular.forEach($scope.valleyCraftItems, function (menu) {
            if ($scope.products === undefined) {
                if (menu.text === $scope.product.left_menu_alias) {
                    $scope.products = menu.items;
                }
            }
        });
        angular.forEach($scope.products, function (prod) {
            if (!prod.swap_group_name) return;
            if (prod.swap_group_name === $scope.product.swap_group_name) {
                $scope.swapGroupProducts.push(prod);
            }
        });

        //end if($scope.isCEG)

        $scope.selectTab = function (tabName) {
            $scope.isSelected = tabName;
        }

        $scope.isActiveColor = function (color) {
            if (!$scope.isColorSelected) {
                if ($scope.mesh) {
                    var csObj = roomStateManager.getColorSchemeByObjectId($scope.mesh.uuid);
                    $scope.isColorSelected = csObj ? csObj.scheme : null;
                } else {
                    $scope.isColorSelected = roomStateManager.getColorSchemeByEntityId($scope.product.id);
                }
                $scope.oldColor = $scope.isColorSelected;
            }
            if (!$scope.isColorSelected) {
                $scope.isColorSelected = $scope.product.color_scheme[0];
                $scope.oldColor = $scope.isColorSelected;
            }
            return $scope.isColorSelected == color;
        }

        $scope.isActiveSwapProduct = function (prod) {
            return $scope.product == prod;
        }

        $scope.isActiveTab = function (tabName) {
            return $scope.isSelected == tabName;
        }

        $scope.changeSwapProduct = function (swapProduct) {
            $scope.product = swapProduct;
            if ($scope.product.left_menu_alias === 'Wall Panels') {
                $scope.product.productCode = $scope.product.base_model_name;
            }
            else if ($scope.isCEG) {
                $scope.product.productCode = $scope.product.base_model_name + $scope.product.color_scheme[0];
                $scope.product.img = '../images/ProductImage/' + $scope.product.base_model_name + $scope.isColorSelected + '.png';
            } else {
                $scope.dimensions.width = $scope.convertToInch($scope.product.width);
                $scope.dimensions.height = $scope.convertToInch($scope.product.height);
                $scope.dimensions.length = $scope.convertToInch($scope.product.length);
            }
        }

        $scope.updateCanvas = function () {

            var isMode3D = $scope.ngDialogData.sender === '3d',
                oldModel2D = isMode3D ? $scope.ngDialogData.item2d : $scope.ngDialogData.mesh,
                colorScheme = $scope.isColorSelected,
                entity = $scope.product,
                newModel2D, uuid;
            if (!$scope.isCEG && !checkDimensions()) {
                ngDialog.open({
                    plain: true,
                    template: "Incorrect dimensions for the item. Can't scale item!"
                });
            } else {
                if (oldModel2D.userData.entity !== entity || colorScheme !== $scope.oldColor) {
                    newModel2D = replaceModel2D(oldModel2D, entity);
                    uuid = newModel2D.uuid;

                    if (isMode3D) {
                        var meshData = {
                            entity: entity
                        };
                        var old3DModel = $scope.mesh;
                        replaceModel3D(old3DModel, meshData, colorScheme, uuid);
                    }

                    roomStateManager.saveObjectColorScheme({
                        objectId: uuid,
                        entityId: entity.id,
                        scheme: colorScheme,
                        updateIfExist: false
                    });
                } else {
                    if (!$scope.isCEG && checkDimensionsChange()) {
                        if (!isMode3D) {
                            scale2DObject(oldModel2D);
                        } else {
                            scale3DObject($scope.mesh);
                        }
                    }
                }
                ngDialog.close();
            }
        }

        // REFACTOR
        $scope.deleteModel = function () {
            if ($scope.ngDialogData.sender == '2d') {
                ngDialog.openConfirm({
                    disableAnimation: true,
                    template: '/views/help/productConfirmDelete.html'
                }).then(function (confirm) {
                    $scope.del2dObj($scope.mesh);
                    ngDialog.close();
                }, function (reject) {

                });
            }
            else if ($scope.ngDialogData.sender == '3d') {
                ngDialog.openConfirm({
                    disableAnimation: true,
                    template: '/views/help/productConfirmDelete.html'
                }).then(function (confirm) {
                    del3dObj();
                    ngDialog.close();
                }, function (reject) {

                });
            }
        }

        $scope.del2dObj = function (model) {
            if (model.parent) {
                model.parent.remove(model);
            } else {
                Scene2d.remove(model);
            }
            roomStateManager.removeObjectColorScheme(model);
            selection2D.setSelected(null);
            Scene2d.render();
        };

        function updateWall(wall) {
            var objs = scene3D.getChildren();
            var stairs = [];
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].userData.type === 0) {
                    stairs.push(objs[i]);
                }
            }
            objs = scene3D.getWallChildren(wall.name);
            var originalWall = scene3D.getNonCuttedWallByName(wall.name);
            var cutted = wallCutHelper.cutHolesInWall(originalWall, scene3D.getWallChildren(wall.name), stairs);

            cutted.material = wall.material.clone();
            cutted.add.apply(cutted, wall.children);
            wall.remove.apply(wall, wall.children);

            scene3D.remove(wall);
            scene3D.add(cutted);

            return cutted;
        }

        var del3dObj = function () {
            sceneSyncSrvc.deleteObject($scope.mesh);
        };

        var replaceModel3D = function (old3DModel, meshData, colorScheme, uuid) {
            modelLoader.load(meshData, true).then(function (newModel3D) {

                newModel3D.uuid = uuid;
                // newModel3D.userData.entity = meshData.entity;

                newModel3D.userData.entity = $scope.product;

                newModel3D.position.copy(old3DModel.position);
                if (!newModel3D.userData.entity.wallInteraction) {
                    newModel3D.position.y = newModel3D.userData.entity.height / 2;
                }
                newModel3D.rotation.copy(old3DModel.rotation);

                if (old3DModel.userData.wall) {
                    var wall = scene3D.getObject(old3DModel.userData.wall);
                    scene3D.remove(old3DModel);
                    if (old3DModel.userData.wall) newModel3D.userData.wall = old3DModel.userData.wall;
                    scene3D.add(newModel3D);
                    if (wall) wall = updateWall(wall);
                } else {
                    scene3D.add(newModel3D);
                    scene3D.remove(old3DModel);
                }

                objectMaterial.setMaterial(newModel3D, colorScheme);
                if (!$scope.isCEG && checkDimensionsChange()) {
                    scale3DObject(newModel3D);
                }
            });
        };


        function scale2DObject(model) {
            ScaleService.setDimensions(model.userData, $scope.dimensions, false);
            ScaleService.scale(model, false);
            Scene2d.render();
        }

        function scale3DObject(model) {
            ScaleService.setDimensions(model.userData, $scope.dimensions, false);
            ScaleService.scale(model, true);
            if (model.userData.wall) {
                var floor = scene3D.getFloor(),
                    floorPlane = new THREE.Plane(),
                    roofPlane = new THREE.Plane(floor.getWorldDirection(), -1 * constants.wallHeight),
                    bBox = new THREE.Box3();

                floorPlane.setFromNormalAndCoplanarPoint(floor.getWorldDirection(), floor.position);

                bBox.setFromObject(model);

                var thisWall = scene3D.getObject(model.userData.wall);
                var staticObjects = scene3D.getChildren().filter(function (obj) {
                    return obj !== model &&
                        obj.visible &&
                        obj instanceof THREE.Mesh &&
                        obj !== thisWall;
                });
                if (collisionSrvc.isCollide(model, staticObjects) || bBox.intersectsPlane(floorPlane) || bBox.intersectsPlane(roofPlane)) {
                    ngDialog.openConfirm({
                        disableAnimation: true,
                        template: '/views/help/cantBeScaledInfo.html'
                    }).then(function (confirm) {
                        ngDialog.close();
                    }, function (reject) {

                    });
                    var oldDimensions = {
                        width: model.userData.entity.width,
                        height: model.userData.entity.height,
                        length: model.userData.entity.length
                    }
                    ScaleService.setDimensions(model.userData, oldDimensions, true);
                    ScaleService.scale(model, true);
                    // model.scale.set(1, 1, 1);
                }
                else {
                    var model2D = Scene2d.getObjectByUUID(model.uuid);
                    scale2DObject(model2D);
                }
                updateWall(scene3D.getObject(model.userData.wall));

            }
            else {
                var staticObjects = scene3D.getChildren().filter(function (obj) {
                    return obj.visible &&
                        obj instanceof THREE.Mesh &&
                        obj !== model;
                })
                if (collisionSrvc.isCollide(model, staticObjects)) {
                    ngDialog.openConfirm({
                        disableAnimation: true,
                        template: '/views/help/cantBeScaledInfo.html'
                    }).then(function (confirm) {
                        ngDialog.close();
                    }, function (reject) {

                    });
                    var oldDimensions = {
                        width: model.userData.entity.width,
                        height: model.userData.entity.height,
                        length: model.userData.entity.length
                    }
                    ScaleService.setDimensions(model.userData, oldDimensions, true);
                    ScaleService.scale(model, true);
                }
                else {
                    var model2D = Scene2d.getObjectByUUID(model.uuid);
                    scale2DObject(model2D);
                }
            }
        }

        function checkDimensionsChange() {
            return ($scope.dimensions.width !== $scope.convertToInch($scope.product.width))
                || ($scope.dimensions.height !== $scope.convertToInch($scope.product.height))
                || ($scope.dimensions.length !== $scope.convertToInch($scope.product.length));
        }

        function checkDimensions() {
            return $scope.dimensions.length && $scope.dimensions.height && $scope.dimensions.width;
        }

        var replaceModel2D = function (oldModel2D, newEntity) {
            var newModel2D = roomStuffFactory.buildRoomItem(newEntity);
            if (oldModel2D.parent) {
                oldModel2D.parent.add(newModel2D);
            }
            newModel2D.position.copy(oldModel2D.position);
            if (!newModel2D.userData.entity.wallInteraction) {
                newModel2D.position.z = newModel2D.userData.entity.height / 2;
            }
            newModel2D.rotation.copy(oldModel2D.rotation);
            $scope.del2dObj(oldModel2D);
            if (newModel2D.parent) {
                newModel2D.userData.wall = newModel2D.parent.name;
            } else {
                Scene2d.addModel(newModel2D);
            }
            if (!$scope.isCEG && checkDimensionsChange()) {
                scale2DObject(newModel2D);
            }
            return newModel2D;
        };

    }])