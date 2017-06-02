(function () {
    var data;
    var subfloor_active = true;
    var IncludSubfloorInSPL = true;

    //remove rows with null
    function removeNullsRow(rows) {
        var i, j, row, cell, count_null;

        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            count_null = 0;
            for (j = 0; j < row.length; j++) {
                cell = row[j];
                if (cell !== '') {
                    break;
                }
                else {
                    count_null++;
                }
            }
            if (count_null === 5) {
                rows.splice(i, 1);
                i--;
            }
        }
        return rows;
    }

    // Returns a new array each time to avoid pointer issues
    var service = function () {
        return {
            setData: function (val) {
                if (val)
                    data = val;
            },
            getData: function () {
                return data;
            },
            setParamsSubfloorActive: function (bool) {
                subfloor_active = bool;
            },
            getParamsReport: function(){
              return {isSBF: subfloor_active, isDRSBF:IncludSubfloorInSPL};
            },
            setParamsIncludeSubfloorToAmount: function (bool) {
                IncludSubfloorInSPL = bool;
            }
        }
    };

    angular.module('vigilantApp').service('ShoppingListService', service);
})();
