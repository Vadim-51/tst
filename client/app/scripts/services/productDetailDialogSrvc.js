; (function () {
    'use strict';

    var dependencies = ['ngDialog'];

    var service = function (ngDialog) {

        return {
            show: function (item, mesh, sender, item2d) {
                ngDialog.open({
                    disableAnimation: true,
                    template: '/views/productDetails.html',
                    className: 'ngdialog-theme-default product-details-popup',
                    data: {
                        item: item,
                        mesh: mesh,
                        sender: sender,
                        item2d: item2d
                    },
                    controller: 'ProductDetailsController'
                });
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('productDetailDialogSrvc', service);

})();
