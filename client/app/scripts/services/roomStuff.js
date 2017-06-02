(function () {
    // REFACTOR
    var service = function (constants, ResourceService, $http, $rootScope, lodash) {

        var abilities = constants.ItemOption;

        var classic77 = [],
            estate92 = [],
            halfHeight = [],
            kit = [];

        var windows = [],
            doors = [],
            columns = [],
            lighting = [];

        var all = [],
            allGeneric = [];
        var sortedProducts = {};

        var sortedObject = {};

        ResourceService.getProducts().then(function (response) {
            var resp = response;

            angular.forEach(resp, function (product) {
                if (product.visible) {

                    product.id = product._id;
                    product.swapImg = product.swapImage;

                    if (!product.isGeneric) {

                        product.leftMenuImg = product.leftMenuImg || product.slImg;
                        product.type = constants.CabinetType.TOOL_STORAGE;
                        product.objectType = constants.ObjectType.CABINET;
                        product.abilities = [abilities.ROTATE];
                    }

                    if (product.left_menu_alias === "Windows") {
                        all.push(angular.extend(new constants.RoomObject.Window(), product));
                    }
                    else if (product.left_menu_alias === "Doors - Entry") {
                        all.push(angular.extend(new constants.RoomObject.Door(), product));
                    }
                    else {
                        all.push(angular.extend(new constants.RoomObject.Cabinet(), product));
                    }
                }
            });

            sortedObject = lodash.groupBy(all, "left_menu_alias");
            // console.log(sortedObject);

            // sortedProducts.classic77 = classic77;
            // sortedProducts.estate92 = estate92;
            // sortedProducts.halfHeight = halfHeight;
            // sortedProducts.kit = kit;
            // sortedProducts.windows = windows;
            // sortedProducts.doors = doors;
            // sortedProducts.columns = columns;
            // sortedProducts.lighting = lighting;
            $rootScope.$broadcast('Items loaded', null);
        });

        var _filterByHeight = function (height) {
            for (var key in sortedProducts) {
                var temp = sortedProducts[key].filter(function (el, i, arr) {
                    return (height > el.height);
                });
                this[key] = temp;
            }
        };

        return {
            // classic77: classic77,
            // estate92: estate92,
            // halfHeight: halfHeight,
            // kit: kit,
            // columns: columns,
            // lighting: lighting,
            // windows: windows,
            // doors: doors,
            getLeftMenuItemProductsByMenuId: function (id) {
                return sortedObject[id];
            },
            getById: function (id) {

                var i = 0, item;
                for (; i < all.length; i++) {
                    item = all[i];
                    if (item.id === id)
                        return item;
                }
                return null;
            },
            filterByHeight: _filterByHeight
        }
    };

    angular.module('vigilantApp').service('roomStuff', ['constants', 'ResourceService', '$http',
        '$rootScope', 'lodash', service]);

})();
