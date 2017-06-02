'use strict';

angular.module('vigilantApp').controller('ModelPublCtrl', ['$scope', 'ResourceService', '$timeout', '$location',
    'toastr', 'Upload', 'AuthenticationService', '$rootScope',
    function ($scope, ResourceService, $timeout, $location, toastr, Upload, AuthenticationService, $rootScope) {

        var userName = AuthenticationService.userLogged();

        if (userName) {
            if (AuthenticationService.publisher()) {
                $rootScope.templateMaster = true;
            }
            else {
                $rootScope.templateMaster = false
            }
            $rootScope.userLogged = true;
            $rootScope.labelUserLogged = userName.firstName + " " + userName.lastName;
        }

        $scope.colorScheme = "";
        $scope.filesForUpload = [];
        $scope.models = [];
        $scope.leftMenuItems = [];
        $scope.caption = 'Publish model';
        $scope.genericSwapGroups = [];
        $scope.formVisible = false;
        $scope.objectType = 'Vigilant';
        $scope.leftMenuAliasGeneric = [
            'Windows',
            'Doors - Entry',
            'Doors - Garage'
        ];

        var getProducts = function () {
            ResourceService.getProducts().then(function (data) {
                $scope.models = data;
                getSwapGroups($scope.models);
            });
            ResourceService.getAllLeftMenuItems().then(function (dt) {
                $scope.leftMenuItems = dt;
            })
        }

        var getSwapGroups = function (a) {
            var seen = {},
                out = [],
                genOut = [],
                len = a.length,
                j = 0,
                g = 0;

            for (var i = 0; i < len; i++) {
                var item = a[i].swap_group_name;

                if (seen[item] !== 1) {
                    seen[item] = 1;
                    if (a[i].isGeneric) {
                        genOut[g++] = item;
                    }
                }
            }
            $scope.genericSwapGroups = genOut;
        }

        $scope.clearForm = function (objectType) {
            $scope.filesForUpload = [];
            $scope.setFormVisible(true);
            $scope.objectType = objectType;
            if ($scope.objectType === 'generic') {
                $scope.currentModel = {
                    isGeneric: true,
                    disableAutoOrientation: false,
                    width: null,
                    length: null,
                    height: null,
                    defaultHeightFromFloor: null,
                    color_scheme: [],
                    isOpening: false,
                    swap_group_name: "",
                    left_menu_alias: "",
                    borders: { wall: null, default: null },
                    visible: true,
                    leftMenuImg: "",
                    swapImage: "",
                    productImage: "",
                    defaultRotationDegree: 10,
                    texture: []
                };
            }
            else {
                $scope.currentModel = {
                    isGeneric: false,
                    disableAutoOrientation: false,
                    description: "",
                    category: "",
                    dimension_units: "",
                    width: null,
                    length: null,
                    height: null,
                    defaultHeightFromFloor: null,
                    color_scheme: {
                        mahagony: {
                            lacquer: null,
                            sku: "",
                            stain_unit: null,
                            unit_price: null
                        },
                        pine: {
                            lacquer: null,
                            sku: "",
                            stain_unit: null,
                            unit_price: null
                        }
                    },
                    borders: { wall: null, default: null },
                    hotzones: { wall: null },
                    visible: true,
                    texture: []
                };
            }

            $scope.caption = 'Publish model';
            $scope.formVisible = true;
        }

        $scope.setFormVisible = function (val) {
            $scope.formVisible = val;
        }

        $scope.deleteModel = function (model) {
            $scope.filesForUpload = [];
            ResourceService.deleteProduct(model._id).then(function (data) {
                getProducts();
            })
        }

        $scope.deleteColorScheme = function (id) {
            $scope.currentModel.color_scheme.splice(id, 1);
        }

        $scope.editModel = function (model) {
            console.debug(model);
            if (model.isGeneric) {
                $scope.objectType = 'generic';
            }
            else {
                $scope.objectType = 'Vigilant';
            }
            $scope.clearForm($scope.objectType);
            $scope.currentModel = model;
            $scope.caption = 'Update model';
        }

        $scope.addFilesForUpload = function (file, imageFolder, id) {
            var data = {
                file: file,
                imageFolder: imageFolder,
                newName: file.name,
                id: id || null
            }
            $scope.filesForUpload.push(data);
        }

        $scope.addGenericFilesForUpload = function (file, imageFolder, isImage, id, category, model) {
            var data = {
                file: file,
                imageFolder: imageFolder,
                newName: file.name,
                isImage: isImage,
                id: id,
                category: category,
                model: model
            }
            $scope.filesForUpload.push(data);
        }

        var uploadFiles = function (id) {
            if ($scope.filesForUpload && $scope.filesForUpload.length) {

                angular.forEach($scope.filesForUpload, function (fileSet) {

                    Upload.upload({
                        url: 'http://95.85.31.212:7000/products/upload',
                        data: {
                            file: fileSet.file,
                            imageFolder: fileSet.imageFolder,
                            newName: fileSet.newName,
                            id: fileSet.id || id
                        }
                    })
                });
            }
        };

        var uploadGenericFiles = function (id) {
            if ($scope.filesForUpload && $scope.filesForUpload.length) {

                angular.forEach($scope.filesForUpload, function (fileSet) {

                    Upload.upload({
                        url: 'http://95.85.31.212:7000/products/uploadGeneric',
                        data: {
                            file: fileSet.file,
                            imageFolder: fileSet.imageFolder,
                            newName: fileSet.newName,
                            isImage: fileSet.isImage,
                            id: fileSet.id || id,
                            category: fileSet.left_menu_alias,
                            model: fileSet.model
                        }
                    })
                });
            }
        };

        $scope.addColorScheme = function () {
            if (!$scope.currentModel.color_scheme)
                $scope.currentModel.color_scheme = [];
            $scope.currentModel.color_scheme.push($scope.colorScheme);
            $scope.colorScheme = "";
            console.log($scope.currentModel.color_scheme);
        }

        $scope.addGenericSwap = function () {
            $scope.genericSwapGroups.push($scope.swapGeneric);
            $scope.swapGeneric = "";
        }

        $scope.publishModel = function () {
            if ($scope.objectType === 'Vigilant') {
                if ($scope.caption == 'Publish model') {
                    ResourceService.saveProduct($scope.currentModel).then(function (data) {
                        uploadFiles(data._id);
                        toastr.success("Model published");
                        getProducts();
            $scope.clearForm();
                        
                    }, function (data) {
                        // toastr.error(data.message);
                    });
                }
                else {
                    ResourceService.updateProduct($scope.currentModel._id, $scope.currentModel).then(function (data) {
                        getProducts();
                        toastr.success("Model updated");

                    }, function (data) {
                        // toastr.error(data.message);
                    });
                    uploadFiles();
                    $scope.caption = 'Publish model';
            $scope.clearForm();
                }
            }
            else {
                if ($scope.caption == 'Publish model') {
                    ResourceService.saveProduct($scope.currentModel).then(function (data) {
                        toastr.success("Model published");
                        uploadGenericFiles(data._id);
                        getProducts();
            $scope.clearForm();
                    }, function (data) {
                        toastr.error(data.message);
                    });
                }
                else {
                    ResourceService.updateProduct($scope.currentModel._id, $scope.currentModel).then(function (data) {
                        getProducts();
                        toastr.success("Model updated");

                    }, function (data) {
                        toastr.error(data.message);
                    });
                    uploadGenericFiles();
                    $scope.caption = 'Publish model';
            $scope.clearForm();
                }
            }
            $scope.setFormVisible(false);
        }

        getProducts();

        $scope.clearForm();
    }]);
