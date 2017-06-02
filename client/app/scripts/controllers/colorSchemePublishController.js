'use strict';

angular.module('vigilantApp').controller('ColorSchemePublCtrl', ['$scope', 'ResourceService', 'toastr', 'Upload',
    'AuthenticationService', '$rootScope',
    function ($scope, ResourceService, toastr, Upload, AuthenticationService, $rootScope) {

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
        $scope.colorSchemes = [];
        $scope.formVisible = true;
        $scope.caption = 'Publish color scheme';
        $scope.materialCaption = 'Add material';
        $scope.newMaterial = {
            materialName: '',
            color: '',
            map: '',
            // mapSettings: {}
        };
        $scope.currentColorScheme = {
            colorSchemeName: '',
            stain: '',
            laquer: false,
            materials: [],
            productDetailsImage: '',
            colorSchemeImage: '',
        };

        $scope.clearForm = function () {
            $scope.filesForUpload = [];
            $scope.setFormVisible(true);

            $scope.currentColorScheme = {
                colorSchemeName: '',
                stain: '',
                laquer: false,
                materials: [],
                productDetailsImage: '',
                colorSchemeImage: '',
            };

            $scope.caption = 'Publish color scheme';
            $scope.formVisible = true;
        }

        $scope.setFormVisible = function (val) {
            $scope.formVisible = val;
        }

        $scope.editColorScheme = function (colorScheme) {
            $scope.setFormVisible(true);
            $scope.currentColorScheme = colorScheme;
            $scope.caption = 'Update color scheme';
        }

        $scope.addMaterial = function (id) {
            if (!$scope.currentColorScheme.materials)
                $scope.currentColorScheme.materials = [];
            $scope.newMaterial.color = $scope.newMaterial.color.replace('#', '0x');
            if ($scope.materialCaption === 'Update material') {
                $scope.currentColorScheme.materials[id] = $scope.newMaterial;
            }
            else {
                $scope.currentColorScheme.materials.push($scope.newMaterial);
            }
            $scope.materialCaption = 'Add material'
            $scope.newMaterial = {
                materialName: '',
                color: '',
                map: ''
            };
        }

        $scope.editMaterial = function (mt) {
            $scope.materialCaption = 'Update material';
            $scope.newMaterial = mt;
        }

        $scope.deleteMaterial = function (id) {
            $scope.currentColorScheme.materials.splice(id, 1);
        }

        $scope.addFilesForUpload = function (file, property, path) {
            var data = {
                file: file,
                path: path + file.name
            }
            if (property === 'map') {
                $scope.newMaterial.map = path + file.name;
            }
            else {
                $scope.currentColorScheme[property] = path + file.name;
            }
            $scope.filesForUpload.push(data);
        }

        var uploadFiles = function (data) {
            if ($scope.filesForUpload && $scope.filesForUpload.length) {

                angular.forEach($scope.filesForUpload, function (fileSet) {

                    Upload.upload({
                        url: 'http://95.85.31.212:7000/colorSchemes/upload',
                        data: {
                            file: fileSet.file,
                            path: fileSet.path
                        }
                    }).then(function (response) {
                        $scope.filesForUpload = [];
                    });
                });
            }
        };

        $scope.deleteColorScheme = function (colorScheme) {
            ResourceService.deleteColorScheme(colorScheme._id).then(function (data) {
                getAllColorSchemes();
            })
        }

        $scope.publishColorScheme = function () {
            if ($scope.caption == 'Publish color scheme') {
                ResourceService.saveColorScheme($scope.currentColorScheme).then(function (data) {
                    toastr.success("Color scheme published");
                    uploadFiles(data);
                    getAllColorSchemes();
                    $scope.clearForm();
                }, function (data) {
                    toastr.error(data.message);
                });
            }
            else {
                ResourceService.updateColorScheme($scope.currentColorScheme._id, $scope.currentColorScheme).then(function (data) {
                    toastr.success("Color scheme updated");
                    getAllColorSchemes();

                }, function (data) {
                    toastr.error(data.message);
                });
                uploadFiles();
                $scope.caption = 'Publish color scheme';
                $scope.clearForm();
            }
        }

        var getAllColorSchemes = function () {
            ResourceService.getAllColorSchemes().then(function (data) {
                $scope.colorSchemes = data;
            })
        }

        getAllColorSchemes();

    }]);
