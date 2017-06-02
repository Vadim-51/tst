; (function () {
    'use strict';

    var dependencies = ['roomSizeManager', 'constants', 'sizeHelper', 'appSettings'];

    var directive = function (roomSizeManager, constants, sizeHelper, appSettings) {

        return {
            require: ['^validationTooltipMessages', '^ngModel'],
            link: function (scope, elm, attrs, ctrls) {

                var min = constants.wallWidth;
                var max = 50;

                var modelCtrl = ctrls[1];
                var toolTipCntrl = ctrls[0];

                var cmErrorMsg = "Wall width must be between " + min + "cm and " + max + "cm";
                var ftErrorMsg = "Wall width must be between " + sizeHelper.CMToFTAndINCH(min) + " and " + sizeHelper.CMToFT(max);

                modelCtrl.$validators.wallWidthValidator = function (value) {

                    if (value) {

                        var sizeInCM = sizeHelper.toCM(value, appSettings.getSizeUnits());
                        var msg;

                        if (0.1 > Math.abs(min - sizeInCM))
                            sizeInCM = min;

                        msg = appSettings.getSizeUnits() === constants.SizeUnit.FT ? ftErrorMsg : cmErrorMsg;
                        toolTipCntrl.setMessage('wallWidth', msg);
                        modelCtrl.$setValidity('wallWidth', sizeInCM >= min && sizeInCM <= max);

                        return value;
                    }

                    modelCtrl.$setValidity('wallWidth', true);
                    return value;
                };
            }
        }
    };

    directive.$inject = dependencies;

    angular.module('vigilantApp').directive('wallWidthValidator', directive);

})();
