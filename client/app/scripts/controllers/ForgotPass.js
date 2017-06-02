'use strict';

angular.module('vigilantApp').controller('ForgotPass', ['$scope', '$location', 'ResourceService', 'CryptoJSService', 'toastr',
    '$routeParams', '$timeout',
  function ($scope, $location, ResourceService, CryptoJSService, toastr, $routeParams, $timeout) {

    $scope.sendMail = function () {
      var email = $scope.email;
      //console.log("send email = ", email);
      var salt = email;
      var temporaryToken = CryptoJS.PBKDF2(email, salt, {keySize: 256 / 32});
      var sendData = {"email": email, "token": temporaryToken.toString()};

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
        noty({text: 'Username and password are mandatory!', timeout: 2000, type: 'error'});
      }
    };

    $scope.sendNewPassword = function () {

      if ($routeParams.user_id && $scope.reset.newPassword === $scope.reset.confirmPassword) {

        var data = {
          pass: $scope.reset.newPassword,
          user_id: $routeParams.user_id
        };

        ResourceService.resetPass(data, $routeParams.user_id).then(function (data) {
          $scope.reset = {
            newPassword: '',
            confirmPassword: ''
          };

          toastr.success(data.msg);

          $timeout(function () {
            $location.path("/login");
          }, 200);

        }, function (data, status) {
          if (status === 400) {
            toastr.error(data.message);
          } else {
            toastr.error(data);
          }
        });
      }
      else{
        toastr.error('Field New Password and Confirm Password must be equal!');
      }
    }

  }]);
