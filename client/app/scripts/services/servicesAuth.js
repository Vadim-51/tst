//var driCoreServices = angular.module('vigilantApp.driCoreServices', []);

angular.module('vigilantApp.driCoreServices').service('TokenInterceptor', ['$q', '$location', 'localStorageService', 'toastr', function ($q, $location, localStorageService, toastr) {
  return {
    request: function (config) {
      config.headers = config.headers || {};

      console.log('config.headers');
      console.log(config.headers);

      if (localStorageService.get("auth_token") !== null)
        config.headers.Authorization = 'Bearer ' + localStorageService.get("auth_token");

      return config;
    },

    response: function (response) {
      return response || $q.when(response);
    },
    responseError: function (response) {

      //console.log('response from TokenInterceptor, response = ', response);

      if (response.config.url !== "/login" && response.status === 401) {
        localStorageService.clearAll();
        $location.path("/login");
        toastr.error("You have to perform signin to earn access to privileged resources!");
      }

      return $q.reject(response);

    }
  };
}]);

angular.module('vigilantApp.driCoreServices').service('AuthenticationService', ['localStorageService', function (localStorageService) {
  return {
    isLogged: function () {
      var logged = false;
      if (localStorageService.get("auth_token") !== null || localStorageService.get("guest") !== null)
        logged = true;

      return logged;
    },
    isAuthenticated: function () {
      var authenticated = false;
      if (localStorageService.get("auth_token") !== null)
        authenticated = true;

      return authenticated;
    },
    userLogged: function () {

      return localStorageService.get("user")


    },
    userId: function () {
      console.log(localStorageService.get("auth_token"));
      return localStorageService.get("auth_token")

    },
    mail: function () {
      return localStorageService.get("mail");
    },
    publisher: function () {
      return localStorageService.get("publisher") || false;
    }

  }
}]);

angular.module('vigilantApp.driCoreServices').service('ResourceService', ['$q', '$http', '$location', 'AuthenticationService', function ($q, $http, $location, AuthenticationService) {

  var _promises = {};

  var apiUrl = 'http://95.85.31.212:7000';
  var cartUrl = 'https://138.197.30.187';
  // var apiUrl = 'http://localhost:443';

  var _genericCallback = function (key, data) {
    console.log("CALL BACK _genericCallback PARAM KEY = ", key, " DATA = ", data);
    _promises[key] = data;
  };

  var _promisesGetter = function (method, URL, data, key, refresh) {
    if (!refresh && _promises[key] !== undefined) {
      return $q.when(_promises[key]);
    } else {
      return _ajaxRequest(method, URL, data, key);
    }
  };

  var _ajaxRequest = function (method, URL, data, key) {
    URL = apiUrl + URL;
    var deferred = $q.defer();
    $http({ method: method, url: URL, data: data }).
      success(function (data) {
        console.log("_ajaxRequest success");
        deferred.resolve(data);
        if (URL === "GET") {
          //console.log("_ajaxRequest URL === GET");
          _genericCallback(key, data);
        }
      }).
      error(function (data) {
        console.log("_ajaxRequest error");
        deferred.reject(data);
      }
      );
    //console.log("deferred = ", deferred);
    return deferred.promise;
  };
  var _sendToCart = function (sid, sidName, productData) {
    var init_url = cartUrl + "/index.php?option=com_hikashop&ctrl=product&task=updatecart&";
    for (var i = 0; i < productData.length; i++) {
      var hikashop_id = productData[i].color ?
        productData[i].hikashop_id_to_color_scheme[productData[i].color] :
        productData[i].hikId;
      init_url += 'data[' + hikashop_id + ']=' + productData[i].quantity + "&";
    }
    init_url += "checkout=1";
    var query = cartUrl + "/test.php";
    var deferred = $q.defer();
    $http.post(query,
      {
        url: init_url,
        cookie: sidName + '=' + sid
      },
      {
        headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8" }
      })
      .success(function (data) {
        deferred.resolve(data);
      })
      .error(function (err) {
        deferred.reject(err);
      })
    return deferred.promise;
  };

  return {
    signup: function (user) {
      //console.log("SIGNUP!!! client send user data user=", user);
      return _ajaxRequest('POST', '/users/register', user, null);
    },
    login: function (user) {
      //console.log("LOGIN!!! client send user data user=", user);
      return _ajaxRequest('POST', '/users/login', user, null);
    },
    forgotPass: function (data) {
      //console.log("FORGOT PASS!!! client send data =", data);
      return _ajaxRequest('POST', '/users/forgot', data, null);
    },
    resetPass: function (data, id) {
      //console.log("RESET PASS!!!");
      return _ajaxRequest('POST', '/users/reset-password/' + id, data, null);
    },
    getAllroom: function () {
      return _ajaxRequest('get', '/rooms/rooms/' + AuthenticationService.userId());
    },
    getAllTemplates: function () {
      return _ajaxRequest('get', '/templates/templates/');
    },
    getAllShownTemplates: function () {
      return _ajaxRequest('get', '/templates/showTemplates/');
    },
    deleteRoom: function (id) {
      return _ajaxRequest('delete', '/rooms/room/' + id, { _id: id }, null);
    },
    deleteTemplate: function (id) {
      return _ajaxRequest('delete', '/templates/template/' + id, { _id: id }, null);
    },
    saveRoom: function (data) {
      return _ajaxRequest('POST', '/rooms/room', data, null);
    },
    saveTemplate: function (data) {
      return _ajaxRequest('POST', '/templates/template', data, null);
    },
    updateRoom: function (id, data) {
      return _ajaxRequest('PUT', '/rooms/room/' + id, { id: id, room: data }, null);
    },
    updateTemplate: function (id, data) {
      return _ajaxRequest('PUT', '/templates/template/' + id, { id: id, room: data }, null);
    },
    getOne: function (id) {
      return _ajaxRequest('get', '/rooms/room/' + id, null, null);
    },
    getOneTemplate: function (id) {
      return _ajaxRequest('get', '/templates/template/' + id, null, null);
    },
    //getAllUsers: function () {
    //  return _ajaxRequest('get', '/users/all-users', null, null);
    //},
    getUserDataAccount: function (id_user) {
      return _ajaxRequest('get', '/users/getdata/' + id_user, { id_user: id_user }, null);
    },
    updateUserProfileData: function (id_user, data) {
      return _ajaxRequest('PUT', '/users/update/profile/' + id_user, { id_user: id_user, data: data }, null);
    },
    updateUserAuthData: function (id_user, data) {
      return _ajaxRequest('PUT', '/users/update/auth/' + id_user, { id_user: id_user, data: data }, null);
    },
    screenShotSaveToUploads: function (img_base64) {
      return _ajaxRequest('POST', '/rooms/save-screenshot', { image: img_base64 }, null);
    },
    TemplateScreenShotSaveToUploads: function (img_base64) {
      return _ajaxRequest('POST', '/templates/save-screenshot', { image: img_base64 }, null);
    },
    screenshotDelete: function (id) {
      return _ajaxRequest('delete', '/rooms/delete-screenshot/' + id, { id: id }, null);
    },
    TemplatesscreenshotDelete: function (id) {
      return _ajaxRequest('delete', '/templates/template/' + id, { _id: id }, null);
    },
    registerAdmin: function (data) {
      return _ajaxRequest('POST', '/admins/register', data, null);
    },
    loginAdmin: function (data) {
      return _ajaxRequest('POST', '/admins/login', data, null);
    },
    saveInLog: function (data) {
      return _ajaxRequest('POST', '/log/action', data, null);
    },
    getallaction: function () {
      return _ajaxRequest('get', '/log/getallaction');
    },
    getTotalAmountValue: function (data) {
      return _ajaxRequest('post', '/rooms/report-amount', data);
    },
    getRoomDataByUser: function (data) {
      return _ajaxRequest('post', '/rooms/get-rooms-by-user', data);
    },
    // not used
    getTotalTemplateAmountValue: function (data) {
      return _ajaxRequest('post', '/templates/report-amount', data);
    },
    getTemplateDataByUser: function (data) {
      return _ajaxRequest('post', '/templates/get-rooms-by-user', data);
    },
    getNewAccouts: function (data) {
      return _ajaxRequest('post', '/log/get-data-report-new-account', data);
    },
    getActivityAcounts: function (data) {
      return _ajaxRequest('post', '/log/get-data-report-activity', data);
    },
    getActivityUsersByPeriod: function (data) {
      return _ajaxRequest('post', '/log/get-activity-users', data);
    },
    getProducts: function () {
      return _ajaxRequest('get', '/products/products');
    },
    getCEGProducts: function () {
      return _ajaxRequest('get', '/products/productsCEG');
    },
    saveProduct: function (data) {
      return _ajaxRequest('post', '/products/product', data, null);
    },
    updateProduct: function (id, data) {
      return _ajaxRequest('PUT', '/products/product/' + id, { id: id, data: data }, null);
    },
    deleteProduct: function (id) {
      return _ajaxRequest('delete', '/products/product/' + id, { _id: id }, null);
    },
    getAllMaterials: function () {
      return _ajaxRequest('get', '/materials/materials/');
    },
    saveMaterial: function (data) {
      return _ajaxRequest('post', '/materials/material/', data, null);
    },
    updateMaterial: function (id, data) {
      return _ajaxRequest('PUT', '/materials/material/' + id, { id: id, data: data }, null);
    },
    deleteMaterial: function (id) {
      return _ajaxRequest('delete', '/materials/material/' + id, { _id: id }, null);
    },
    getAllSuites: function () {
      return _ajaxRequest('get', '/templates/suites');
    },
    updateSuite: function (id, data) {
      return _ajaxRequest('PUT', '/templates/suite/' + id, { id: id, data: data }, null);
    },
    deleteSuite: function (id) {
      return _ajaxRequest('delete', '/templates/suite/' + id, { _id: id }, null);
    },
    getAllColorSchemes: function () {
      return _ajaxRequest('get', '/colorSchemes/colorSchemes');
    },
    saveColorScheme: function (data) {
      return _ajaxRequest('post', '/colorSchemes/colorScheme/', data, null);
    },
    updateColorScheme: function (id, data) {
      return _ajaxRequest('PUT', '/colorSchemes/colorScheme/' + id, { id: id, data: data }, null);
    },
    deleteColorScheme: function (id) {
      return _ajaxRequest('delete', '/colorSchemes/colorScheme/' + id, { _id: id }, null);
    },
    sendToCart: function (sid, sidName, data) {
      return _sendToCart(sid, sidName, data);
    },
    getAllLeftMenuItems: function () {
      return _ajaxRequest('get', '/leftMenuItems/leftMenuItems');
    },
    saveLeftMenuItem : function (data) {
      return _ajaxRequest('post', '/leftMenuItems/leftMenuItem/', data, null);
    },
    updateLeftMenuItem: function (id, data) {
      return _ajaxRequest('delete', '/leftMenuItems/leftMenuItem/' + id, { _id: id }, null);
    },
    deleteLeftMenuItem: function (id) {
      return _ajaxRequest('delete', '/leftMenuItems/leftMenuItem/' + id, { _id: id }, null);      
    }
  }
}]);

angular.module('vigilantApp.driCoreServices').service('CryptoJSService', function () {
  return CryptoJS;
});


angular.module('vigilantApp.driCoreServices').service('Resolver', ['$q', function ($q) {
  return function (promises) {
    return $q.all(promises);
  }
}]);
