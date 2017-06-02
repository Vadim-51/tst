; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/productsListNew.html',
            restrict: 'E',
            scope: {
                entityClickCallback: "&entityClickCallback"
            },
            controller: controller
        };
    };

    var dependencies = ['$scope', 'roomStuff', 'ResourceService', 'constants'];

    var controller = function ($scope, roomStuff, ResourceService, constants) {

        var entityClickCallback = $scope.entityClickCallback();

        $scope.rootItems = [
            {
                text: 'Vigilant',
                isActive: false,
                _id: 'rootVigilant'
            }, {
                text: 'Generic',
                isActive: false,
                _id: 'rootGeneric'
            }
        ];
        $scope.nodeItems = [];
        $scope.entities = [];

        var currentNodeId;

        var allItems;
        
        ResourceService.getAllLeftMenuItems().then(function (response) {
            allItems = response;
            $scope.switchRoot($scope.rootItems[0]);
        })

        var setActiveRootItem = function (choosenRootItem) {
            var i = 0,
                rootItems = $scope.rootItems,
                rootItem;
            for (; i < rootItems.length; i++) {
                rootItem = rootItems[i];
                rootItem.isActive = rootItem === choosenRootItem;
            }
        };

        var getNodeItems = function (nodeId) {
            var result = [],
                i = 0,
                item,
                node;

            for (; i < allItems.length; i++) {
                item = allItems[i];
                node = item._id === nodeId ? item : node;
                if (item.parentId === nodeId)
                    result.push(item);
            }

            if (node) {
                result.unshift({
                    text: node.text,
                    _id: node.parentId
                });
            }

            return result;
        };

        var getEntities = function (nodeId) {
            return roomStuff.getLeftMenuItemProductsByMenuId(nodeId);
        };

        var filterEntities = function (entities, filterTxt) {
            var i = 0,
                entity,
                result = [];

            for (; i < entities.length; i++) {
                entity = entities[i];
                if (entity.description.toLowerCase().indexOf(filterTxt) !== -1)
                    result.push(entity);
            }

            return result;
        };

        $scope.switchRoot = function (choosenRootItem) {
            setActiveRootItem(choosenRootItem);
            $scope.nodeItems = getNodeItems(choosenRootItem._id);
            $scope.entities = [];
        };

        $scope.nodeClick = function (item) {
            currentNodeId = item._id;
            $scope.nodeItems = getNodeItems(currentNodeId);
            var entities = getEntities(currentNodeId);
            $scope.entities = entities ? entities.filter(function (ent) {
                return ent.height <= constants.wallHeight;
            }) : [];
        };

        $scope.entityClick = function (entity, e) {
            e.preventDefault();
            if (entityClickCallback) {
                entityClickCallback(entity);
            }
        };

        $scope.search = function (searchTxt) {
            if ($scope.entities.length !== 0) {
                $scope.entities = filterEntities(getEntities(currentNodeId), searchTxt);
            }
        };

        // $scope.switchRoot($scope.rootItems[0]);
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('productsListNew', directive);

})();
