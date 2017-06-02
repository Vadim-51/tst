var express = require('express');
var cors = require('cors');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var CronJob = require('cron').CronJob;
var report = require('./report/initReport');
var multipart = require('connect-multiparty');
var im = require('imagemagick');
// Cron start first day every Month in 8:00
// 0 0 8 1 0-11 *
// new CronJob('00 00 12 1 0-11 *', function () { //*/30 * * * * *
//     var date = new Date();
//     var year = date.getFullYear();
//     var month = date.getMonth();
//     var day = date.getDate();

//     var firstDay, lastDay, prevMonth, prevYear;
//     prevMonth = month - 1;
//     prevYear = year;
//     if (month === 0) {
//         prevMonth = 11;
//         prevYear = year - 1;
//     }

//     firstDay = new Date(prevYear, prevMonth, 1);
//     lastDay = new Date(year, month, 0);

//     report.createReport(firstDay, lastDay);
// }, null, true);

var index = require('./routes/index');
var rooms = require('./routes/rooms');
var users = require('./routes/users');
var share = require('./routes/share');
var admins = require('./routes/admins');
var analytics = require('./routes/log');
var templates = require('./routes/templates');
var products = require('./routes/products');
var materials = require('./routes/materials');
var colorSchemes = require('./routes/colorSchemes');
var leftMenuItems = require('./routes/leftMenuItems');


var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));
var build = json.build;


var app = express();

app.use(cors());
app.options('*', cors());

app.use(multipart({
    uploadDir: 'tmp'
}));

// view engine setup
app.set('views', path.join(__dirname, build));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/' + build + '/images/favicon.ico'));
app.engine('html', require('ejs').renderFile);
app.use(logger(build));
app.use(bodyParser.json({ limit: "10 mb" }));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: "10 mb"
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, build)));

app.use('/', index);
app.use('/rooms', rooms);
app.use('/users', users);
app.use('/share', share);
app.use('/admins', admins);
app.use('/log', analytics);
app.use('/templates', templates);
app.use('/products', products);
app.use('/materials', materials);
app.use('/colorSchemes', colorSchemes);
app.use('/leftMenuItems', leftMenuItems);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


module.exports = app;