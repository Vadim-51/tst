(function () {

    var service = function ($http, toastr) {
        return {
            sendEmail: function (data) {
                //console.log(data);
                $http({method: 'POST', url:'/share/send-email', data: data}).
                    success(function (result) {
                        console.log("_ajaxRequest success");
                        toastr.success('Email sent');
                    }).
                    error(function (result) {
                        console.log("_ajaxRequest error");
                    }
                );
            },

            share: function(img){
                var data={
                    img: img
                };
                $http({method: 'POST', url:'http://95.85.31.212:7000share/social', data: data}).
                    success(function (result) {
                        //console.log("_ajaxRequest success");
                        //console.log(result);
                        //toastr.success('Email sent');
                        //location.href = result.redirect;
                        window.open(result.redirect, "_blank");

                    }).
                    error(function (result) {
                        //console.log("_ajaxRequest error");
                        //console.log(result);
                        //deferred.reject(data);
                    }
                );
            }
        }

    };

    angular.module('vigilantApp').service('SocialShare', ['$http', 'toastr', service]);


})();
