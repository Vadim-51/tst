(function () {

    var directive = function () {
        return {
            restrict: 'E',
            templateUrl: '/views/previewSPL.html',
            replace: false,
            scope: {
              count: '=',
              save: '&',
              total: '=',
              report: '@'
            },
            controller: ['$scope', 'ngDialog', 'constants', 'Scene2d', '$rootScope', 'roomStateManager', 'ShoppingListService',
                '$http', 'localStorageService', '$window', 'printService', 'ResourceService', 'SaveStateService',
                function ($scope, ngDialog, constants, Scene2d, $rootScope, roomStateManager, ShoppingListService, $http,
                localStorageService, $window, printService, ResourceService, SaveStateService) {

                    var total = 0;
                    $scope.checkSubfloorSPL = true;
                    $scope.UnitFT = constants.wallUnitLength.FT;
                    $scope.projectData = {};
                    $scope.setSubFloor = true;
                    $scope.productData = [];
                    $scope.extStyle = {};
                    $scope.intStyle = {};
                    
                    function findProduct(id, color) {
                        for (var i = 0; i < $scope.productData.length; i++) {
                            if ($scope.productData[i].id === id && $scope.productData[i].color === color) {
                                return i;
                            }
                        }
                        return -1;
                    }

                    function getDimensions(product){
                      if(product.objectType === constants.ObjectType.CABINET){
                        var length = Math.round(product.width / 2.54);
                        var width = Math.round(product.length / 2.54);
                        product.length = length;
                        product.width = width;
                      }else{
                        product.width = Math.round(product.width / 2.54);
                        product.length = Math.round(product.length / 2.54);
                      }
                      product.height = Math.round(product.height / 2.54);
                    }

                    $scope.chooseColor = function(color){
                      return "images/colors/"+color+".png";
                    }

                    function fixWallPanelQuantity(){
                        for(var i = 0; i<$scope.productData.length; i++){
                            if($scope.productData[i].objectType === constants.ObjectType.WALL_PANEL){
                                $scope.productData[i].quantity = Math.ceil($scope.productData[i].quantity/2);
                            }
                        }
                    }

                    $rootScope.$on('calculateSPL', function (event, param) {
						console.log("I am hearing from calculateSPL------------------------")
                        if(!param) return;
                        $scope.productData = [];
                        for (var i = 0; i < param.objects.length; i++) {
                          var product = param.objects[i].userData? param.objects[i]
                            : param.objects[i].object;
                            if (product.userData.entity.objectType === constants.ObjectType.CABINET
                                || product.userData.entity.objectType === constants.ObjectType.TABLE
                                || product.userData.entity.objectType === constants.ObjectType.WALL_PANEL) {
                                var color = roomStateManager.getColorSchemeByObjectId(product.uuid);
                                color = color? color.scheme: product.userData.choosenColor;
								console.log("product.userData.entity", product.userData.entity);
								
                                var indx = -1;
                                if(color){
                                  indx = findProduct(product.userData.entity.id, color);
                                }
                                if (indx === -1) {
                                    var temp = JSON.stringify(product.userData.entity);
                                    temp = JSON.parse(temp);
                                    temp.quantity = 1;
                                    temp.color = color?color:'';
                                    // Replace this check
                                    temp.sku = (temp.color.length > 2)?temp.base_model_name:
                                        temp.base_model_name+temp.color;
                                    temp.img = "../images/ProductImage/"+temp.sku+".png";
                                    //temp.hikId = temp.hikashop_id_to_color_scheme[temp.color];
                                    getDimensions(temp);
                                    $scope.productData.push(JSON.stringify(temp));
                                    var len = $scope.productData.length;
                                    $scope.productData[len-1] = JSON.parse($scope.productData[len-1]);
									console.log("###productData###", $scope.productData);
                                } else {
                                    $scope.productData[indx].quantity++;
                                }
                            }
                        }
                        $scope.count = $scope.productData.length;
                        for(var i = 0; i<$scope.productData.length; i++){
                          $scope.productData[i].$$hashKey="object:"+i;
                        }
                        fixWallPanelQuantity();
                        $scope.projectData.totalAmount = $scope.getTotal();
                        $scope.total = $scope.projectData.totalAmount;
                        // if (param.product)
                        //     initParamsReport(param.product);
                        if (location.hash == '#/account') {
                            $scope.isShowChecked = false;
                            $scope.isShowTypePanels = false;
                        }
                        else {
                            $scope.isShowChecked = true;
                            $scope.isShowTypePanels = true;
                        }
                        $scope.buildList(param);
                        ShoppingListService.setData($scope.projectData);
                    });
                    $scope.buildList = function (apart) {
                        $scope.resetSPLValua();
                        //if(!apart.wallCollection){return;}
                        ShoppingList.list = CreateShoppingList(roomStateManager, constants);

                        console.warn(ShoppingList.list);
                        $scope.dataList = ShoppingList.list;
                        if (constants.wallUnitLength.FT) {
                            $scope.projectData.LinearLength = convertMToFT($scope.dataList.roomLinearLength);
                            $scope.projectData.FloorArea = convertM2ToFT2($scope.dataList.floorArea);
                            $scope.projectData.WallArea = convertM2ToFT2($scope.dataList.wallArea);
                        }
                        else {
                            $scope.projectData.LinearLength = $scope.dataList.roomLinearLength.toFixed(2);
                            $scope.projectData.FloorArea = $scope.dataList.floorArea.toFixed(2);
                            $scope.projectData.WallArea = $scope.dataList.wallArea.toFixed(2);
                        }
                        $scope.projectData.countWall = $scope.dataList.countWall;
                        $scope.projectData.totalAmount = $scope.getTotal();

                    };
                    $rootScope.$on('changeUnitInSPL', function () {
                        if (constants.wallUnitLength.FT) {
                            if ($scope.dataList) {
                                $scope.projectData.LinearLength = convertMToFT($scope.dataList.roomLinearLength);
                                $scope.projectData.FloorArea = convertM2ToFT2($scope.dataList.floorArea);
                                $scope.projectData.WallArea = convertM2ToFT2($scope.dataList.wallArea);
                            }
                            $scope.UnitFT = constants.wallUnitLength.FT;
                        }
                        else {
                            $scope.UnitFT = false;
                            if ($scope.dataList) {
                                $scope.projectData.LinearLength = $scope.dataList.roomLinearLength.toFixed(2);
                                $scope.projectData.FloorArea = $scope.dataList.floorArea.toFixed(2);
                                $scope.projectData.WallArea = $scope.dataList.wallArea.toFixed(2);
                            }
                        }
                    });
                    $scope.$watch('projectData', function (val) {
                        if (val) {
                            ShoppingListService.setData(val);
                        }
                    });

                    $scope.resetSPLValua = function () {
                        $scope.dataList = 0;
                        $scope.projectData = {};
                    };
                    // $scope.checkIncludSubfloorInSPL = function () {
                    //     $scope.checkSubfloorSPL = !$scope.checkSubfloorSPL;
                    // };

                    // $scope.changeSubFloorType = function () {
                    //     if ($scope.isShowTypePanels) {
                    //         $scope.setSubFloor = !$scope.setSubFloor;
                    //     }
                    // };

                    // $scope.$watch('checkSubfloorSPL', function (newVal, oldVal) {
                    //     ShoppingListService.setParamsIncludeSubfloorToAmount($scope.checkSubfloorSPL);
                    // });
                    // $scope.$watch('setSubFloor', function (newVal, oldVal) {
                    //     ShoppingListService.setParamsSubfloorActive($scope.setSubFloor);
                    // });

                    // $rootScope.$on('initParamsReport', function (event, param) {
                    //     initParamsReport(param);
                    // });
                    // function initParamsReport(param) {
                    //     if (param) {
                    //         $scope.checkSubfloorSPL = param.isDRSBF;
                    //         $scope.setSubFloor = param.isSBF;
                    //     }
                    // }
                    // $scope.removeProduct = function (product, color) {
                    //     var indx = findProduct(product, color);
                    //     if (indx != -1) {
                    //         $scope.productData.splice(indx, 1);
                    //     }
                    // };

                    $scope.getTotal = function () {
                        var sum = 0;
                        for (var i = 0; i < $scope.productData.length; i++) {
                            sum += ($scope.productData[i].msrp * $scope.productData[i].quantity);
                        }
                        return sum;
                    };
                    $scope.getItemCount = function () {
                        var count = 0;
                        for (var i = 0; i < $scope.productData.length; i++) {
                            count += $scope.productData[i].quantity;
                        }
                        return count;
                    };
                    $scope.sendToCart = function () {
                        if($scope.report){
                            SaveStateService.saveRoute("/account");
                        }else{
                            $scope.save({
                                stepObj: {
                                    index: 4,
                                    step: 'Price & Purchase'
                                }
                            });
                        }
                        var sid = localStorageService.get("ce_sid_id");
                        var sidName = localStorageService.get("ce_sid_name");
                        ResourceService.sendToCart(sid, sidName, $scope.productData)
                            .then(function(){
                                window.parent.location = document.referrer;
                            })
                            .catch(function(err){
                                console.debug("Err", err);
                            });
                    };


                    $scope.printSPL = function(){
                      var toPrint = angular.element('#sl')[0].innerHTML;
                      var text = angular.element('#text')[0].innerHTML;
                      var prompt = angular.element('#prompt')[0].innerHTML;
                      var html = '<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Didact+Gothic">';
                      html += '<link rel="stylesheet" href="styles/forPrint.css"></head>';
                      html+='<body><img src="images/ceg-horizontal-logo.png" alt="logo" class="logo"';
                      html+=text+prompt;
                      html+=toPrint+'</body></html>';
                    //   var popup = window.open('', '_blank', 'width=600,height=400');
                    //   popup.document.write(html);
                      printService.createPrintPopup(html);
                    };

                    $scope.$emit('shopping list ready', null);

                }]
        }
    };

    angular.module('vigilantApp').directive('shoppingList', directive);
})();
