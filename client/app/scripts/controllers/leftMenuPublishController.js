'use strict';

angular.module('vigilantApp').controller('LeftMenuPublCtrl', ['$scope', 'toastr', 'AuthenticationService', 'ResourceService', '$rootScope',
    function ($scope, toastr, AuthenticationService, ResourceService, $rootScope) {

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

        $scope.caption = "Publish menu item"
        $scope.leftMenuItems = [];
        $scope.currentLeftMenuItem = {
            text: "",
            parentId: "rootVigilant"
        }
        
        $scope.clearForm = function () {
            $scope.currentLeftMenuItem = {
                text: "",
                parentId: "rootVigilant"
            };

            $scope.caption = 'Publish menu item';
        }

        $scope.editLeftMenuItem = function (item) {
            $scope.currentLeftMenuItem = item;
            $scope.caption = 'Update menu item';
        }

        $scope.deleteLeftMenuItem = function (id) {
            ResourceService.deleteLeftMenuItem(id).then(function (data) {
                getAllLeftMenuItems();
            })
        }

        $scope.publishLeftMenuItem = function () {
            if ($scope.caption == 'Publish menu item') {
                ResourceService.saveLeftMenuItem($scope.currentLeftMenuItem).then(function (data) {
                    toastr.success("Menu item published");
                    getAllLeftMenuItems();
                    $scope.clearForm();
                }, function (data) {
                    toastr.error(data.message);
                });
            }
            else {
                ResourceService.updateLeftMenuItem($scope.currentLeftMenuItem._id, $scope.currentLeftMenuItem).then(function (data) {
                    toastr.success("Menu item updated");
                    getAllLeftMenuItems();
                    $scope.clearForm();

                }, function (data) {
                    toastr.error(data.message);
                });
            }
        }

        var getAllLeftMenuItems = function () {
            ResourceService.getAllLeftMenuItems().then(function (data) {
                $scope.leftMenuItems = data;
            })
        }

        getAllLeftMenuItems();

    }]);
