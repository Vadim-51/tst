var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

console.log("starting mongo--analytics it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

//var db = mongojs('mongodb://' + json.DataBaseHost + '/driCore', ['analytics', 'rooms', 'users']);
var db = mongojs('vigilant', ['analytics', 'rooms', 'users']);


/* GET All log */
router.get('/getallaction', function (req, res, next) {
    console.log("inside method getallaction");

//    db.analytics.remove({});

    db.analytics.find(function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
});


/* POST/SAVE a log */

router.post('/action', function (req, res, next) {
    console.log('inside method log/action');
    var data = req.body;
    var now = new Date();
    data.datetime = now;
    console.log(data);
    {
        db.analytics.save(data, function (err, result) {
            if (err) {
                
                console.log(err);
                res.send(err);
                
            } else {
                console.log('saveing new action');
                console.log(result);
                res.json(result);
            }
        })
    }
});

/* POST return new accouts*/
router.post('/get-data-report-new-account', function (req, res, next) {
    console.log("inside method get new accounts");
    console.log('body = ', req.body);
    var query = req.body;
    var ArrayResponse = [];
    var countIteration = 0;

    db.analytics.find({
            "action": query.filter,
            'datetime': {'$lte': new Date(query.endDate), '$gte': new Date(query.startDate)}
        },
        {
            action: 1,
            userName: 1,
            userID: 1,
            email: 1,
            typeOfDeviceUsed: 1,
            browser: 1,
            _id: 0
        },
        function (err, users) {
            if (err) {
                res.send(err);
            } else {
                if(users.length){
                    console.log('EXIST Result');
                    users.forEach(function (user, index) {
                        //console.log('user = ', user);
                        //var object = {user: null, projects: null};
                        var object = {};
                        getProjectsDataByUser(user, index, object, users.length);
                    });
                }
                else{
                    console.log('NOT EXIST Result');
                    res.json("During this period there was no active users");
                }

            }
        });

    function getProjectsDataByUser(user, iteration, object, length){
        db.rooms.find({'user_id': user.userID},
            {imgPreview:0, data:0, screenshot:0, _id:0, date:0, dt: 0},
            function (err, rooms) {
            if (err) {
                console.log('error when get user info');
                res.send(err);
            } else {
                countIteration +=1;
                console.log('success when get projects by user');
                console.log(rooms);
                object.userName = user.userName;
                object.userID = user.userID;
                object.email = user.email ? user.email : '';
                object.device = user.typeOfDeviceUsed;
                object.browser = user.browser;
                object.projects = rooms;
                ArrayResponse.push(object);
                if (countIteration === length) {
                    console.log('SEND RESPONSE');
                    res.json(ArrayResponse);
                }
            }
        });
    }


});

router.post('/get-data-report-activity', function (req, res, next) {
    console.log('inside method get activity accounts');
    var query = req.body;
    console.log(query);
    var countIteration = 0;
    var array = [];

    db.analytics.aggregate(
        [
            {
                $match: {
                    action: {$in: query.filter},
                    'datetime': {'$lte': new Date(query.endDate), '$gte': new Date(query.startDate)}
                }
            },
            {
                $group: {
                    "_id": "$userID"
                }
            }
        ],
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                console.log(result);
                if(result.length){
                    console.log('EXIST Result');
                    result.forEach(function (user, index) {
                        //console.log('user = ', user._id);
                        var object = {};
                        getData(user, object, result.length, array);
                    });
                }
                else{
                    console.log('NOT EXIST Result');
                    res.json("During this period there was no active users");
                }
            }

        });

    function getData(user, object, length, arrayWithObjects){
        db.users.findOne({'_id': mongojs.ObjectId(user._id)}, {password: 0}, function (err, userData) {
            if (err) {
                console.log('error when get user info');
                res.send(err);
            } else {
                console.log('success when get user info');
                console.log(userData);
                //object.user = userData;

                getProjectsDataByUser(user, object, length, arrayWithObjects, userData);
            }
        });
    }

    function getProjectsDataByUser(user, object, length, arrayWithObjects, userData){
        db.rooms.find({'user_id': user._id},{imgPreview:0, data:0, screenshot:0, _id:0, date:0, dt: 0}, function (err, rooms) {
            if (err) {
                console.log('error when get user info');
                res.send(err);
            } else {
                countIteration +=1;
                console.log('success when get projects by user');
                console.log(rooms);
                object.userName = userData.firstName + ' ' + userData.lastName;
                object.email = userData.email;
                object.projects = rooms;
                arrayWithObjects.push(object);
                if (countIteration === length) {
                    console.log('SEND RESPONSE');
                    res.json(arrayWithObjects);
                }
            }
        });
    }
});

/* POST return users that activity by period*/
router.post('/get-activity-users', function (req, res, next) {
    console.log("inside method return users that activity by period");
    console.log('body = ', req.body);
    var query = req.body;
    var ArrayResponse = [];
    var countIteration = 0;

    db.analytics.aggregate(
        [
            {
                $match: {
                    action: {$in: query.filter},
                    'datetime': {'$lte': new Date(query.endDate), '$gte': new Date(query.startDate)}
                }
            },
            {
                $group: {
                    "_id": "$userID"
                }
            }
        ],
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.length) {
                    console.log('EXIST Result');
                    result.forEach(function (user, index) {
                        //console.log('user = ', user._id);
                        getDataUser(user, result.length);
                    });
                }
                else {
                    console.log('NOT EXIST Result');
                    res.json("During this period there was no active users");
                }
            }

        });

    function getDataUser(userID, length) {
        db.users.findOne({'_id': mongojs.ObjectId(userID._id)}, {password: 0}, function (err, userData) {
            if (err) {
                console.log('error when get user info');
                res.send(err);
            } else {
                //countIteration += 1;
                //console.log('success when get user info');
                //console.log(userData);
                //ArrayResponse.push(userData);
                //if (countIteration === length) {
                //    console.log('SEND RESPONSE');
                //    res.json(ArrayResponse);
                //}
                getProjectsDataByUser(userID, length, userData);
            }
        });
    }

    function getProjectsDataByUser(userID, length, userData){
        db.rooms.find({'user_id': userID._id},{imgPreview:0, data:0, screenshot:0, _id:0, date:0, dt: 0}, function (err, rooms) {
            if (err) {
                console.log('error when get user info');
                res.send(err);
            } else {
                console.log();
                countIteration +=1;
                console.log('success when get projects by user');
                console.log(rooms);
                for( var i=0; i<rooms.length; i++){
                    var room = rooms[i];
                    var object = {};
                    object.userName = userData.firstName + ' ' + userData.lastName;
                    object.email = userData.email;
                    object.name = room.titleProject ? room.titleProject : "";
                    object.amount = (room.projectDetails && room.projectDetails.project && room.projectDetails.project.totalAmount) ? room.projectDetails.project.totalAmount : "";
                    object.product = (room.report && room.report.product) ? room.report.product.description : "";
                    object.device = room.device ? room.device : "";
                    object.browser = room.browser ? room.browser : "";
                    ArrayResponse.push(object);
                }

                if (countIteration === length) {
                    console.log('SEND RESPONSE');
                    res.json(ArrayResponse);
                }
            }
        });
    }
});



module.exports = router;