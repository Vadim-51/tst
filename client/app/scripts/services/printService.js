'use strict';

angular.module('vigilantApp')
  .service('printService', ['$rootScope', function($rootScope){
    var popup;
    var print = {
      createPrintPopup: function(html){
        popup = window.open('', '_blank');
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        $(popup).load(function(){
          popup.print();
          popup.close();
        });
        return true;
      }
    };
    $rootScope.$on('hidePrintPopup', function(event, param){
      if(popup){
        popup.close();
      }
    });
    return print;
  }]);
