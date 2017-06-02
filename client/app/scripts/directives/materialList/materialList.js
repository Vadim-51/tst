(function () {

    var directive = function () {
        return {
            restrict: 'E',
            templateUrl: '/views/materialList.html',
            replace: true,
            scope: {
                mesh: '='
            },
            controller: controller
        }
    };

    var dependencies = ['$scope', 'stage', 'objectMaterial', 'constants',
        'roomStateManager', 'materialSelector', 'materialStuffService',
        'engine', 'materialConfigManager', 'objectCheckerSrvc'];

    var controller = function ($scope, stage, objectMaterial, constants, roomStateManager,
        materialSelector, materialStuffService, engine, materialConfigManager, objectCheckerSrvc) {

        $scope.applyToAll = true;
        $scope.isWallOrFloor = false;
        $scope.colorSchemes = [];
        $scope.colorSchemes = materialConfigManager.colorSchemes();

        console.log($scope.colorSchemes);

        //var select3DComponent = engine.get().findComponentByType(Select3D);

        var changeObjectMaterial = function (mesh, colorScheme, isModel) {
            objectMaterial.setMaterial(mesh, colorScheme)
                .then(function () {
                    if (colorScheme.length === 2) {
                        mesh.userData.entity.img = '../images/ProductImage/' + mesh.userData.entity.base_model_name
                            + colorScheme + '.png';
                    }
                    roomStateManager.saveObjectColorScheme({
                        objectId: mesh.uuid,
                        scheme: colorScheme
                    });
                    isModel && roomStateManager.setLastColorScheme(colorScheme);
                });
        };

        var changeAllObjectsMaterial = function (mesh, colorScheme) {

            if(objectCheckerSrvc.isFloor(mesh))
            {
                changeObjectMaterial(mesh, colorScheme);
                return;
            }

            var left_menu_alias = mesh.userData.entity.left_menu_alias;
            var children = stage.getChildren().filter(function (item) {
                return item.userData.entity && item.userData.entity.left_menu_alias === left_menu_alias;
            }),
                i = 0,
                entity,
                mesh,
                materials;

            for (; i < children.length; i++) {
                mesh = children[i];
                entity = mesh.userData.entity;
                if (objectCheckerSrvc.isWall(mesh)) {
                    changeObjectMaterial(mesh, colorScheme);
                }
                else if (mesh.userData.entity.isGeneric) {
                    materials = materialSelector.getMaterials(entity);
                    if (materials.indexOf(colorScheme) !== -1)
                        changeObjectMaterial(mesh, colorScheme);
                }
                else {
                    changeObjectMaterial(mesh, colorScheme, true);
                }
            }
        };

        $scope.showMaterialGroups = function () {
            $scope.groupMaterials = null;
        }

        $scope.onColorSchemeChange = function (colorScheme) {
            if ($scope.applyToAll) {
                changeAllObjectsMaterial($scope.mesh, colorScheme);
            } else {
                changeObjectMaterial($scope.mesh, colorScheme);
            }
            $scope.selectedColorScheme = colorScheme;
        };

        $scope.onMaterialGroupChange = function (materialCategory) {
            var oldCamera;
            var chdrn = stage.getChildren();
            for (var i = 0; i < chdrn.length; i++) {
                if (chdrn[i].type === "PerspectiveCamera") {
                    oldCamera = chdrn[i];
                    break;
                }
            }
            if (objectCheckerSrvc.isWall($scope.mesh)) {
                $scope.groupMaterials = materialStuffService.getWallMaterialsByGroup(materialCategory);
            }
            else {
                $scope.groupMaterials = materialStuffService.getFloorMaterialsByGroup(materialCategory);
            }
            $scope.materialCategory = materialCategory;
        }

        $scope.$watch('mesh', function (mesh) {
            //var mesh = selection[0];
            var entity = mesh.userData.entity;

            $scope.mesh = mesh;
            $scope.isWallOrFloor = objectCheckerSrvc.isWall(mesh) || objectCheckerSrvc.isFloor(mesh);
            $scope.groupMaterials = null;

            if (objectCheckerSrvc.isWall(mesh)) {
                $scope.wallsSelected = true; // REFACTOR
                $scope.floorSelected = false;
                $scope.colorScheme = materialStuffService.wallGroupNames;
            }
            else if (objectCheckerSrvc.isFloor(mesh)) {
                $scope.wallsSelected = false;
                $scope.floorSelected = true;
                $scope.colorScheme = materialStuffService.floorGroupNames;
            }
            else {
                $scope.colorScheme = entity.color_scheme;
            }

            var objectColorSchemeRecord = roomStateManager.getColorSchemeByObjectId($scope.mesh.uuid);
            if (objectColorSchemeRecord)
                $scope.selectedColorScheme = objectColorSchemeRecord.scheme;

            $scope.$applyAsync();
        });

        //var unsubscribe = select3DComponent.on('select', function (selection) {
        //    console.log($scope.colorSchemes);
        //    if (selection.length > 0) {
        //        var mesh = selection[0];
        //        var entity = mesh.userData.entity;

        //        $scope.mesh = mesh;
        //        $scope.isWallOrFloor = objectCheckerSrvc.isWall(mesh) || objectCheckerSrvc.isFloor(mesh);
        //        $scope.groupMaterials = null;

        //        if (objectCheckerSrvc.isWall(mesh)) {
        //            $scope.wallsSelected = true; // REFACTOR
        //            $scope.floorSelected = false;
        //            $scope.colorScheme = materialStuffService.wallGroupNames;
        //        }
        //        else if (objectCheckerSrvc.isFloor(mesh)) {
        //            $scope.wallsSelected = false;
        //            $scope.floorSelected = true;
        //            $scope.colorScheme = materialStuffService.floorGroupNames;
        //        }
        //        else {
        //            $scope.colorScheme = entity.color_scheme;
        //        }

        //        var objectColorSchemeRecord = roomStateManager.getColorSchemeByObjectId($scope.mesh.uuid);
        //        if (objectColorSchemeRecord)
        //            $scope.selectedColorScheme = objectColorSchemeRecord.scheme;

        //        $scope.$applyAsync();
        //    }
        //});

        $scope.$on('$destroy', function () {
            // unsubscribe();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('materialList', directive);
})();