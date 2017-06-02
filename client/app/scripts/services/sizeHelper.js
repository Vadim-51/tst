; (function () {
    'use strict';

    var dependencies = ['constants'];

    var service = function (constants) {

        var parseSize = function (units, str) {
            var FT, INCH, CM, delims, parser;
            switch (units) {
                case constants.SizeUnit.FT_INCH:
                    delims = "'";
                    parser = str.split(delims);
                    FT = parser[0];
                    str = parser[1];
                    delims = '"';
                    parser = str.split(delims);
                    INCH = parser[0];
                    return { ft: parseFloat(FT), inch: parseFloat(INCH) };
                    break;
                case constants.SizeUnit.FT:
                    delims = "'";
                    parser = str.split(delims);
                    FT = parser[0];
                    return { ft: parseFloat(FT) };
                    break;
                case constants.SizeUnit.INCH:
                    delims = '"';
                    parser = str.split(delims);
                    INCH = parser[0];
                    return { inch: parseFloat(INCH) };
                    break;
                case constants.SizeUnit.CM:
                    CM = parseFloat(str);
                    return { cm: CM };
                    break;
                default:
                    return {};
                    break;
            }
        };

        var polygonArea = function (X, Y, numPoints) {
            var area = 0,
                j = numPoints - 1,  // The last vertex is the 'previous' one to the first
                i = 0;
            for (; i < numPoints; i++) {
                area += (X[j] + X[i]) * (Y[j] - Y[i]);
                j = i;  //j is previous vertex to i
            }
            return Math.abs(area / 2);
        };

        var decimalOnly = /^[0-9]\d*(\.\d{1,2})?\s*$/;
        var regularFTandINCH = /^[0-9]\d*(\.\d{1,2})?\'\s?[0-9]\d*(\.\d{1,2})?"\s*$/; //format example: 1.45'1.65"
        var regularFT = /^[0-9]\d*(\.\d{1,2})?'?\s*$/; //format example: 1.45' or 1.65
        var regularINCH = /^(?:\s*(\d+)\/)?(?:(\d+)\s*(\.\d{1,2})?(?:in|''|"))?$/; //format example: 1.65"

        return {
            toCM: function (sizeText, appSizeUnits) {
                var units = this.detectSizeUnits(sizeText,appSizeUnits),
                    res = parseSize(units, sizeText),
                    ftToCm = 0,
                    inToCm = 0,
                    CM = 0;

                if (res.ft)
                    ftToCm = res.ft * 30.48;

                if (res.inch)
                    inToCm = res.inch * 2.54;

                if (res.cm)
                    CM = res.cm;

                return parseFloat((ftToCm + inToCm + CM).toFixed(2));
            },
            CMToFTAndINCH: function (length) {

                var convert = length * 0.3937008;
                var FT = convert / 12;
                FT = Math.floor(FT);
                var dif = convert / 12 - FT;
                var INCH = dif / (1 / 12);
                INCH = parseFloat(INCH.toFixed(1));
                if (INCH === 12) {
                    FT += 1;
                    INCH = 0;
                }

                var result = FT + "'" + INCH + '"';

                return result;
            },
            CMToFT : function (cm) {
                return parseFloat(cm) * 0.032808399;
            },
            convertM2ToFT2: function (v) {
                var res = parseFloat((v * 10.764).toFixed(2));
                var d = res.toString().split(".")[1];
                if ((parseFloat('0.' + d)) < 0.1) {
                    res = res.toString().split(".")[0] + '.00'
                }
                return res;
            },
            getFloorArea: function (points) {
                var X = [],
                     Y = [],
                     i = 0,
                     point,
                    numPoints = points.length,
                    area;

                for (; i < numPoints; i++) {
                    point = points[i];
                    X.push(point.x);
                    Y.push(point.y);
                }

                area = polygonArea(X, Y, numPoints);
                area = area * 0.0001; // convert cm2 to m2

                return area;
            },
            detectSizeUnits: function (value, units) {
                var result = null;
                if (units === constants.SizeUnit.FT) {
                    if (regularINCH.test(value))
                        result = constants.SizeUnit.INCH;
                    else if (regularFT.test(value))
                        result = constants.SizeUnit.FT;
                    else if (regularFTandINCH.test(value))
                        result = constants.SizeUnit.FT_INCH;
                }
                else if (decimalOnly.test(value)) {
                    result = constants.SizeUnit.CM;
                }
                return result;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('sizeHelper', service);

})();
