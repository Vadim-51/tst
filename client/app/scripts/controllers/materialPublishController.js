'use strict';

angular.module('vigilantApp').controller('MaterialPublCtrl', ['$scope', 'ResourceService', 'toastr', 'Upload', 'materialStuffService',
    'AuthenticationService', '$rootScope',
    function ($scope, ResourceService, toastr, Upload, materialStuffService, AuthenticationService, $rootScope) {

        var userName = AuthenticationService.userLogged();

        if (userName) {
            console.log("email");
            console.log(AuthenticationService.mail());
            if (AuthenticationService.publisher()) {
                $rootScope.templateMaster = true;
            }
            else {
                $rootScope.templateMaster = false
            }
            $rootScope.userLogged = true;
            $rootScope.labelUserLogged = userName.firstName + " " + userName.lastName;
        }

        $scope.filesForUpload = [];
        $scope.materials = [];
        $scope.subcategory;
        $scope.wallCategories = materialStuffService.wallGroupNames;
        $scope.floorCategories = materialStuffService.floorGroupNames;
        $scope.choosenCategory;
        $scope.formVisible = true;
        $scope.caption = 'Publish material';
        $scope.currentMaterial = {
            material: '',
            materialGroup: '',
            name: '',
            scale: '',
            width: '',
            height: '',
            path: ''
        };

        $scope.setCategory = function (val) {
            switch ($scope.currentMaterial.material) {
                case 'wall': {
                    $scope.choosenCategory = $scope.wallCategories;
                }
                    break;
                case 'floor': {
                    $scope.choosenCategory = $scope.floorCategories;
                }
                    break;
            }
        }

        $scope.clearForm = function () {
            $scope.filesForUpload = [];
            $scope.setFormVisible(true);

            $scope.currentMaterial = {
                material: '',
                materialGroup: '',
                name: '',
                scale: '',
                width: '',
                height: '',
                path: ''
            };

            $scope.caption = 'Publish material';
            $scope.formVisible = true;
        }

        $scope.setFormVisible = function (val) {
            $scope.formVisible = val;
        }

        $scope.editMaterial = function (material) {
            $scope.setFormVisible(true);
            $scope.currentMaterial = material;
            $scope.caption = 'Update material';
        }

        $scope.addFilesForUpload = function (file, material, materialGroup, id) {
            var data = {
                file: file,
                material: material,
                materialGroup: materialGroup,
                id: id,
            }
            $scope.filesForUpload.push(data);
        }

        var uploadFiles = function (data) {
            if ($scope.filesForUpload && $scope.filesForUpload.length) {

                angular.forEach($scope.filesForUpload, function (fileSet) {

                    Upload.upload({
                        url: 'http://95.85.31.212:7000materials/upload',
                        data: {
                            file: fileSet.file,
                            material: fileSet.material,
                            materialGroup: fileSet.materialGroup,
                            id: fileSet.id || data._id
                        }
                    }).then(function (response) {
                        $scope.filesForUpload = [];
                    });
                });
            }
        };

        $scope.deleteMaterial = function (material) {
            ResourceService.deleteMaterial(material._id).then(function (data) {
                getAllMaterials();
            })
        }

        $scope.publishMaterial = function () {
            if ($scope.caption == 'Publish material') {
                ResourceService.saveMaterial($scope.currentMaterial).then(function (data) {
                    toastr.success("Material published");
                    uploadFiles(data);
                    getAllMaterials();

                }, function (data) {
                    toastr.error(data.message);
                });
            }
            else {
                ResourceService.updateMaterial($scope.currentMaterial._id, $scope.currentMaterial).then(function (data) {
                    toastr.success("Material updated");
                    getAllMaterials();

                }, function (data) {
                    toastr.error(data.message);
                });
                uploadFiles();
                $scope.caption = 'Publish material';
            }
        }

        var getAllMaterials = function () {
            ResourceService.getAllMaterials().then(function (data) {
                $scope.materials = data;
            })
        }

        getAllMaterials();

    }]);
