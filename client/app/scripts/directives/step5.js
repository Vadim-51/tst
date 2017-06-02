'use strict';
angular.module('vigilantApp').directive('step5', ['scene3D', 'AuthenticationService', '$http',
    'constants', 'roomStateManager', '$routeParams', 'toastr', '$timeout', 'ResourceService', 'screenShotStoreSrvc', 'SendingLog', 'ShoppingListService',
    'Scene2d', 'localStorageService', 'scene3DScreenshotSrvc','objects2DSerializer',
    function (scene3D, AuthenticationService, $http, constants, roomStateManager, $routeParams, toastr,
        $timeout, ResourceService, screenShotStoreSrvc, SendingLog, ShoppingListService, Scene2d, 
        localStorageService, scene3DScreenshotSrvc, objects2DSerializer) {
        return {
            templateUrl: 'views/steps/step5.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
            },
            controller: function ($scope, $rootScope, ngDialog) {

                var stepChangeListener,
                    step5IsActive;

                $scope.notEmpty = 0;

                $scope.dataUnitFT = true;
                $scope.dataUnitM = false;
                $scope.newTitleProjectDesign = false;
                $scope.projectDetails = {
                    title: null,
                    project: {
                        linear: null,
                        floorArea: null,
                        wallArea: null,
                        numberWalls: null,
                        totalValue: null
                    },
                    address: {
                        clientName: '',
                        street: '',
                        city: ''
                    },
                    contact: {
                        email: '',
                        tel: '',
                        mobile: ''
                    },
                    saveAsNewProject: true,
                    saveAsSuite: false
                };
                $scope.totalPrice = 0;

                $scope.SPLchangeUnit = function (unit) {
                    if (unit === 'FT') {
                        $scope.dataUnitFT = constants.wallUnitLength.FT = true;
                        $scope.dataUnitM = constants.wallUnitLength.M = false;
                        $rootScope.$broadcast('updateTableFT');
                    }
                    else {
                        $scope.dataUnitFT = constants.wallUnitLength.FT = false;
                        $scope.dataUnitM = constants.wallUnitLength.M = true;
                    }

                    $rootScope.$broadcast('changeUnitInSPL');
                   // $rootScope.$broadcast('changeFloorArea');
                    $rootScope.$broadcast('changeUnitLengthForWall',unit);

           
                        $rootScope.$broadcast('updateWallSizeDialog');
                    
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                };

                stepChangeListener = $rootScope.$on('stepActive', function (events, step) {
                    if (step === 'step5') {
                        step5IsActive = true;
                    } else {
                        if (step5IsActive && step !== 'step4')

                            scene3D.dispose();
                        step5IsActive = false;
                    }
                });

                $scope.$on('$destroy', function () {
                    stepChangeListener();
                });

                var resizeScene3d = function (val) {
                    if (val)
                        $timeout(function () {
                            scene3D.resize();
                        }, 0);
                };

                $scope.$watch('active_3dViewer', resizeScene3d);
                $scope.$watch('active_project', resizeScene3d);

                function addColorScheme(products) {
                    for (var i = 0; i < products.length; i++) {
                        if (products[i].userData.entity.objectType === constants.ObjectType.CABINET ||
                            products[i].userData.entity.objectType === constants.ObjectType.TABLE) {
                            var tempData = roomStateManager.getColorSchemeByObjectId(products[i].uuid);
                            var color = tempData ? tempData.scheme : '';
                            products[i].userData.entity.choosenColor = color;
                        }
                    }
                }

                function prepareDataToSave(){
                    var mail = AuthenticationService.mail();
                    var user_id = AuthenticationService.userId();
                    // var publisher = AuthenticationService.publisher();
                    console.log('user email' + mail);
                    $scope.projectDetails.project = $scope.projectData;
                    $scope.projectDetails.project.totalAmount = $scope.totalPrice;
                    var screenshot = screenShotStoreSrvc.getScreenShotObject();
                    var product = ShoppingListService.getParamsReport();
                    var walls = scene3D.filterChildren(function (mesh) {
                        return mesh.userData.entity && mesh.userData.entity.isWall
                    }),
                    floor = scene3D.getFloor(),
                    objects = Scene2d.getEntityObjects();

                    addColorScheme(objects);

                    product.description = product.isDRSBF ? (product.isSBF ? 'SmartWall, SubFloor' : 'SmartWall, SubFloor R+') : 'SmartWall';

                    var room = {
                        user_id: user_id ? user_id : '',
                        titleProject: $scope.projectDetails.title,
                        imgPreview: scene3DScreenshotSrvc.take(),
                        projectDetails: $scope.projectDetails,
                        data: {
                            points: roomStateManager.getRoomPoints(),
                            objects: objects2DSerializer.serialize(objects),
                            wallColorScheme: roomStateManager.getColorSchemeByObjectId(walls[0].name).scheme,
                            floorColorScheme: roomStateManager.getColorSchemeByObjectId(floor.name).scheme
                        },
                        report: {
                            countCorner: 0,
                            product: product
                        },
                        screenshot: screenshot,
                        device: SendingLog.detectedDeviceType(),
                        browser: SendingLog.detectedBrowserType(),
                        showAsTemplate: false
                    };

                    return room;
                }

                $scope.saveRoom = function () {
                    var room = prepareDataToSave();
                    var publisher = AuthenticationService.publisher();
                    
                    if (publisher) {

                        console.debug("this is a template master project");

                        if (!$scope.projectDetails.saveAsSuite) {
                            room.showAsTemplate = true;
                        }
                        
                        if ($scope.projectDetails.saveAsNewProject) {
                            console.log('save template');
                            room.imgPreview = Scene2d.getSnapShots();
                            ResourceService.saveTemplate(room).then(function (data) {
                                ngDialog.close();
                                toastr.success(data);
                                // Send log create project
                                SendingLog.send('projectcreate', room.titleProject, room.projectDetails.project.totalValue);
                            }, function (data) {
                                toastr.error(data.error);
                            });
                        }
                        else if ($routeParams.room_id) {
                            var edit_room = $rootScope.editedRoomData;
                            room.imgPreview = Scene2d.getSnapShots();
                            if(edit_room.suiteId){
                                room.suiteId = edit_room.suiteId;
                            }
                            ResourceService.updateTemplate($routeParams.room_id, room).then(function (res) {
                                ngDialog.close();
                                toastr.success('Your template has been successfully updated!');
                                // Send log update project
                                SendingLog.send('projectupdate', room.titleProject, room.projectDetails.project.totalValue);
                            }, function (res) {
                                toastr.error(res);
                            });
                        }
                    }
                    else if (room.user_id) {
                        if ($scope.projectDetails.saveAsNewProject) {
                            console.log('save room');
                            ResourceService.saveRoom(room).then(function (data) {
                                ngDialog.close();
                                toastr.success(data);
                                // Send log create project
                                SendingLog.send('projectcreate', room.titleProject, room.projectDetails.project.totalValue);
                            }, function (data) {
                                console.debug(data);
                                toastr.error(data.error);
                            });
                        }
                        else if ($routeParams.room_id) {
                            var edit_room = $rootScope.editedRoomData;

                            console.log('edit room');
                            ResourceService.updateRoom($routeParams.room_id, room).then(function (res) {
                                ngDialog.close();
                                toastr.success('Your project has been successfully updated!');
                                // Send log update project
                                SendingLog.send('projectupdate', room.titleProject, room.projectDetails.project.totalValue);
                            }, function (res) {
                                toastr.error(res);
                            });

                        }
                    }
                    else {
                        $rootScope.userSave_RoomData = room;
                        ngDialog.open({
                            disableAnimation: true,
                            template: '/views/help/saveNeedLogin.html',
                            controller: ['$scope', 'ngDialog', function ($scope, ngDialog) {
                                $scope.closeDialog = function () {
                                    ngDialog.close();
                                };
                            }]
                        });
                    }
                };

                $scope.checkSaveProperties = function () {
                    if (scene3DScreenshotSrvc.take() === "data:,") {
                        $scope.active_project = true;
                        $scope.active_SPL = false;
                    }
                    ngDialog.open({
                        disableAnimation: true,
                        template: '/views/help/saveProperties.html',
                        plain: false,
                        scope: $scope
                    });
                };

                $scope.printPageSPL = function () {
                    var content = buildPageToSave();
                    var newWindow = window.open('', 'Shopping List');
                    newWindow.document.write('<html><head><title>Shopping List</title>');
                    newWindow.document.write('</head><body >');
                    newWindow.document.write(content);
                    newWindow.document.write('</body></html>');

                    newWindow.print();
                    newWindow.close();

                    return true;
                };

                $scope.focusOnWall = function (wallIndex) {
                    scene3D.focusOnWall('Wall ' + wallIndex);
                };

                // $scope.$on("saveCurrentState", function(e, data){
                $scope.$on("saveCurrentState", function(stepObj){
                    $scope.saveCurrentState(stepObj);
                });

                $scope.saveCurrentState = function (stepObj){
                    var room = prepareDataToSave();
                    room.step = stepObj;
                    localStorageService.set(room.user_id || 'unauthorized', room);
                };
            }
        }

    }]);
