; (function () {

    var service = function () {

        var getStatistic = function (startDate, endDate, metric, dimensions, filters, view) {

            var query = {
                ids: view,
                'start-date': startDate,
                'end-date': endDate,
                metrics: metric
            };

            if (dimensions)
                query.dimensions = dimensions;

            if (filters)
                query.filters = filters;

            return gapi.client.analytics.data.ga.get(query);
        };

        return {
            clientId: '492300904763-83rrugcs6nfo01uit9v0hl5g9par5td3.apps.googleusercontent.com',
            view: {
                all: 'ga:141272666',
                user: 'ga:141430444'
            },
            setUser: function (id, name, email) {
                ga('set', 'userId', id);
                ga('set', 'dimension1', id);
                ga('set', 'dimension2', name);
                ga('set', 'dimension6', email);
            },
            accountCreated: function () {
                ga('send', 'event', 'user', 'register');
            },
            activityTrack: function () {
                ga('send', 'event', 'mouse', 'click');
            },
            getAllStatistic: function (startDate, endDate, metric, dimensions, filters) {
                return getStatistic(startDate, endDate, metric, dimensions, filters, this.view.all);
            },
            getUserStatistic: function (startDate, endDate, metric, dimensions, filters) {
                return getStatistic(startDate, endDate, metric, dimensions, filters, this.view.user);
            },
            responseToDataTable: function (rows, headers) {
                var cols,
                    i = 0,
                    j,
                    cell,
                    parsedRow,
                    result = [];

                for (; i < rows.length; i++) {
                    cols = rows[i];
                    parsedRow = [];
                    for (j = 0; j < cols.length; j++) {
                        cell = cols[j];
                        cell = isNumeric(cell) ? parseFloat(cell) : cell;
                        parsedRow.push(cell);
                    }
                    result.push(parsedRow);
                }

                result.unshift(headers);

                return google.visualization.arrayToDataTable(result);
            }
        }
    };

    angular.module('vigilantApp').service('googleAnalitycs', service);

})();