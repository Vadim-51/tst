var express = require('express');
var mongojs = require('mongojs');
var async = require('async');
var nodemailer = require('nodemailer');
var moment = require('moment');
var jsdom = require('jsdom');
var fs = require('fs');
var request = require('request');

var jQuery = fs.readFileSync('../report/js/jquery.js').toString();
var Highstock = fs.readFileSync('../report/js/highcharts.js').toString();
var Exporting = fs.readFileSync('../report/js/exporting.src.js').toString();
var Highmaps = fs.readFileSync('../report/js/highmaps.js').toString();
var world = fs.readFileSync('../report/js/world.js').toString();
var map = fs.readFileSync('../report/js/map.js').toString();
//var canvg = fs.readFileSync('../report/js/canvg.js').toString();
//var rgbcolor = fs.readFileSync('../report/js/rgbcolor.js').toString();
//var StackBlur = fs.readFileSync('../report/js/StackBlur.js').toString();

//console.log("starting mongo--rooms it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

var db = mongojs('vigilant', ['rooms', 'users', 'analytics']);

var googleapis = require('googleapis'),
    JWT = googleapis.auth.JWT,
    analytics = googleapis.analytics('v3');

var dir = process.cwd(),
    index = dir.indexOf('bin');

var datetime = new Date(),
    mon = datetime.getMonth() + 1,
    dat = datetime.getDate(),
    folder = datetime.getFullYear() + '_' + (mon < 10 ? '0' + mon : mon) + '_' + (dat < 10 ? '0' + dat : dat) + '/',
    path = 'dist/reportsIMG/' + folder;

if (index !== -1) {
    dir = dir.substring(0, index) + dir.substring(index + 5, dir.length);
}

if (fs.existsSync(dir + path) === false) {
    fs.mkdirSync(dir + path);
}
console.log('url', dir);


var SERVICE_ACCOUNT_EMAIL = 'valleycraft@valleycraft-project.iam.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = dir + 'node_modules/key.pem';


var authClient = new JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']
);
//var authorizeToken;
//authClient.authorize(function (err, tokens) {
//    if (err) {
//        console.log(err);
//        return;
//    }
//    authorizeToken = tokens;
//});

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    host: 'box.ideaintech.space',
    port: 587,
    secure: false,
    auth: {
        user: 'vigilantmailservice@ideaintech.space',
        pass: 'na3MFqSv7ApXRagN'
    }
});

var ObjectReport = {
    createReport: function (fDay, lDay) {
        console.log('startDate - ', moment(fDay).format('YYYY-MM-DD'));
        console.log('startDate - ', moment(lDay).format('YYYY-MM-DD'));
        console.log('reportFDay - ', moment(fDay).format('DD MMMM'));
        console.log('reportLDay - ', moment(lDay).format('DD MMMM'));
        var startDate, endDate, reportFDay, reportLDay;
        //startDate ='2016-03-01';
        //endDate = '2016-03-30';
        startDate = moment(fDay).format('YYYY-MM-DD');
        endDate = moment(lDay).format('YYYY-MM-DD');
        reportFDay = moment(fDay).format('DD MMMM');
        reportLDay = moment(lDay).format('DD MMMM');
        var tasksCalculate = {
            newAccounts: function (callback) {
                var query = {
                    startDate: startDate,
                    endDate: endDate,
                    filter: 'usercreate'
                };
                db.analytics.find({
                    "action": query.filter,
                    'datetime': { '$lte': new Date(query.endDate), '$gte': new Date(query.startDate) }
                }, {
                        action: 1,
                        userName: 1,
                        userID: 1,
                        email: 1,
                        _id: 0
                    },
                    function (err, users) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log('New Accouts: ', users.length);
                            callback(null, users.length);
                        }
                    }
                );
            },
            activeAccounts: function (callback) {
                var query = {
                    startDate: startDate,
                    endDate: endDate,
                    filter: ['usercreate', 'userlogin', 'userupdate', 'projectcreate', 'projectupdate', 'projectdelete', 'projectshare']
                };
                db.analytics.aggregate(
                    [{
                        $match: {
                            action: { $in: query.filter },
                            'datetime': { '$lte': new Date(query.endDate), '$gte': new Date(query.startDate) }
                        }
                    }, {
                        $group: {
                            "_id": "$userID"
                        }
                    }],
                    function (err, result) {
                        if (err) {
                            console.log('err');
                            console.log(err);
                            callback(err);
                        } else {
                            console.log('Accounts activity: ', result.length);
                            callback(null, result.length);
                        }
                    });
            },
            newProjects: function (callback) {
                var query = {
                    startDate: startDate,
                    endDate: endDate,
                    filter: ['projectcreate']
                };
                db.analytics.aggregate(
                    [{
                        $match: {
                            action: { $in: query.filter },
                            'datetime': { '$lte': new Date(query.endDate), '$gte': new Date(query.startDate) }
                        }
                    }, {
                        $project: {
                            action: 1,
                            projectName: 1,
                            datetime: 1,
                            _id: 0
                        }
                    }],
                    function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            //console.log('projects: ', result);
                            console.log('New projects per month: ', result.length);
                            callback(null, result.length);
                        }
                    });
            },
            totalValue: function (callback) {
                var query = {
                    startDate: startDate,
                    endDate: endDate
                    //filter: ['projectcreate']
                };
                db.rooms.aggregate([{
                    $match: {
                        'dt': { '$lte': new Date(query.endDate), '$gte': new Date(query.startDate) }
                    }
                }, {
                    $project: {
                        titleProject: 1,
                        amount: "$projectDetails.project.totalAmount",
                        lastEdited: 1,
                        _id: 0
                    }
                }], function (err, rooms) {
                    if (err) {
                        console.log('error: ', err);
                        callback(err);
                    } else {
                        if (rooms.length) {
                            var amount = 0;
                            //console.log('EXIST Result projects: ', rooms);
                            for (var i = 0; i < rooms.length; i++) {
                                var item = rooms[i];
                                amount += item.amount;

                            }
                            console.log('total amount: ', amount);
                            console.log('rooms length: ', rooms.length);
                            var average = amount / rooms.length;
                            amount = amount.toFixed(2);
                            average = average.toFixed(2);
                            callback(null, { amount: amount, AVR: average });
                        }
                        else {
                            console.log('NOT EXIST Result');
                            callback(null, { amount: '---', AVR: '---' });
                        }
                    }
                });
            },
            resultAccessToAnalytics: function (callback) {

                console.log('resultAccessToAnalytics');

                jsdom.env({
                    html: '<div id="container"></div><canvas id="canvas" width="1000px" height="600px"></canvas>',
                    src: [jQuery, Highstock, Exporting, map, world],
                    features: {
                        FetchExternalResources: ['img']
                    },
                    done: function (errors, window) {
                        if (errors) return console.log(errors);
                        var Highcharts = window.Highcharts;
                        var canvg = window.canvg;
                        var $ = window.jQuery;
                        var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);
                        //console.log(mapData);

                        // jsdom doesn't yet support createElementNS, so just fake it up
                        window.document.createElementNS = function (ns, tagName) {
                            var elem = window.document.createElement(tagName);
                            elem.getBBox = function () {
                                return {
                                    x: elem.offsetLeft,
                                    y: elem.offsetTop,
                                    width: elem.offsetWidth,
                                    height: elem.offsetHeight
                                };
                            };
                            return elem;
                        };
                        var dataAnalytics = {
                            typeBrowser: function (callback2) {
                                authClient.authorize(function (err, tokens) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    analytics.data.ga.get({
                                        auth: authClient,
                                        'ids': 'ga:141272666',
                                        'start-date': startDate,
                                        'end-date': endDate,
                                        'metrics': 'ga:sessions',
                                        'dimensions': 'ga:browser'
                                    }, function (err, result) {
                                        if (err) {
                                            console.log('ERROR when request type browser:', err);
                                        }
                                        else {
                                            //console.log(rows);

                                            var output = parserAnalyticsData(result);
                                            console.log(output);
                                            var chartOptions = {
                                                chart: {
                                                    plotBackgroundColor: null,
                                                    plotBorderWidth: null,
                                                    plotShadow: false,
                                                    type: 'pie'
                                                },
                                                title: {
                                                    text: 'Session by Browser type'
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        allowPointSelect: true,
                                                        cursor: 'pointer',
                                                        showInLegend: true,
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: '<b>{point.name}</b>: {point.y}'
                                                        }
                                                    }
                                                },
                                                series: [{
                                                    name: 'Brands',
                                                    colorByPoint: true,
                                                    data: output
                                                }]
                                            };

                                            var data = {
                                                options: JSON.stringify(chartOptions),
                                                filename: 'chartImage.png',
                                                type: 'image/png',
                                                async: true
                                            };

                                            var exportUrl = 'http://export.highcharts.com/';
                                            $.post(exportUrl, data, function (data) {
                                                var url = exportUrl + data;
                                                console.log(url);

                                                //var datetime = new Date(),
                                                //        filename = datetime.getTime();
                                                //var savePath = '../' + path + filename + '.png';
                                                //var imgPath = '/reportsIMG/' + folder + filename + '.png';
                                                //console.log('imgPath: ',imgPath);
                                                ////request(url).pipe(fs.createWriteStream(imgPath));
                                                //var ws = fs.createWriteStream(savePath);
                                                //ws.on('error', function(err) { console.log(err); });
                                                //request(url).pipe(ws);
                                                //callback2(null, imgPath);

                                                request(url, { encoding: 'binary' }, function (error, response, body) {
                                                    if (error) {
                                                        console.log("ERROR save img by browser: ", error);
                                                    }
                                                    else {
                                                        var datetime = new Date(),
                                                            filename = datetime.getTime();
                                                        var savePath = '../' + path + filename + '.png';
                                                        var imgPath = '/reportsIMG/' + folder + filename + '.png';
                                                        fs.writeFile(savePath, body, 'binary', function (err) {
                                                        });
                                                        callback2(null, imgPath);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });

                            },
                            typeDevice: function (callback2) {
                                authClient.authorize(function (err, tokens) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    analytics.data.ga.get({
                                        auth: authClient,
                                        'ids': 'ga:141272666',
                                        'start-date': startDate,
                                        'end-date': endDate,
                                        'metrics': 'ga:sessions',
                                        'dimensions': 'ga:deviceCategory'
                                    }, function (err, result) {
                                        if (err) {
                                            console.log('ERROR when request type device:', err);
                                        }
                                        else {
                                            //console.log(err);
                                            //console.log(rows);

                                            var output = parserAnalyticsData(result);
                                            console.log(output);
                                            var chartOptions = {
                                                chart: {
                                                    plotBackgroundColor: null,
                                                    plotBorderWidth: null,
                                                    plotShadow: false,
                                                    type: 'pie'
                                                },
                                                title: {
                                                    text: 'Session by Device type'
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        allowPointSelect: true,
                                                        cursor: 'pointer',
                                                        showInLegend: true,
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: '<b>{point.name}</b>: {point.y}'
                                                        }
                                                    }
                                                },
                                                series: [{
                                                    name: 'Brands',
                                                    colorByPoint: true,
                                                    data: output
                                                }]
                                            };

                                            var data = {
                                                options: JSON.stringify(chartOptions),
                                                filename: 'chartImage.png',
                                                type: 'image/png',
                                                async: true
                                            };

                                            var exportUrl = 'http://export.highcharts.com/';
                                            $.post(exportUrl, data, function (data) {
                                                var url = exportUrl + data;
                                                console.log(url);
                                                request(url, { encoding: 'binary' }, function (error, response, body) {
                                                    if (error) {
                                                        console.log("ERROR save img by device: ", error);
                                                    }
                                                    else {
                                                        var datetime = new Date(),
                                                            filename = datetime.getTime();
                                                        var savePath = '../' + path + filename + '.png';
                                                        var imgPath = '/reportsIMG/' + folder + filename + '.png';
                                                        fs.writeFile(savePath, body, 'binary', function (err) {
                                                        });
                                                        callback2(null, imgPath);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });

                            },
                            typeUser: function (callback2) {
                                authClient.authorize(function (err, tokens) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    analytics.data.ga.get({
                                        auth: authClient,
                                        'ids': 'ga:141272666',
                                        'start-date': startDate,
                                        'end-date': endDate,
                                        'metrics': 'ga:sessions',
                                        'dimensions': 'ga:userType'
                                    }, function (err, result) {
                                        if (err) {
                                            console.log('ERROR when request type User:', err);
                                        }
                                        else {
                                            //console.log(err);
                                            //console.log(rows);

                                            var output = parserAnalyticsData(result);
                                            //console.log(output);
                                            var chartOptions = {
                                                chart: {
                                                    plotBackgroundColor: null,
                                                    plotBorderWidth: null,
                                                    plotShadow: false,
                                                    type: 'pie'
                                                },
                                                title: {
                                                    text: 'Session by User type'
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        allowPointSelect: true,
                                                        cursor: 'pointer',
                                                        showInLegend: true,
                                                        dataLabels: {
                                                            enabled: true,
                                                            format: '<b>{point.name}</b>: {point.y}'
                                                        }
                                                    }
                                                },
                                                series: [{
                                                    name: 'Brands',
                                                    colorByPoint: true,
                                                    data: output
                                                }]
                                            };

                                            var data = {
                                                options: JSON.stringify(chartOptions),
                                                filename: 'chartImage.png',
                                                type: 'image/png',
                                                async: true
                                            };

                                            var exportUrl = 'http://export.highcharts.com/';
                                            $.post(exportUrl, data, function (data) {
                                                var url = exportUrl + data;
                                                console.log(url);
                                                request(url, { encoding: 'binary' }, function (error, response, body) {
                                                    if (error) {
                                                        console.log("ERROR save img by user: ", error);
                                                    }
                                                    else {
                                                        var datetime = new Date(),
                                                            filename = datetime.getTime();
                                                        var savePath = '../' + path + filename + '.png';
                                                        var imgPath = '/reportsIMG/' + folder + filename + '.png';
                                                        fs.writeFile(savePath, body, 'binary', function (err) {
                                                        });
                                                        callback2(null, imgPath);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });

                            },
                            geoloacation: function (callback2) {
                                authClient.authorize(function (err, tokens) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    analytics.data.ga.get({
                                        auth: authClient,
                                        'ids': 'ga:141272666',
                                        'start-date': startDate,
                                        'end-date': endDate,
                                        'metrics': 'ga:users',
                                        'dimensions': 'ga:country, ga:countryIsoCode'
                                    }, function (err, result) {
                                        if (err) {
                                            console.log('ERROR: ', err);
                                            return;
                                        }
                                        else {
                                            console.log(result.rows);
                                            var output = [];
                                            for (var i = 0, row; i < result.rows.length; i++) {

                                                var child = {};
                                                row = result.rows[i];
                                                var name = row[0];
                                                var code = row[1];
                                                var value = parseFloat(row[2]);
                                                child.country = name;
                                                child.code = code;
                                                child.count = value;
                                                output.push(child);
                                            }
                                            console.log(output);
                                            var chartOptions = {
                                                chart: {
                                                    borderWidth: 1
                                                },
                                                title: {
                                                    text: 'Geolocation'
                                                },
                                                legend: {
                                                    enabled: false
                                                },
                                                mapNavigation: {
                                                    enabled: false
                                                },
                                                series: [{
                                                    name: 'Countries',
                                                    mapData: mapData,
                                                    color: '#E0E0E0',
                                                    enableMouseTracking: false
                                                }, {
                                                    type: 'mapbubble',
                                                    mapData: mapData,
                                                    name: 'Population 2013',
                                                    joinBy: ['iso-a2', 'code'],
                                                    data: output,
                                                    minSize: 2,
                                                    maxSize: '8%',
                                                    //tooltip: {
                                                    //    pointFormat: '{point.code}: {point.z} thousands'
                                                    //},
                                                    dataLabels: {
                                                        enabled: true,
                                                        format: '<b>{point.country}</b>: {point.count}'
                                                    }
                                                }]
                                            };

                                            var data = {
                                                options: JSON.stringify(chartOptions),
                                                filename: 'chartImage.png',
                                                constr: 'Map',
                                                type: 'image/png',
                                                async: true
                                            };

                                            var exportUrl = 'http://export.highcharts.com/';
                                            $.post(exportUrl, data, function (data) {
                                                var url = exportUrl + data;
                                                console.log(url);
                                                request(url, { encoding: 'binary' }, function (error, response, body) {
                                                    if (error) {
                                                        console.log("ERROR when save img geolocation: ", error)
                                                    }
                                                    else {
                                                        var datetime = new Date(),
                                                            filename = datetime.getTime();
                                                        var savePath = '../' + path + filename + '.png';
                                                        var imgPath = '/reportsIMG/' + folder + filename + '.png';
                                                        fs.writeFile(savePath, body, 'binary', function (err) {
                                                        });
                                                        callback2(null, imgPath);
                                                    }
                                                });
                                            });

                                        }
                                    });
                                });

                            }
                        };
                        async.series(dataAnalytics, function (err, results) {
                            console.log('Second ASYNC!');
                            callback(null, results)
                        });
                    }
                });

            }
        };
        async.series(tasksCalculate, function (err, results) {
            // ��������� ����� ��������
            console.log('results');
            console.log(results); // {newAccounts, activeAccounts, newProjects, totalValue}

            var mailOptions = {};
            mailOptions.from = 'vigilantmailservice@ideaintech.space';
            mailOptions.to = 'derekholper@valleycraft.com, steveyulga@valleycraft.com, nikkiwurst@valleycraft.com'; // rossbarlett@gmail.com
            mailOptions.cc = 'rossbarlett@gmail.com';
            mailOptions.subject = 'Monthly Report from Wine Cellar';
            mailOptions.html = '<table width="720" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0px auto;">' +
                '<tbody>' +
                '<tr>' +
                '<td>' +
                '<table width="720" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0px auto;">' +
                '<tbody>' +
                '<tr>' +
                '<td style="width: 50%;"><img style="max-height: 80%; max-width: 80%; vertical-align: middle" src="http://95.85.31.212:7000/images/ceg-button-logo.jpg"/></td>' +
                '<td style="width: 50%; text-align: center; vertical-align: middle; font-size: 28px;">User Metrics Report</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</td>' +
                '</tr>' +
                '<tr><td style="border-bottom: 2px solid rgb(78,78,78); height: 10px; line-height: 10px;"></td></tr>' +
                '<tr><td>' +
                '<table width="720" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0px auto; font-size: 14px">' +
                '<tbody>' +
                '<tr>' +
                '<td width="390" style="padding: 8px 0;">' +
                '<table width="390" cellspacing="0" cellpadding="0" border="0" align="center">' +
                '<tbody>' +
                '<tr>' +
                '<td width="200" style="text-align: left; ">' +
                '<span>Period:</span>' +
                '</td>' +
                '<td width="190" style="text-align: right; ">' +
                '<span>' + reportFDay + ' - ' + reportLDay + ', ' + moment(fDay).format('YYYY') + '</span>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span>Report #</span>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span> 1</span>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span>New Accounts this past month</span>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span>' + results.newAccounts + '</span>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span>Total Active Accounts for period</span>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span>' + results.activeAccounts + '</span>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span># of New Projects this period</span>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span>' + results.newProjects + '</span>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span>Total Shopping List Value</span><br>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span>$ ' + results.totalValue.amount + '</span><br>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td width="220" style="text-align: left; ">' +
                '<span>Average Project Value</span><br>' +
                '</td>' +
                '<td width="170" style="text-align: right; ">' +
                '<span>$ ' + results.totalValue.AVR + '</span><br>' +
                '</td>' +
                '</tr>' +
                '</tbody></table>' +
                '</td>' +
                '<td width="90" style="padding: 8px 0;"></td>' +
                '<td width="240" style="text-align: left; padding: 8px 0;">' +
                '<label style="font-size: 21px; font-weight: bold;">View by:</label><br>' +
                //'<a  href="#"><span>Historical</span></a><br>' +
                '<a href="#"><span>Geolocation</span></a><br>' +
                //'<a href="#"><span>Monthly Uses</span></a><br>' +
                '<a href="#"><span>By Browser Type</span></a><br>' +
                '<a href="#"><span>By Device Type</span></a><br>' +
                '<a href="#"><span>New vs. Returning</span></a><br>' +
                '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</td></tr>' +
                '<tr><td style="border-top: 2px solid rgb(78,78,78); height: 10px; line-height: 10px;"></td></tr>' +
                '<tr><td  style="min-height: 200px; text-align: center; vertical-align: middle">' +
                '<div> <img src="https://www.cegarage.interiordesigntools.com' + results.resultAccessToAnalytics.geoloacation + '"/></div>' +
                //'<div> <img src="http://ideaintech.net/reportsIMG/2016_04_08/1460136092924.png"/></div>'  +
                '</td></tr>' +
                '<tr><td  style="min-height: 200px; text-align: center; vertical-align: middle">' +
                '<div> <img src="https://www.cegarage.interiordesigntools.com' + results.resultAccessToAnalytics.typeBrowser + '"/></div>' +
                //'<div> <img src="http://ideaintech.net/reportsIMG/2016_04_08/1460136092924.png"/></div>'  +
                '</td></tr>' +
                '<tr><td  style="min-height: 200px; text-align: center; vertical-align: middle">' +
                '<div> <img src="https://www.cegarage.interiordesigntools.com' + results.resultAccessToAnalytics.typeDevice + '"/></div>' +
                //'<div> <img src="http://ideaintech.net/reportsIMG/2016_04_08/1460136094593.png"/></div>'  +
                '</td></tr>' +
                '<tr><td  style="min-height: 200px; text-align: center; vertical-align: middle">' +
                '<div > <img src="https://www.cegarage.interiordesigntools.com' + results.resultAccessToAnalytics.typeUser + '"/></div>' +
                //'<div > <img src="http://ideaintech.net/reportsIMG/2016_04_08/1460136096189.png"/></div>'  +
                '</td></tr>' +
                '<tr><td style="border-bottom: 2px solid rgb(78,78,78); height: 10px; line-height: 10px;"></td></tr>' +
                '<tr><td width="100%" style="text-align: center">' +
                '<img style="height: 50px; max-width: 100%; vertical-align: middle; margin-top: 10px;" src="https://www.interiordesigntools.com/wp-content/uploads/2015/07/ViewIT_-Logo1.png"/>' +
                '</td></tr>' +
                '</tbody>' +
                '</table>';

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Error Send Email');
                    console.log(error);
                } else {
                    console.log('Success Send Email');
                }
            });
        });

    }

};

function parserAnalyticsData(result) {
    var output = [];
    for (var i = 0, row; i < result.rows.length; i++) {

        var child = {};
        row = result.rows[i];
        var name = row[0];
        var value = parseFloat(row[1]);
        child.name = name;
        child.y = value;
        output.push(child);
    }
    return output;
}


module.exports = ObjectReport;
