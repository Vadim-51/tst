'use strict';

angular.module('vigilantApp').controller('SuitePublCtrl', ['$scope', 'ResourceService', 'toastr', 'Upload',
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
        $scope.suites = [];
        $scope.formVisible = false;
        $scope.currentSuite = null;

        $scope.clearForm = function () {
            $scope.filesForUpload = [];
            $scope.setFormVisible(false);

            $scope.currentSuite = null;
        }

        $scope.setFormVisible = function (val) {
            $scope.currentSuite && ($scope.formVisible = val);
        }

        $scope.editSuite = function (suite) {
            $scope.currentSuite = suite;
            $scope.setFormVisible(true);
        }

        $scope.addFilesForUpload = function (file, imageFolder, id) {
            var data = {
                file: file,
                imageFolder: imageFolder,
                id: id,
            }
            $scope.filesForUpload.push(data);
        }

        var uploadFiles = function () {
            if ($scope.filesForUpload && $scope.filesForUpload.length) {

                angular.forEach($scope.filesForUpload, function (fileSet) {

                    Upload.upload({
                        url: 'http://95.85.31.212:7000templates/upload',
                        data: {
                            file: fileSet.file,
                            imageFolder: fileSet.imageFolder,
                            id: fileSet.id
                        }
                    }).then(function (response) {
                        $scope.filesForUpload = [];
                    });
                });
            }
        };

        $scope.deleteSuite = function (material) {
            ResourceService.deleteSuite(material._id).then(function (data) {
                getAllSuites();
            })
        }

        $scope.updateSuite = function () {
            ResourceService.updateSuite($scope.currentSuite._id, $scope.currentSuite).then(function (data) {
                toastr.success("Suite updated");

            }, function (data) {
                toastr.error(data.message);
            });
            uploadFiles();
            getAllSuites();
        }

        // to do
        var getAllSuites = function () {
            ResourceService.getAllSuites().then(function (data) {
                $scope.suites = data;
            })
        }

        getAllSuites();

    }]);
