'use strict';

angular.module('vigilantApp').service('SaveStateService', ['AuthenticationService', 'roomStateManager', 'localStorageService', 
    '$rootScope', 'roomStuff',
    function(AuthenticationService, roomStateManager, localStorageService, $rootScope, roomStuff){
        var clearSavedState = function(){
            var key = AuthenticationService.userId() || 'unauthorized';
            localStorageService.remove(key);
            $rootScope.sceneReady = false;
        }
        var prepareSLData = function(info){
            var data = {};
            data.objects = [];
            for (var i = 0; i < info.length; i++) {
                var obj = {};
                obj.userData = {};
                obj.userData.entity = roomStuff.getById(info[i].id);
                obj.userData.choosenColor = info[i].colorScheme;
                data.objects.push(obj);
            }
            return data;
        }
        var saveRoute = function(route){
           var key = AuthenticationService.userId();
           if(!key) return;
           localStorageService.set(key, route);
        };

        var setHideWelcomeOn1st = function(){
            this._hideWelcome = true;
        }
        var getHideWelcomeOn1st = function(){
            return this._hideWelcome;
        }
        var service = {
            clearSavedState: clearSavedState,
            prepareSLData: prepareSLData,
            saveRoute: saveRoute,
            setHideWelcomeOn1st: setHideWelcomeOn1st,
            getHideWelcomeOn1st: getHideWelcomeOn1st
        };
        service._hideWelcome = false;
        return service;
}]);