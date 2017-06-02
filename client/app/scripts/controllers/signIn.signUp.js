'use strict';

angular.module('vigilantApp').controller('AuthCtrl', ['$http', '$scope', '$rootScope', '$location',
    'ResourceService', 'CryptoJSService', 'localStorageService', 'toastr', '$timeout', 'AuthenticationService', 'ngDialog',
    'ShoppingListService', '$compile', 'SendingLog', 'googleAnalitycs', 'roomStuff', 'SaveStateService', 'roomStateManager',
    function ($http, $scope, $rootScope, $location, ResourceService, CryptoJSService, localStorageService, toastr,
        $timeout, AuthenticationService, ngDialog, ShoppingListService,
        $compile, SendingLog, googleAnalitycs, roomStuff, SaveStateService, roomStateManager) {

        $scope.bsTableOptions = {
            showColumns: false,
            search: true,
            pagination: true,
            escape: false,
            selectItemName: "toolbar",
            pageSize: 5,
            pageList: [5, 10, 20]
        };
        $scope.slTotal = 0;
        $scope.pageContent = 'login';

        $scope.testt = 'foo';

        $scope.sortType = "dt";

        var userData, user_ID = AuthenticationService.userId();
        var mail = AuthenticationService.mail();
        var publisher = AuthenticationService.publisher();

        if (roomStateManager.hasPoints()) {
            $scope.activeLinkToBack = true;
        }
        else
            $scope.activeLinkToBack = false;

        if (AuthenticationService.userId()) {
            $scope.isLoading = true;
            if (publisher) {
                ResourceService.getAllTemplates().then(function (data) {
                    $scope.isLoading = false;
                    toastr.success("Loading projects.");
                    $scope.userRooms = data;
                    console.log($scope.userRooms);

                }, function (data) {
                    toastr.error(data.message);
                });
            }
            else {
                ResourceService.getAllroom().then(function (data) {
                    $scope.isLoading = false;
                    toastr.success("Loading projects.");
                    $scope.userRooms = data;
                }, function (data) {
                    toastr.error(data.message);
                });
            }
        }

        $scope.sendPaswordRecoveryLink = function () {
            var email = $scope.login.email;
            //console.log("send email = ", email);
            var salt = email;
            // var temporaryToken = CryptoJS.PBKDF2(email, salt, { keySize: 256 / 32, hasher: CryptoJS.SHA1 });
            var temporaryToken = CryptoJS.PBKDF2(email, salt);
            
            var sendData = { "email": email, "token": temporaryToken.toString() };

            //console.log('1', ResourceService);

            //console.log('2', ResourceService.forgotPass);

            if (email !== undefined) {
                ResourceService.forgotPass(sendData).then(function (data) {
                    toastr.success('An e-mail has been sent to ' + email + ' with further instructions');
                    //console.log("get response from server after forgot data = ", data);
                    $timeout(function () {
                        $location.path("/");
                    }, 200);
                }, function (data, status) {
                    if (status === 400) {
                        toastr.error(data.message);
                    } else {
                        toastr.error(data);
                    }
                });

            } else {
                noty({ text: 'Username and password are mandatory!', timeout: 2000, type: 'error' });
            }
        };

        $scope.userName = AuthenticationService.userLogged();
        //console.log($scope.userName);
        if ($scope.userName) {
            $rootScope.userLogged = true;
            $rootScope.labelUserLogged = $scope.userName.firstName + " " + $scope.userName.lastName;
            //get user data accounts
            getUserData();

        }
        function getOrderItems() {
            var orderData = [];
            for (var key in $scope.chosenPasses) {
                var item = $scope.chosenPasses[key];
                if (item.quantity > 0) {
                    orderData.push({
                        passId: item.passId,
                        quantity: item.quantity,
                        unitPrice: item.price
                    })
                }
            }
            return orderData;
        }

        function getRoomIndex(rooms, roomId) {
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i]['_id'] == roomId) {
                    // console.log('ROOM INDEX', i);
                    return i;
                }
            }
        }

        $scope.initBsTableAfterRowRepeat = function () {
            console.log('initBsTableAfterRowRepeat');
            $timeout(function () {
                var table = angular.element('#no-more-tables');
                table.bootstrapTable($scope.bsTableOptions);
                table.bootstrapTable('hideColumn', 'mid');
                table.bind('body-changed.bs.table', function () {
                    //console.log('get here one more time');
                    $compile(table)($scope);
                })
            }, 0);
        };
        window.openReport = {
            'click .report': function (e, value, row, index) {
                for (var i = 0; i < $scope.userRooms.length; i++) {
                    if ($scope.userRooms[i]._id === row.mid) {
                        $scope.openProjectReport($scope.userRooms[i]);
                        return;
                    }
                }
                $scope.openProjectReport({});
            }
        };
        window.clickRowToOptions = {
            'click .edit_project': function (e, value, row, index) {
                // var i = (row.id - 1);
                // var i = $scope.userRooms.length - row.id;
                var roomId = JSON.parse(e.target.attributes['data-id'].nodeValue)._id;
                SaveStateService.clearSavedState();
                // var rowForIndex = $scope.userRooms[i];
                $scope.editProject(roomId);
            },
            'click .share_project': function (e, value, row, index) {
                // var i = (row.id - 1);
                // var i = $scope.userRooms.length - row.id;
                // var rowForIndex = $scope.userRooms[i];
                var room = JSON.parse(e.target.attributes['data-id'].nodeValue);
                openWindowSendEmail(room._id, room.imgPreview);
            },
            'click .remove_project': function (e, value, row, index) {
                var roomId = JSON.parse(e.target.attributes['data-id'].nodeValue)._id;
                var bId = JSON.parse(e.target.attributes['data-bid'].nodeValue);
                confirmDelete(roomId, bId);
            },
            'click .up_project': function (e, value, row, index) {
                console.log($scope.userRooms);
                // var i = (row.id - 1);
                var roomId = JSON.parse(e.target.attributes['data-id'].nodeValue)._id;
                var roomIndex = getRoomIndex($scope.userRooms, roomId);
                // var i = $scope.userRooms.length - row.id;
                var roomUpUp = $scope.userRooms[roomIndex],
                    roomUpDown = $scope.userRooms[roomIndex + 1],
                    tempDt;
                if (!roomUpDown) {
                    roomUpDown = $scope.userRooms[roomIndex - 1]
                }

                tempDt = roomUpUp.dt;
                roomUpUp.dt = roomUpDown.dt;
                roomUpDown.dt = tempDt;
                MoveUpDown(roomUpUp._id, roomUpUp, roomIndex, roomUpDown._id, roomUpDown, roomIndex + 1);
            },
            'click .down_project': function (e, value, row, index) {
                // var i = (row.id - 1);
                // var i = $scope.userRooms.length - row.id;
                var roomId = JSON.parse(e.target.attributes['data-id'].nodeValue)._id;
                var roomIndex = getRoomIndex($scope.userRooms, roomId);

                var roomDownDown = $scope.userRooms[roomIndex],
                    roomDownUp = $scope.userRooms[roomIndex - 1],
                    tempDt;
                if (!roomDownUp) {
                    roomDownUp = $scope.userRooms[roomIndex + 1]
                }
                tempDt = roomDownDown.dt;
                roomDownDown.dt = roomDownUp.dt;
                roomDownUp.dt = tempDt;
                MoveUpDown(roomDownUp._id, roomDownUp, roomIndex, roomDownDown._id, roomDownDown, roomIndex - 1);
            },
            'click .show_update': function (e, value, row, index) {
                // var i = (row.id - 1);
                var roomId = JSON.parse(e.target.attributes['data-id'].nodeValue)._id;
                var roomIndex = getRoomIndex($scope.userRooms, roomId);
                var rowForIndex = $scope.userRooms[roomIndex];
                console.log(rowForIndex);
                rowForIndex.showAsTemplate = !rowForIndex.showAsTemplate;
                ResourceService.updateTemplate(rowForIndex._id, rowForIndex);
            }
        };

        $scope.logIn = function (login) {

            //console.log("email = ", login.email);
            //console.log("password = ", login.password);
            var vm = this;
            var salt = login.email;
            // var enc_password = CryptoJS.PBKDF2(login.password, salt, {keySize: 256 / 32});

            // var user = {"email": login.email, "password": enc_password.toString()};

            var user = { "email": login.email, "password": login.password };
            if (login.email !== undefined || login.password !== undefined) {
                $scope.userAccount = ResourceService.login(user).then(
                    function (data) {
                        localStorageService.set("mail", data.email);
                        localStorageService.set("auth_token", data._id);
                        if (data.publisher) {
                            localStorageService.set("publisher", data.publisher);
                            $rootScope.templateMaster = true;
                        }
                        //console.log("get response from server data = ", data);
                        localStorageService.set('user', {
                            firstName: data.firstName,
                            lastName: data.lastName
                        });

                        //send log create user
                        SendingLog.send('userlogin', null, null, data.email);

                        googleAnalitycs.setUser(data._id, data.firstName + " " + data.lastName, data.email);

                        // if user save project without login
                        if ($rootScope.userSave_RoomData) {
                            $rootScope.userSave_RoomData.user_id = data._id;
                            if (AuthenticationService.publisher()) {
                                ResourceService.saveTemplate($rootScope.userSave_RoomData).then(function (result) {
                                    $rootScope.userSave_RoomData = null;
                                    toastr.success('Your project is saved successfully!');
                                    // Send log create project
                                    SendingLog.send('projectcreate', $rootScope.userSave_RoomData.titleProject, $rootScope.userSave_RoomData.projectDetails.project.totalValue);
                                }, function (result) {
                                    toastr.error(result);
                                });
                            }
                            else {
                                ResourceService.saveRoom($rootScope.userSave_RoomData).then(function (result) {
                                    $rootScope.userSave_RoomData = null;
                                    toastr.success('Your project is saved successfully!');
                                    // Send log create project
                                    SendingLog.send('projectcreate', $rootScope.userSave_RoomData.titleProject, $rootScope.userSave_RoomData.projectDetails.project.totalValue);
                                }, function (result) {
                                    toastr.error(result);
                                });
                            }
                        }

                        $timeout(function () {
                            $rootScope.userLogged = true;
                            $rootScope.labelUserLogged = data.firstName + " " + data.lastName;
                            $location.path("/planning");
                        }, 1000);
                    }
                    ,
                    function (data, status) {
                        if (status === 401) {
                            toastr.error('Wrong username and/or password!');
                        }
                        else {
                            toastr.error(data);
                        }
                    }
                )
            }
            else {
                noty({ text: 'Username and password are mandatory!', timeout: 2000, type: 'error' });
            }
        };

        $scope.loginAsaGuest = function () {

            localStorageService.set('guest', true);

            $timeout(function () {
                $location.path("/planning");
            }, 1000);
        }

        $scope.changePageContent = function (content) {
            $scope.pageContent = content;
        }


        $scope.signUp = function (register) {

            var salt = register.email;

            var registerUser = {
                firstName: 'new',
                lastName: 'user',
                email: register.email,
                password: register.password
            };

            if (register.email !== undefined || register.password !== undefined || register.check_password !== undefined) {
                if (register.password !== register.check_password) {
                    toastr.warning('password and check_password must be the same!');
                } else {
                    ResourceService.signup(registerUser).then(function (data) {
                        localStorageService.set("auth_token", data._id);
                        localStorageService.set('user', {
                            firstName: data.firstName,
                            lastName: data.lastName
                        });

                        //send log create user
                        SendingLog.send('usercreate', null, null, register.email);
                        googleAnalitycs.accountCreated();
                        // if user save project without login
                        if ($rootScope.userSave_RoomData) {
                            $rootScope.userSave_RoomData.user_id = data._id;
                            ResourceService.saveRoom($rootScope.userSave_RoomData).then(function (result) {
                                $rootScope.userSave_RoomData = null;
                                toastr.success('Your project is saved successfully!');
                                // Send log create project
                                SendingLog.send('projectcreate', $rootScope.userSave_RoomData.titleProject, $rootScope.userSave_RoomData.projectDetails.project.totalValue);
                            }, function (result) {
                                toastr.error(result);
                            });
                        }

                        $scope.register = {};

                        $timeout(function () {
                            $location.path("/account");
                        }, 1000);

                    }, function (data) {
                        if (data.status && data.status == 409) {
                            toastr.error(data.message);
                        }
                        else {
                            toastr.error(data);
                        }
                    });
                }
            } else {
                noty({ text: 'Username and password are mandatory!', timeout: 2000, type: 'warning' });
            }
        };

        function MoveUpDown(room1_id, room1, index1, room2_id, room2, index2) {

            var table = angular.element('#no-more-tables');
            console.log('dates updating');

            console.log('index1: ' + index1);
            console.log($scope.userRooms[index1]);

            console.log('index2: ' + index2);
            console.log($scope.userRooms[index2]);
            ResourceService.updateTemplate(room1_id, room1);
            ResourceService.updateTemplate(room2_id, room2).then(function (data) {

                toastr.success("Update order");
                //send log delete project
                //SendingLog.send('projectdelete', null, null);

                ResourceService.getAllTemplates().then(function (data) {
                    $scope.initBsTableAfterRowRepeat();
                    // location.reload();
                },
                    function (data) {
                        toastr.error(data.message);
                    });
            },

                function (data) {
                    toastr.error(data.message);
                });
        }

        var confirmDelete = function (id_room, bid) {
            ngDialog.openConfirm({
                disableAnimation: true,
                template: '/views/help/confirmDelete.html'
            }).then(function (confirm) {
                deleteRoomProject(id_room, bid);
            }, function (reject) {

            });
        };

        function deleteRoomProject(room_Id, bid) {
            var table = angular.element('#no-more-tables');
            var removeID;

            if (AuthenticationService.userId()) {

                if (AuthenticationService.publisher()) {
                    ResourceService.deleteTemplate(room_Id).then(function (data) {

                        toastr.success("Delete room");
                        //send log delete project
                        SendingLog.send('projectdelete', null, null);

                        ResourceService.getAllTemplates().then(function (data) {
                            $scope.userRooms = data;
                            //removeID = String(removeID);
                            table.bootstrapTable('remove', {
                                field: 'id',
                                values: [bid.toString()]
                            });
                        },
                            function (data) {
                                toastr.error(data.message);
                            });
                    },

                        function (data) {
                            toastr.error(data.message);
                        });
                }
                else {
                    ResourceService.deleteRoom(room_Id).then(function (data) {

                        toastr.success("Delete room");
                        //send log delete project
                        SendingLog.send('projectdelete', null, null);
                        ResourceService.getAllroom().then(function (data) {
                            $scope.userRooms = data;
                            table.bootstrapTable('remove', {
                                field: 'id',
                                values: [bid.toString()]
                            });

                        },
                            function (data) {
                                toastr.error(data.message);
                            });
                    }, function (data) {
                        toastr.error(data.message);
                    });
                }

            }
        };

        var openWindowSendEmail = function (id_room, img) {
            var room_share;
            var url_project = 'http://' + location.host + '/#/browsing/' + id_room;

            if (publisher) {
                ResourceService.getOneTemplate(id_room).then(function (data) {
                    room_share = data;
                },
                    function (data) {
                        toastr.error(data.message);
                    });
            }
            else {

                ResourceService.getOne(id_room).then(function (data) {
                    room_share = data;
                },
                    function (data) {
                        toastr.error(data.message);
                    });
            }
            var textMessage = "A friend has shared a Vigilant Wine Cellar design with you.";
            $scope.mailOptions = {
                from: userData.email,
                to: '',
                subject: 'Vigilant Wine Cellar Design',
                content: textMessage,
                url_project: url_project,
                img: img
            };
            ngDialog.open({
                disableAnimation: true,
                template: '/views/share/sendEmail.html',
                plain: false,
                scope: $scope,
                controller: ['$scope', 'SocialShare', 'ngDialog', function ($scope, SocialShare, ngDialog) {
                    $scope.sendEmail = function () {

                        SocialShare.sendEmail($scope.mailOptions);
                        //send log share project
                        SendingLog.send('projectshare', room_share.titleProject, room_share.projectDetails.project.totalAmount);
                        ngDialog.close();
                    }
                }]
            });
        };

        $scope.editProject = function (room_id) {

            if (publisher) {
                ResourceService.getOneTemplate(room_id).then(function (data) {
                    $rootScope.editedRoomData = data;
                    $timeout(function () {
                        if (AuthenticationService.publisher()) {
                            $location.path("/templates/" + room_id);
                        }
                        else {
                            $location.path("/planning/" + room_id);
                        }
                    }, 0);

                    $timeout(function () {
                        $rootScope.$broadcast('loadRoom', data);
                    }, 300);
                },
                    function (data) {
                        toastr.error(data);
                    });
            }
            else {
                ResourceService.getOne(room_id).then(function (data) {
                    $rootScope.editedRoomData = data;
                    $timeout(function () {
                        if (AuthenticationService.publisher()) {
                            $location.path("/templates/" + room_id);
                        }
                        else {
                            $location.path("/planning/" + room_id);
                        }
                    }, 0);

                    $timeout(function () {
                        $rootScope.$broadcast('loadRoom', data);
                    }, 300);
                },
                    function (data) {
                        toastr.error(data);
                    });
            }
        };

        $scope.updateUserProfileData = function () {
            if ($scope.userProfileData.firstName != '' && $scope.userProfileData.lastName != '') {
                //console.log('success update');
                ResourceService.updateUserProfileData(user_ID, $scope.userProfileData).then(function (message) {
                    $rootScope.labelUserLogged = $scope.userProfileData.firstName + " " + $scope.userProfileData.lastName;
                    localStorageService.set('user', {
                        firstName: $scope.userProfileData.firstName,
                        lastName: $scope.userProfileData.lastName
                    });
                    userData.firstName = $scope.userProfileData.firstName;
                    userData.lastName = $scope.userProfileData.lastName;
                    toastr.success(message);
                },
                    function (data) {
                        toastr.error(data.error);
                    });
            }
            else {
                toastr.error('All fields must be completed!');
            }
        };

        $scope.updateUserAuthData = function () {
            if ($scope.userAuthData.email != '' && $scope.userAuthData.newPassword != '' && $scope.userAuthData.oldPassword != ''
                && $scope.userAuthData.confirmPassword != '') {
                if ($scope.userAuthData.newPassword === $scope.userAuthData.confirmPassword) {
                    ResourceService.updateUserAuthData(user_ID, $scope.userAuthData).then(function (message) {
                        //console.log('success update');
                        toastr.success(message);
                        userData.email = $scope.userAuthData.email;
                        $scope.userAuthData.newPassword = $scope.userAuthData.confirmPassword = $scope.userAuthData.oldPassword = '';
                    },
                        function (data) {
                            toastr.error(data.error);
                        });
                }
                else
                    toastr.error('Field New Password and Confirm Password must be equal!');

            }
            else {
                toastr.error('All fields must be completed!');
            }
        };

        $scope.resetUserDataIfNotSave = function () {
            //getUserData();
            $scope.userProfileData.firstName = userData.firstName;
            $scope.userProfileData.lastName = userData.lastName;
            $scope.userAuthData.email = userData.email;
            $scope.userAuthData.newPassword = $scope.userAuthData.confirmPassword = $scope.userAuthData.oldPassword = '';
            $scope.form.userAuthForm.$setPristine();
            $scope.form.userAuthForm.$setUntouched();
            $scope.form.userProfileForm.$setPristine();
            $scope.form.userProfileForm.$setUntouched();
        };

        // function prepareSLData(info) {
        //     var data = {};
        //     data.objects = [];
        //     for (var i = 0; i < info.length; i++) {
        //         var obj = {};
        //         obj.userData = {};
        //         obj.userData.entity = roomStuff.getById(info[i].id);
        //         obj.userData.choosenColor = info[i].colorScheme;
        //         data.objects.push(obj);
        //     }
        //     return data;
        // }
        $scope.openProjectReport = function (room) {
            $scope.dataProject = room.projectDetails.project;
            $rootScope.$broadcast('calculateSPL', SaveStateService.prepareSLData(room.data.objects));
            $timeout(function () {
                angular.element('#report-project').modal('show');
            }, 100);

        };

        $scope.goBackToProject = function () {
            if ($scope.activeLinkToBack) {
                $location.path("/planning");
                $timeout(function () {
                    $rootScope.$broadcast('GoBackToProject');
                }, 350);
            }

        };

        $scope.test = function () {
            console.log('show hide check');
        }

        // $scope.updateShowTemplate = function (id, data) {
        //     data.showAsTemplate = !data.showAsTemplate;
        //     console.log('template show now is set to: ' + data.ShowAsTemplate);
        //     ResourceService.updateTemplate(id, data);
        // }
        $scope.notEmpty = 0;

        function getUserData() {
            ResourceService.getUserDataAccount(user_ID).then(function (data) {
                // console.debug('userData = ', data);
                userData = data;
                $scope.userProfileData = {
                    firstName: userData.firstName,
                    lastName: userData.lastName
                };
                $scope.userAuthData = {
                    email: userData.email,
                    newPassword: '',
                    oldPassword: '',
                    confirmPassword: ''
                };
            },
                function (data) {
                    toastr.error(data);
                });
        };

    }]);
