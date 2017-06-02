; (function () {
    'use strict';

    var dependencies = ['roomSizeManager', 'constants', 'sizeHelper', 'appSettings'];

    var directive = function (roomSizeManager, constants, sizeHelper, appSettings) {

        return {
            require: ['^validationTooltipMessages', '^ngModel'],
            link: function (scope, elm, attrs, ctrls) {

                var modelCtrl = ctrls[1];
                var toolTipCntrl = ctrls[0];

                var ftErrorMsg = "Error unit! Pattern for input in inches( 25.10\" ), in foot( 25.10 or 25.10'; ), in foot and inches( 25.10'; 25.10\" )";
                var cmErrorMsg = "Error unit! Pattern for input in centimeters( 150.10 )";

                modelCtrl.$validators.unitsValidator = function (value) {

                    var result = sizeHelper.detectSizeUnits(value, appSettings.getSizeUnits());
                    var msg;

                    if (result !== null && value) {
                        modelCtrl.$setValidity('units', true);
                        return value;
                    }
                    else {

                        msg = appSettings.getSizeUnits() === constants.SizeUnit.FT ? ftErrorMsg : cmErrorMsg;
                        toolTipCntrl.setMessage('units', msg);
                        modelCtrl.$setValidity('units', false);

                        return value;
                    }
                };
            }
        }

    };

    directive.$inject = dependencies;

    angular.module('vigilantApp').directive('unitsValidator', directive);

})();
