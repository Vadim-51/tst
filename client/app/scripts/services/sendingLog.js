(function () {


    function detectedBrowserType() {
        var browser;

        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            browser = 'Opera';
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            browser = 'Chrome';
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            browser = 'Safari';
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            browser = 'Firefox';
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
        {
            browser = 'IE';
        }
        else {
            browser = 'unknown';
        }
        return browser;
    }

    function detectedDeviceType(){
        var deviceType;

        if (device.desktop()) {
            deviceType = 'Desktop';
        }
        else if (device.tablet()) {
            deviceType = 'Tablet';
        }
        else if (device.mobile()) {
            deviceType = 'Mobile';
        }
        else {
            deviceType = 'unknown';
        }
        return deviceType;
    }

    var service = function ($rootScope, ResourceService, localStorageService) {
        return {
            send: function (action, projectName, projectValue, email) {
                var userID, userName, browser, deviceType;
                var getName = localStorageService.get('user');

                userID = localStorageService.get('auth_token');
                userName = getName ? (getName.firstName + ' ' + getName.lastName) : '';
                browser = detectedBrowserType();
                deviceType = detectedDeviceType();

                var data = {
                    action: action ? action : 'other',
                    userID: userID ? userID : '',
                    userName: userName,
                    projectName: projectName ? projectName : '',
                    projectValue: projectValue ? projectValue : '',
                    productOnReport: '',
                    typeOfDeviceUsed: deviceType,
                    browser: browser,
                    email: email ? email : ''
                };

                ResourceService.saveInLog(data);
            },
            detectedDeviceType: detectedDeviceType,
            detectedBrowserType: detectedBrowserType
        }

    };

    angular.module('vigilantApp').service('SendingLog', ['$rootScope', 'ResourceService', 'localStorageService', service]);
})();
