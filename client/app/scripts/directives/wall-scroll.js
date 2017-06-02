(function() {

    var directive = function (scene3D, $window, wall3DDataManager, engine3DSrvc) {

        return {
            restrict: 'E',
            templateUrl: '/views/wall-scroll.html',
            replace: true,
            scope: {},
            link: function(scope, element) {

                var scrollElement = element.find('.scroll'),
                    scrollHeadElement = scrollElement.find('.scroll-track'),
                    isDragging = false,
                    mouseDownPosition,
                    currentHeadPosition,
                    scrollBodyLength,
                    scrollHeadLength,
                    isResized = false;//,
                   // viewWallComponent = engine3DSrvc.getEngine().findComponentByType(WallView);

                scope.hideScroll = true;

                scope.scrollToCorner = function(corner) {
                    var position = null;
                    switch (corner) {
                    case 'left':
                        position = 0;
                        break;
                    case 'right':
                        position = scrollBodyLength - scrollHeadLength;
                        break;
                    }
                    if (angular.isNumber(position)) {
                        viewWallComponent.scrollToCorner(corner);
                        currentHeadPosition = position;
                        scrollHeadElement.css('left', currentHeadPosition);
                    }
                };

                var getXCoordinate = function(e) {
                    if (e.originalEvent.touches) {
                        var touch = e.originalEvent.touches.length > 0 ? e.originalEvent.touches[0] : e.originalEvent.changedTouches[0];
                        return touch.clientX - e.delegateTarget.getBoundingClientRect().left;
                    } else return e.offsetX;
                };

                var endDrag = function(e) {
                    e.preventDefault();
                    isDragging = false;
                };

                var dragStart = function(e) {
                    e.preventDefault();
                    mouseDownPosition = getXCoordinate(e);
                    isDragging = true;
                };

                var dragging = function(e) {
                    e.preventDefault();
                    if (isDragging) {
                        var offset = mouseDownPosition - getXCoordinate(e),
                            newPosition = currentHeadPosition - offset;
                        if (newPosition >= 0 && (newPosition + scrollHeadLength) <= scrollBodyLength) {
                            currentHeadPosition = newPosition;
                            scrollHeadElement.css('left', currentHeadPosition);
                            viewWallComponent.slideWall(currentHeadPosition, 0, scrollBodyLength - scrollHeadLength);
                        }
                    }
                };

                var update = function() {

                    if (viewWallComponent.isInWallMode()) {

                        var aspect = scene3D.getAspect(),
                            viewedWall = viewWallComponent.getActiveWallName(),
                            slideData = wall3DDataManager.getScrollData(viewedWall),
                            visibleHeight = 2 * Math.tan(THREE.Math.degToRad(scene3D.getCameraFOV()) / 2) * slideData.currentDistanceFromWallToCamera.length(),
                            wallVisibleLength = visibleHeight * aspect,
                            wallLength = wall3DDataManager.getSize(viewedWall).length;

                        if (wallLength > wallVisibleLength) {

                            scope.hideScroll = false;

                            var bodyLength = scrollElement.width(),
                                visibleLengthToWallLength = (wallVisibleLength * 100) / wallLength,
                                headLength = (visibleLengthToWallLength * bodyLength) / 100,
                                hasValues = angular.isDefined(scrollBodyLength) && angular.isDefined(scrollHeadLength);

                            if (isResized && hasValues) {
                                isResized = false;
                                var prevBodyToHeadLength = -(scrollBodyLength - scrollHeadLength),
                                    positionDiff = (100 * currentHeadPosition) / prevBodyToHeadLength;
                                currentHeadPosition = (-(bodyLength - headLength) * positionDiff) / 100;
                            } else {
                                currentHeadPosition = (bodyLength - headLength) / 2;
                            }

                            scrollBodyLength = bodyLength;
                            scrollHeadLength = headLength;

                            scrollHeadElement.css('left', currentHeadPosition);
                            scrollHeadElement.width(headLength);

                        } else {
                            scope.hideScroll = true;
                            scrollBodyLength = scrollHeadLength = undefined;
                        }

                        scope.$applyAsync();
                    }
                };

                //var enterUnreg = viewWallComponent.on('enter', update);

                //var slideUnreg = viewWallComponent.on('wallSlide', function (min, max, val) {
                //    var sliderMinPosition = 0,
                //        sliderMaxPosition = scrollBodyLength - scrollHeadLength,
                //        position = (val - min) * ((sliderMaxPosition - sliderMinPosition) / (max - min)) + sliderMinPosition;
                //    currentHeadPosition = position;
                //    scrollHeadElement.css('left', position);
                //});

                //var leaveUnreg = viewWallComponent.on('leave', function () {
                //    scope.hideScroll = true;
                //    scope.$applyAsync();
                //});

                var onWindowResize = function() {
                    isResized = true;
                    update();
                    scope.$applyAsync();
                };

                scrollHeadElement.on('mousedown', dragStart);
                scrollHeadElement.on('touchstart', dragStart);
                scrollHeadElement.on('mousemove', dragging);
                scrollHeadElement.on('touchmove', dragging);
                scrollHeadElement.on('mouseleave', endDrag);
                scrollHeadElement.on('mouseup', endDrag);
                scrollHeadElement.on('touchend', endDrag);

                $window.addEventListener('resize', onWindowResize, false);

                scope.$on('$destroy', function() {
                    $window.removeEventListener('resize', onWindowResize, false);
                    //leaveUnreg();
                    //slideUnreg();
                    //enterUnreg();
                });
            }
        }
    };

    angular.module('vigilantApp').directive('wallScroll', ['scene3D', '$window', 'wall3DDataManager', 'engine3DSrvc', directive]);
})();