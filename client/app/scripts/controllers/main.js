'use strict';

angular.module('vigilantApp').controller('MainCtrl', ['$scope', '$http', '$rootScope', 'Scene2d', '$timeout',
    'scene3D', 'AuthenticationService', 'ResourceService', 'constants', 'roomStateManager', 'localStorageService', '$location', '$routeParams',
    'ShoppingListService', 'screenShotStoreSrvc', 'googleAnalitycs', 'toastr', '$window', 'ngDialog', 'engine2DSrvc',
    'roomStuff', 'SaveStateService', 'engine3DSrvc', 'room2DBuilder', 'objects2DSerializer', 'cameraManager', 'stage', 'engine', 'geometryHelper',
    'sceneStepBindings', 'wallNumberSrvc', 'rendererSrvc','objectCheckerSrvc',
    function ($scope, $http, $rootScope, Scene2d, $timeout, scene3D, AuthenticationService, ResourceService, constants, roomStateManager,
        localStorageService, $location, $routeParams, ShoppingListService, screenShotStoreSrvc, googleAnalitycs, toastr, $window, ngDialog, engine2DSrvc,
        roomStuff, SaveStateService, engine3DSrvc, room2DBuilder, objects2DSerializer, cameraManager, stage, engine, geometryHelper, sceneStepBindings,
        wallNumberSrvc, rendererSrvc,objectCheckerSrvc) {

        var previousStep = null;
        $scope.sortType = 'dt';
        $rootScope.userLogged = false;
        $rootScope.templateMaster = false;
        $scope.menuActiveStep = 0;
        $scope.activeView = 0;

        var userName = AuthenticationService.userLogged();
        var newProjConfirmMsg = "This will start a new Wine Cellar project. Do you wish to continue?";
        var customRoomFlag = false;

        var drawCustomRoomComponent = engine.get().findComponentByType(DrawCustomRoom);

        $window.addEventListener("message", function (event) {
            // "https://138.197.30.187"
            if (event.origin !== "http://95.85.31.212:7000/") {
                return;
            }
            var payload = JSON.parse(event.data);
            console.warn("### payload ### ", payload);
            localStorageService.set("ce_sid_name", payload.data.ce_sid_name);
            localStorageService.set("ce_sid_id", payload.data.ce_sid_id);
        });

        if (userName) {
            console.log("email");
            console.log(AuthenticationService.mail());
            if (AuthenticationService.publisher()) {
                $rootScope.templateMaster = true;
            }
            else {
                $rootScope.templateMaster = false
            }
            console.log('is templ master');
            console.log($rootScope.templateMaster);
            $rootScope.userLogged = true;
            $rootScope.labelUserLogged = userName.firstName + " " + userName.lastName;
            googleAnalitycs.setUser(AuthenticationService.userId(), $rootScope.labelUserLogged);
        }

        $rootScope.allowMoveTouchPoint = true;

        $scope.Tmplts = [];

        ResourceService.getAllShownTemplates().then(function (data) {
            var temp = [];
            for (var i = 0; i < data.length; i++) {
                temp.push(data[i]);
            }
            temp.push($scope.step1.data[0]);
            for (var i = 0; i < temp.length; i += 3) {
                var row = []
                for (var j = i; j < (i + 3) && j < temp.length; j++) {
                    row.push(temp[j]);
                }
                $scope.Tmplts.push(row);
            }
            console.debug(temp);
            console.debug($scope.Tmplts);
        }, function (data) {
            toastr.error(data.message);
        });

        $http.get('/json/steps.json').then(function (response) {
            $scope.menu = response.data.menu;
            $scope.step1 = response.data.steps[0];
            $scope.step2 = response.data.steps[1];
            $scope.step3 = response.data.steps[2];
            $scope.step4 = response.data.steps[3];
            $scope.step5 = response.data.steps[4];
        });

        if ($rootScope.notStep) {
            $scope.isLoading = true;
            $scope.VisibleStep1 = $scope.VisibleStep2 = $scope.VisibleStep3 = $scope.VisibleStep4 = $scope.VisibleStep5 = false;
        }
        else {
            $scope.VisibleStep1 = true;
            $scope.VisibleStep2 = false;
            $scope.VisibleStep3 = false;
            $scope.VisibleStep5 = false;
        }
        $scope.$on('changeStep', function (events, data) {

            var isSilent = data.silent;
            var stepNumber = data.index + 1;
            var step = 'step' + stepNumber;
            var roomExist = roomStateManager.hasPoints();

            $rootScope.$broadcast('hiddenPopupInfo');

            if (stepNumber !== 1 && !roomExist && !customRoomFlag) {
                ngDialog.open({
                    disableAnimation: true,
                    className: 'ngdialog-theme-default screenshots-popup',
                    template: 'Please choose Cellar Shape',
                    plain: true
                });
                return;
            }

            switch (stepNumber) {
                case 1:
                    {
                        if (roomExist && previousStep != 'step1') {

                            if (!confirm(newProjConfirmMsg))
                                return;


                            $scope.VisibleStep1 = true;
                            $scope.VisibleStep3 = false;
                            $scope.VisibleStep2 = false;
                            $scope.VisibleStep4 = false;
                            $scope.VisibleStep5 = false;
                            step = "step1";
                            previousStep = step;
                            $location.path('planning');

                        }
                        else {

                            $scope.VisibleStep1 = true;
                            $scope.VisibleStep3 = false;
                            $scope.VisibleStep2 = false;
                            $scope.VisibleStep4 = false;
                            $scope.VisibleStep5 = false;
                            step = "step1";
                            previousStep = step;
                        }
                    }
                    break;
                case 2:
                    {

                        $scope.VisibleStep1 = false;
                        $scope.VisibleStep3 = false;
                        $scope.VisibleStep2 = true;
                        $scope.VisibleStep4 = false;
                        $scope.VisibleStep5 = false;
                        step = "step2";
                        previousStep = step;
                    }
                    break;
                case 3:
                    {

                        $scope.VisibleStep1 = false;
                        $scope.VisibleStep3 = true;
                        $scope.VisibleStep2 = false;
                        $scope.VisibleStep4 = false;
                        $scope.VisibleStep5 = false;
                        step = "step3";
                        previousStep = step;
                    }
                    break;
                case 4:
                    {

                        $scope.VisibleStep1 = false;
                        $scope.VisibleStep2 = false;
                        $scope.VisibleStep3 = false;
                        $scope.VisibleStep4 = true;
                        $scope.VisibleStep5 = false;
                        step = "step4";
                        previousStep = step;
                    }
                    break;
                case 5:
                    {
                       
                        $scope.VisibleStep1 = false;
                        $scope.VisibleStep2 = false;
                        $scope.VisibleStep3 = false;
                        $scope.VisibleStep4 = false;
                        $scope.VisibleStep5 = true;
  
                        
                        var objs = stage.getChildren().filter(function (o) {
                            return o.userData.entity && !objectCheckerSrvc.isWall(o) && !objectCheckerSrvc.isFloor(o);
                        });

                        $rootScope.$broadcast('calculateSPL', { objects: objs  });

                        $scope.projectData = $rootScope.editedRoomData ? $rootScope.editedRoomData.projectDetails.project :
                            ShoppingListService.getData();
                        step = "step5";
                        previousStep = step;
                    }
                    break;
            }

            $scope.menuActiveStep = data.index;

            if (!isSilent) {
                $scope.activeView = data.index;
            }

            step = step ? step : previousStep;
            $rootScope.$broadcast('stepActive', step, data.wallView, data.reset3DCamera);
            applyScope();
        });

        $scope.visibleSteppp = function (step, index) {
            //$scope.menuActiveStep = index;
            $rootScope.$broadcast('changeStep', { index: index, step: step });
            $rootScope.$broadcast('hidePrintPopup', '');
        };

        $scope.stepByStepArray = $scope.menu;

        var stepActive = $rootScope.$on('stepActive', function (events, step, wallView, reset3DCamera) {

            engine.activateStepRelatedComponents(step);

            $timeout(function () {
                stage.resize();
            }, 200);

            if (roomStateManager.hasPoints())
                sceneStepBindings[step](reset3DCamera);
        });

        $scope.$on('SelectRoom', function (events, room) {
            var key = AuthenticationService.userId() || 'unauthorized';
            localStorageService.remove(key);
            if (($location.$$path === '/browsing/' + $routeParams.room_id)
                || ($location.$$path === '/planning/' + $routeParams.room_id)) {
                $location.path('/planning', false);
                $scope.projectDetails.title = '';
                $scope.projectDetails.saveAsNewProject = true;
                $scope.projectDetails.saveAsSuite = false;
            }
            $rootScope.userSave_RoomData = null;

            //Scene2d.clean();
            //Scene2d.render();

            drawCustomRoomComponent.enable();

            $scope.room = room;

            $scope.dataUnitFT = constants.wallUnitLength.FT = true;
            $scope.dataUnitM = constants.wallUnitLength.M = false;

            customRoomFlag = true;

            $rootScope.$broadcast('changeStep', { index: 1, step: 'Size Cellar' });

            // reset var root scope
            $rootScope.allowMoveTouchPoint = true;

            roomStateManager.clearCurrentRoomState();
            screenShotStoreSrvc.clearScreenshotObject();
            cameraManager.clearState();
            stage.clean();
            wallNumberSrvc.clear();
            $rootScope.$broadcast('reset');
        });

        var updateCanvas2d = $rootScope.$on('updateCanvas2d', function (event, args) {
            var side = args.result.side;
            var exist_depth = args.result.depth;
            $scope.changeFigureSide(side, exist_depth);
        });

        var updateTableCM = $rootScope.$on('updateTableCM', function () {
            $scope.$apply();
        });

        // change checkbox item and set $rootScope.allowMoveTouchPoint
        $scope.changeAllowMoveTouchPoint = function () {
            $rootScope.allowMoveTouchPoint = !$rootScope.allowMoveTouchPoint;
            var popupPoint = angular.element('.popup-info-point');
            popupPoint.fadeOut('slow');
        };

        //  $scope.zoom = 1;
        var wallBeyondCamera = $rootScope.$on('wallBeyondCamera', function (events, params) {
            engine2DSrvc.get().findComponentByType(ZoomCamera).zoomInOut(1);
        });

        function applyScope() {
            $timeout(function () {
                $scope.$apply();
            }, 180);
        };

        function restoreProjectSettings() {
            if ($scope.projectDetails) {
                if ($rootScope.editedRoomData) {
                    $scope.projectDetails.title = $rootScope.editedRoomData.titleProject;
                    $scope.projectDetails.address = $rootScope.editedRoomData.projectDetails.address;
                    $scope.projectDetails.contact = $rootScope.editedRoomData.projectDetails.contact;
                }
                if ($rootScope.isTemplate && !AuthenticationService.publisher()) {
                    $scope.projectDetails.saveAsNewProject = true;
                }
                else {
                    $scope.projectDetails.saveAsNewProject = false;
                }
            }
        }

        var buildRoom = function (pts, wallNumbersVisibility) {

            roomStateManager.setPoints(pts);

            var walls = room2DBuilder.buildWalls(pts);
            var cp = room2DBuilder.buildConnectionPoints(pts);
            var floor = room2DBuilder.buildFloor(pts);
            var wn = wallNumberSrvc.get(walls.length, false);

            stage.addMany(walls);
            stage.addMany(cp);
            stage.add(floor);
            stage.add(wn);

            wallNumberSrvc.setVisibility(wallNumbersVisibility);
        };

        var loadRoom = $rootScope.$on('loadRoom', handleLoadRoomEvent);

        function handleLoadRoomEvent(e, record) {

            var data = record.data;

            stage.clean();
            roomStateManager.clearCurrentRoomState();
            cameraManager.clearState();
            wallNumberSrvc.clear();

            drawCustomRoomComponent.disable();

            //var r = geometryHelper.isClockwisePolygon(data.points);
            //alert(r);

            var pts = [];

            for (var i = 0; i < data.points.length; i++) {
                var p = data.points[i];
                //var v = new THREE.Vector3(p.x, p.y, 0);
                // v.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
                pts.push({
                    x: p.x,
                    z: -p.y,
                    depth: p.depth
                });
            }

            buildRoom(pts, true);

            $rootScope.allowMoveTouchPoint = true;
            customRoomFlag = false;

            //objects2DSerializer.deserialize(data.objects);

            roomStateManager.setWallMaterial(data.wallColorScheme);
            roomStateManager.setFloorMaterial(data.floorColorScheme);

            $scope.menuActiveStep = 1;
            $rootScope.$broadcast('changeStep', { index: 1, step: 'Size Cellar' });
            restoreProjectSettings();
            screenShotStoreSrvc.loadScreenshot(record.screenshot);
            $rootScope.$broadcast('initScreenshotArray');
            $rootScope.$broadcast('changeFloorArea');

            // $rootScope.$broadcast('initParamsReport', record.report.product);

            //$timeout(function () {
            //    Scene2d.resize();
            //    scene3D.resize();
            //}, 500);

            $scope.isLoading = false;
            if (record.step) {
                // console.debug("Change step");
                $rootScope.$broadcast('changeStep', record.step);
            }
        };

        $rootScope.logout = function () {
            localStorageService.clearAll();
            //console.log("LogOut user clear localStorageService = ", localStorageService);
            //console.log("logout $scope.userAccount = ", $scope.userAccount);
            $scope.userAccount = {};
            $rootScope.templateMaster = false;
            $rootScope.userLogged = false;
            $location.path("/login");
        };

        var goBackToProjectUnsubscribe = $rootScope.$on('GoBackToProject', function () {
            if (roomStateManager.hasPoints()) {
                //$location.path("/planning");
                //$scope.menuActiveStep = 1;
                $rootScope.$broadcast('changeStep', { index: 1, step: 'Size Cellar' });
                //$rootScope.$broadcast('stepActive', 'step2');
                $rootScope.$broadcast('initScreenshotArray');
            }
        });

        var sceneReadyUnsubscribe = $rootScope.$on('Scene ready', function (e, data) {
            $scope.sceneReady = true;
            var key = AuthenticationService.userId() || 'unauthorized';
            // console.debug("key", key);
            var info = localStorageService.get(key);
            if (info) {
                if (info.data) {
                    $rootScope.isTemplate = false;
                    $rootScope.editedRoomData = info;
                    $rootScope.notStep = false;
                    handleLoadRoomEvent(null, info);
                    SaveStateService.clearSavedState();
                } else {
                    $scope.sceneReady = false;
                    $location.path(info);
                }
            }
        });

        $scope.$on('shopping list ready', function (e, data) {
            if ($scope.sceneReady && $rootScope.editedRoomData) {
                $scope.sceneReady = false;
                restoreProjectSettings();
                $rootScope.$broadcast('calculateSPL', SaveStateService.prepareSLData($rootScope.editedRoomData.data.objects));
            }
        });

        var customRoomCreatedUnsubscribe = drawCustomRoomComponent.on('created', function (points) {
            buildRoom(points, false);
        });

        $scope.$on('$destroy', function () {
            loadRoom();
            wallBeyondCamera();
            stepActive();
            updateCanvas2d();
            updateTableCM();
            goBackToProjectUnsubscribe();
            sceneReadyUnsubscribe();
            customRoomCreatedUnsubscribe();
        });

        $scope.startNewProj = function () {
            console.debug("Start new proj");
            $location.path("#/planning");
            SaveStateService.setHideWelcomeOn1st();
        }

    }]);
