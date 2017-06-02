(function () {

    var directive = function (screenShotStoreSrvc, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: '/views/screenshot-button.html',
            replace: true,
            scope: {
                menuRight: '=',
                format: '@',
                dropup: '@',
                step: '@'
            },
            link: function postLink(scope, element, attrs) {
                $rootScope.$on('initScreenshotArray', function () {
                    scope.screenshots = screenShotStoreSrvc.getScreenshotForStep(scope.step);
                    scope.selected = (scope.screenshots.length > 0) ? scope.screenshots[0] : '';
                });
            },
            controller: ['$scope', 'ngDialog', 'Scene2d', 'SocialShare', 'screenShotStoreSrvc',
            'AuthenticationService', 'ResourceService', 'toastr', '$rootScope', 'printService',
            'screenshotPreprocess', 'scene3DScreenshotSrvc',
                function ($scope, ngDialog, Scene2d, SocialShare,
                  screenShotStoreSrvc, AuthenticationService, ResourceService, toastr, $rootScope,
                  printService, screenshotPreprocess, scene3DScreenshotSrvc) {

                    $scope.screenshots = [];
                    $scope.selected = $scope.screenshots[0];


                    $rootScope.$on('reset', function () {
                        $scope.screenshots = [];
                        $scope.selected = ($scope.screenshots.length > 0) ? $scope.screenshots[0] : '';
                    });

                    $scope.selectScreenshot = function (screenshot) {
                        $scope.selected = screenshot;
                    };
                    $rootScope.loadScreenshotStep = function (step) {
                        $scope.screenshots = screenShotStoreSrvc.getScreenshotForStep(step);
                        $scope.selected = ($scope.screenshots.length > 0) ? $scope.screenshots[0] : '';
                    };

                    $scope.takeScreenshot = function () {
                        var screenshot;
                        if ($scope.format === 'two-dimensional') {
                            screenshot = screenshotPreprocess.clipEmptySpace2D(Scene2d.getSnapShots());
                        }
                        else {
                            screenshot = scene3DScreenshotSrvc.take();
                        }
                        if (AuthenticationService.publisher()) {
                            ResourceService.TemplateScreenShotSaveToUploads(screenshot).then(function (data) {
                                console.log('image save');
                                $scope.screenshots = screenShotStoreSrvc.pushScreenshotToStep($scope.step, data.url);
                                $scope.selected = $scope.screenshots[0];
                            },
                                function (error) {
                                    toastr.error(error);
                                });
                        }
                        else {
                            ResourceService.screenShotSaveToUploads(screenshot).then(function (data) {
                                console.log('image save');
                                $scope.screenshots = screenShotStoreSrvc.pushScreenshotToStep($scope.step, data.url);
                                $scope.selected = $scope.screenshots[0];
                            },
                                function (error) {
                                    toastr.error(error);
                                });
                        }
                    };

                    $scope.deleteScreenshot = function () {
                        var index = $scope.screenshots.indexOf($scope.selected),
                            newIndex = index - 1;
                        console.log('$scope.screenshots[index]');
                        console.log($scope.screenshots[index]);
                        ResourceService.screenshotDelete($scope.screenshots[index].image.slice(20, 33)).then(function (data) {
                            console.log('screenshot deletion');
                            $scope.screenshots.splice(index, 1);
                            screenShotStoreSrvc.deleteScreenshotFromStep($scope.step, $scope.screenshots);
                            newIndex = newIndex < 0 ? 0 : newIndex;
                            $scope.selected = $scope.screenshots[newIndex];
                        },
                            function (error) {
                                toastr.error(error);
                            });

                    };

                    $scope.OpenSocialShare = function () {
                        //console.log($scope.selected);
                        SocialShare.share($scope.selected.image);
                    };

                    $scope.slide = function (direction, e) {
                        var screenshotsContainer = e.delegateTarget.parentElement.parentElement.children[1];
                        screenshotsContainer.scrollLeft += 70 * direction;
                    };

                    $scope.goFullScreen = function () {
                        var elem = document.getElementById("screenshot");
                        if (elem.requestFullscreen) {
                            elem.requestFullscreen();
                        } else if (elem.msRequestFullscreen) {
                            elem.msRequestFullscreen();
                        } else if (elem.mozRequestFullScreen) {
                            elem.mozRequestFullScreen();
                        } else if (elem.webkitRequestFullscreen) {
                            elem.webkitRequestFullscreen();
                        }
                    }

                    $scope.switch = function (direction) {
                        var currentIndex = $scope.screenshots.indexOf($scope.selected),
                            newIndex = currentIndex + direction;
                        if (newIndex >= 0 && newIndex <= $scope.screenshots.length - 1)
                            $scope.selected = $scope.screenshots[newIndex];
                    };

                    $scope.viewScreenshots = function () {
                        ngDialog.open({
                            scope: $scope,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default screenshots-popup',
                            template: '/views/screenshotsPopUp.html'
                        });
                    };

                    $scope.printScreenshot = function(){
                      var screenshotSrc = angular.element("#screenshot")[0].src;
                      var html = '<html><head><link rel="stylesheet" href="styles/forPrint.css">'
                      html+='</head>';
                      html+='<body><img id = "screenshot" src="'+screenshotSrc+'" alt="cellar"/>';
                      html+='</body></html>';
                      printService.createPrintPopup(html);
                    };

                }]
        }
    };

    angular.module('vigilantApp').directive('screenshotButton', ['screenShotStoreSrvc', '$rootScope', directive]);
})();
