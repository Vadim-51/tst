'use strict';

angular.module('vigilantApp').controller('AdminControl', ['$scope', 'ResourceService', '$timeout', '$location', 'googleAnalitycs',
    'toastr',
    function ($scope, ResourceService, $timeout, $location, googleAnalitycs, toastr) {

        var data;
        var chart;
        var output = [];
        var table;
        var resetFilter = '';

        var admin = {
            email: 'admin.dricore.com',
            password: 'admin',
            permission: 'administrator'
        };

        var chartElement = document.getElementById('chart');

        var startDate,
            endDate;

        $scope.activeTab = null;
        $scope.mounthlyCreatedAcounts = 0;
        $scope.avgTimeOnTool = 0;
        $scope.existingAccountsActivity = [];
        $scope.isAuthorizeByGoogle = false;
        $scope.arrayUsers = {
            optionSelected: null,
            users: []
        };
        $scope.totalAmount = 0;

        $scope.$watch('dateStart', function (newVal, oldVal) {
            $scope.dateStart = ($scope.dateEnd && $scope.dateStart <= $scope.dateEnd) ? newVal : oldVal;
            startDate = moment($scope.dateStart).format('YYYY-MM-DD');
        });

        $scope.$watch('dateEnd', function (newVal, oldVal) {
            $scope.dateEnd = ($scope.dateStart && $scope.dateEnd >= $scope.dateStart) ? newVal : oldVal;
            endDate = moment($scope.dateEnd).format('YYYY-MM-DD');
        });

        $scope.initDate = function () {
            $scope.dateStart = moment().startOf('day').subtract(30, 'days').toDate();
            $scope.dateEnd = moment().startOf('day').toDate();
        };
        // initialize Date period
        $scope.initDate();

        var drawChartBrowserType = function () {
            getDataForChart('ga:browser');
        };

        var drawChartDeviceType = function () {
            getDataForChart('ga:deviceCategory');
        };

        var drawChartUserType = function () {
            getDataForChart('ga:userType');
        };

        var showAccountsCreatedThatMonth = function () {
            chart.clearChart();
            var query = {
                startDate: startDate,
                endDate: endDate,
                filter: 'usercreate'
            };
            ResourceService.getNewAccouts(query).then(function (result) {
                    if (result.length && (typeof(result) != 'string')) {
                        var data = result;
                        initDataTable(data, 'new-accounts');
                    }
                    else {
                        var data = [];
                        initDataTable(data, 'new-accounts');
                    }

                },
                function (result) {
                    console.log('error = ', result);
                    toastr.error(result);
                    var data = [];
                    initDataTable(data, 'new-accounts');
                });
        };

        var avgTimeOnTool = function () {
            chart.clearChart();
            googleAnalitycs.getAllStatistic(startDate, endDate, 'ga:avgSessionDuration')
                .execute(function (result) {
                    if (result.rows) {
                        var seconds = parseFloat(result.rows[0][0]);

                        chart = new google.visualization.Table(chartElement);
                        var time = ((seconds / 60) / 60).toFixed(2),
                            dataTable;

                        dataTable = new google.visualization.DataTable();
                        dataTable.addColumn('string', 'Name');
                        dataTable.addColumn('string', 'Time(hr)');
                        dataTable.addRows([
                            ['Average Time', time]
                        ]);

                        chart.draw(dataTable, {width: '60%'});
                    }
                });
        };

        var showGeolocation = function () {
            chart.clearChart();
            googleAnalitycs.getAllStatistic(startDate, endDate, 'ga:users', 'ga:city')
                .execute(function (result) {
                    if (result.rows) {

                        var dataTable = googleAnalitycs.responseToDataTable(result.rows, ['Country', 'Users']);

                        chart = new google.visualization.GeoChart(chartElement);

                        chart.draw(dataTable, {
                            height: 300,
                            //region: '019',
                            displayMode: 'markers',
                            colorAxis: {colors: ['green', 'blue']}
                        });
                    }
                });
        };

        var getExistingAccountsActivity = function () {
            chart.clearChart();
            //$scope.existingAccountsActivity = [];
            var query = {
                startDate: startDate,
                endDate: endDate,
                filter: ['usercreate', 'userlogin', 'userupdate', 'projectcreate', 'projectupdate', 'projectdelete', 'projectshare']
            };
            ResourceService.getActivityAcounts(query).then(function (result) {
                    //console.log('result = ', result);
                    if (result.length && (typeof(result) != 'string')) {
                        var data = result;
                        initDataTable(data, 'accounts-activity');
                    }
                    else {
                        var data = [];
                        initDataTable(data, 'accounts-activity');
                    }

                },
                function (result) {
                    console.log('error = ', result);
                    toastr.error(result);
                    var data = [];
                    initDataTable(data, 'accounts-activity');
                });
        };

        var getTotalSPLvalue = function () {
            chart.clearChart();
            var data = {
                startDate: startDate,
                endDate: endDate
            };
            ResourceService.getTotalAmountValue(data).then(function (result) {
                    //console.log('result total SPL value = ', result);
                    if (result.totalAmount && result.array.length && (typeof(result) != 'string')) {
                        var data = result.array;
                        $scope.totalAmount = result.totalAmount ? '$' + result.totalAmount.toFixed(2) : 'No Result';
                        initDataTable(data, 'shopping-list-report');
                    }
                    else {
                        var data = [];
                        $scope.totalAmount = 0;
                        initDataTable(data, 'shopping-list-report');
                    }

                },
                function (result) {
                    console.log('error = ', result);
                    toastr.error(result);
                    var data = [];
                    initDataTable(data, 'shopping-list-report');
                });
        };

        function getDataToGranularReport() {
            $scope.arrayUsers.users = [];
            $scope.arrayUsers.optionSelected = {};
            $scope.projectsByUser = null;
            var query = {
                startDate: startDate,
                endDate: endDate,
                filter: ['usercreate', 'userlogin', 'userupdate', 'projectcreate', 'projectupdate', 'projectdelete', 'projectshare']
            };
            ResourceService.getActivityUsersByPeriod(query).then(function (result) {
                    //console.log('result = ', result);
                    if (result.length && (typeof(result) != 'string')) {
                        var data = result;
                        initDataTable(data, 'granular-report');
                    }
                    else {
                        var data = [];
                        initDataTable(data, 'granular-report');
                    }
                },
                function (result) {
                    console.log('error = ', result);
                    toastr.error(result);
                    var data = [];
                    initDataTable(data, 'granular-report');
                });
        }

        function initDataTable(data, report) {
            console.log('init DataTable()');
            if (report == 'new-accounts') {
                table = $('#reportNewAccounts').DataTable({
                    retrieve: true,
                    paging: false
                });
                table.destroy();
                table = $('#reportNewAccounts').DataTable({
                    data: data,
                    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                    "columns": [
                        {
                            "className": 'details-control',
                            "orderable": false,
                            "data": null
                        },
                        {"data": "userName"},
                        {"data": "email"},
                        {"data": "device"},
                        {"data": "browser"}
                    ],
                    "columnDefs": [
                        { "width": "7%",
                            "render": function (data, type, row) {
                                return row.projects.length ? '<button class="btn btn-default btn-xs btn-activity"><span class="glyphicon glyphicon-eye-open"></span></button>' : '';
                            },
                            "targets": 0 },
                        {
                            "render": function (data, type, row) {
                                return data + ' (' + row.projects.length + ')';
                            },
                            "targets": 1
                        }
                    ],
                    "order": [[1, 'asc']]
                });
                $('#reportNewAccounts tbody').unbind('click');
                $('#reportNewAccounts tbody').on('click', 'td .btn-activity', showDetails);
                //$('#reportNewAccounts tbody button.btn-activity').click(showDetails);
            }
            else if (report == 'accounts-activity') {
                table = $('#reportUserActivity').DataTable({
                    retrieve: true,
                    paging: false
                });
                table.destroy();
                table = $('#reportUserActivity').DataTable({
                    data: data,
                    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                    "columns": [
                        {
                            "className": 'details-control',
                            "orderable": false,
                            "data": null
                        },
                        {"data": "userName"},
                        {"data": "email"}
                    ],
                    "columnDefs": [
                        { "width": "7%",
                            "render": function (data, type, row) {
                                return row.projects.length ? '<button class="btn btn-default btn-xs btn-activity"><span class="glyphicon glyphicon-eye-open"></span></button>' : '';
                            },
                            "targets": 0 },
                        {
                            "render": function (data, type, row) {
                                return data + ' (' + row.projects.length + ')';
                            },
                            "targets": 1
                        }
                    ],
                    "order": [[1, 'asc']]
                });
                //$('#reportUserActivity tbody button.btn-activity').click(showDetails);
                $('#reportUserActivity tbody').unbind('click');
                $('#reportUserActivity tbody').on('click', 'td .btn-activity', showDetails);
            }
            else if (report == 'granular-report') {
                table = $('#granularReport').DataTable({
                    retrieve: true,
                    paging: false
                });
                table.destroy();
                table = $('#granularReport').DataTable({
                    data: data,
                    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                    "columns": [
                        {"data": "userName"},
                        {"data": "email",
                            "className": 'cell-filter'
                        },
                        {"data": "name"},
                        {"data": "amount"},
                        {"data": "product"},
                        {"data": "device"},
                        {"data": "browser"}
                    ],
                    "columnDefs": [
                        {
                            "render": function ( data, type, row ) {
                                return data ? "$ " + data : "";
                            },
                            "targets": 3
                        }
                    ],
                    "order": [[1, 'asc']]
                });
                $('#granularReport tbody').unbind('click');
                $('#granularReport tbody').on('click', 'td.cell-filter', filterByEmail);
            }
            else if (report == 'shopping-list-report') {
                table = $('#shoppingListReport').DataTable({
                    retrieve: true,
                    paging: false
                });
                table.destroy();
                table = $('#shoppingListReport').DataTable({
                    data: data,
                    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                    "columns": [
                        {"data": "userName"},
                        {"data": "email",
                            "className": 'cell-filter'
                        },
                        {"data": "name"},
                        {"data": "amount"}
                    ],
                    "columnDefs": [
                        {
                            "render": function ( data, type, row ) {
                                return data ? "$ " + data : "";
                            },
                            "targets": 3
                        }
                    ],
                    "order": [[1, 'asc']]
                });
                $('#shoppingListReport tbody').unbind('click');
                $('#shoppingListReport tbody').on('click', 'td.cell-filter', filterByEmail);
            }
        };

        var filterByEmail = function(){
            var sData = table.cell(this).data();

            if (resetFilter === sData) {
                table.search( '' ).columns().search( '' ).draw();
                resetFilter = '';
            }
            else{
                resetFilter = sData;
                table.columns([1]).search(sData).draw();
            }
        };

        var showDetails = function(){
            var tr = $(this).closest('tr');
            var row = table.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                row.child(formatExpandRowInTable(row.data())).show();
                tr.addClass('shown');
            }
        };

        /* Formatting function for row details - modify as you need */
        function formatExpandRowInTable(d) {
            // `d` is the original data object for the row
            var expand = '<table class="expand-table table table-striped table-bordered" cellpadding="5" style="padding-left:50px; width: 100%">' +
                '<thead>' +
                '<tr>' +
                '<th> </th>' +
                '<th>Project</th>' +
                '<th>Date</th>' +
                '<th>Product on report</th>' +
                '<th>Amount</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>';
            if (d.projects.length) {
                for (var i = 0; i < d.projects.length; i++) {
                    var row = d.projects[i];
                    var index = i + 1;
                    var title = row.titleProject ? row.titleProject : "";
                    var date = row.lastEdited ? row.lastEdited : "";
                    var product = (row.report && row.report.product) ? row.report.product.description : " ";
                    var amount = (row.projectDetails && row.projectDetails.project.totalAmount) ? ("$ "+row.projectDetails.project.totalAmount) : " ";
                    expand += '<tr>' +
                        '<td>' + index + '</td>' +
                        '<td>' + title + '</td>' +
                        '<td>' + date + '</td>' +
                        '<td>' + product + '</td>' +
                        '<td>' + amount + '</td>' +
                        '</tr>';
                }
                expand += '</tbody> </table>';

            }
            else {
                expand += '<tr><td colspan="5" class="text-center">No Data</td></tr></tbody></table>';
            }
            return expand;
        }

        $scope.tabs = [{
            text: 'Session by browser',
            action: drawChartBrowserType
        }, {
            text: 'Session by device type',
            action: drawChartDeviceType
        }, {
            text: 'Session by user type',
            action: drawChartUserType
        }, {
            text: 'Geolocation',
            action: showGeolocation
        }, {
            text: 'New Accounts',
            action: showAccountsCreatedThatMonth
        }, {
            text: 'Average time on tool',
            action: avgTimeOnTool
        }, {
            text: 'Existing accounts activity',
            action: getExistingAccountsActivity
        }, {
            text: 'Total Shopping List Report Value',
            action: getTotalSPLvalue
        }, {
            text: 'Granular Report',
            action: getDataToGranularReport
        }];

        $scope.dataLogin = {
            email: '',
            password: ''
        };

        $scope.register = function () {
            ResourceService.registerAdmin(admin).then(function (result) {
                //console.log('register admin');
                //console.log(result);

            }, function (result) {
                console.log('error register admin');
            });
        };

        $scope.login = function () {
            ResourceService.loginAdmin($scope.dataLogin).then(function (result) {
                //console.log('login admin');
                //console.log(result);
                $timeout(function () {

                    $location.path("/admin/main");
                }, 1000);

            }, function (result) {
                console.log('error register admin');
            });
        };

        $scope.activateTab = function (index) {
            $scope.activeTab = index;
            $scope.tabs[index].action();
        };

        gapi.analytics.ready(function () {

            gapi.analytics.auth.authorize({
                container: 'auth-button',
                clientid: googleAnalitycs.clientId
            });

            gapi.analytics.auth.on('success', function (response) {
                $scope.isAuthorizeByGoogle = true;
                $scope.activateTab(0);
                $scope.$apply();
            });
        });

        function getDataForChart(dimensions) {
            //chart.clearChart();
            googleAnalitycs.getAllStatistic(startDate, endDate, 'ga:sessions', dimensions)
                .execute(handleCoreReportingResults);
        }

        function handleCoreReportingResults(results) {
            if (!results.error) {
                printColumnHeaders(results);
            } else {
                alert('There was an error: ' + results.message);
            }
        }

        function printColumnHeaders(results) {
            output = [];
            var rows = [];
            for (var i = 0, row; i < results.rows.length; i++) {
                var child = [];
                row = results.rows[i];

                for (var j = 0, cell; j < row.length; j++) {
                    cell = row[j];
                    if (j === 1) {
                        child.push(parseFloat(cell));
                    }
                    else
                        child.push(cell)
                }
                rows.push(child);
            }
            output = rows;

            drawChart();
        }


        // Callback that creates and populates a data table,
        // instantiates the pie chart, passes in the data and
        // draws it.
        function drawChart() {

            // Create our data table.
            data = new google.visualization.DataTable();
            data.addColumn('string', 'Topping');
            data.addColumn('number', 'Slices');
            data.addRows(output);

            // Set chart options
            var options = {
                'height': 320,
                pieSliceText: 'value'
            };

            // Instantiate and draw our chart, passing in some options.
            chart = new google.visualization.PieChart(document.getElementById('chart'));
            chart.draw(data, options);
        }
    }]);
