var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
//var db = mongojs('mongodb://admin:admin123@ds037827.mongolab.com:37827/ng2todoapp', ['todos']);
//var db = mongojs('mongodb://localhost:27017/ecosystem', ['nodes']);


console.log("starting mongo--rooms it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

//var db = mongojs('mongodb://' + json.DataBaseHost + '/driCore', ['rooms', 'users']);
var db = mongojs('vigilant', ['rooms', 'users']);

router.post('/get-rooms-by-user', function (req, res, next) {

    console.log('get room user');
    var query = req.body;
    console.log(query);
    var object = {
        userData: null,
        rooms: null
    };

    db.rooms.aggregate([
        {
            $match: {
                user_id: query.user_id
            }
        },
        {
            $project: {
                titleProject: 1,
                amount: "$projectDetails.project.totalAmount",
                lastEdited: 1,
                device: 1,
                browser: 1,
                product: "$report.product.description",
                _id: 0
            }
        }
        //{
        //    $lookup: {
        //        from: "users",
        //        localField: "user_id",
        //        foreignField: "_id",
        //        as: "user_info"
        //    }
        //}
    ], function (err, rooms) {
        if (err) {
            console.log('error: ', err);
            res.send(err);
        } else {
            if (rooms.length) {
                console.log('EXIST Result');
                object.rooms = rooms;
                db.users.findOne({ "_id": mongojs.ObjectId(query.user_id) }, {
                    "email": 1,
                    "firstName": 1,
                    "lastName": 1,
                    "_id": 0
                }, function (err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        //if (result.length)
                        object.userData = user;
                        res.send(object);
                    }
                });
            }
            else {
                console.log('NOT EXIST Result');
                res.json("During this period there was no active users");
            }
        }
    });
});


/* GET All Todos */
router.get('/rooms/:user_id', function (req, res, next) {

    console.log("inside method get all");
    //    db.rooms.remove({});

    var userid = req.params.user_id;


    db.rooms.find({ 'user_id': userid }, { "data.date": 0, "data.imgPreview": 0, "data.points": 0 }).sort({ 'lastEdited': -1 }, function (err, collectionRooms) {

        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" get all user rooms");

            res.json(collectionRooms);
            //console.log(rooms)

        }
    })
});
/* GET One Todo with the provided ID */
router.get('/room/:id', function (req, res, next) {
    console.log("inside method get one")
    var _id = req.params.id;
    db.rooms.findOne({
        "_id": mongojs.ObjectId(_id)
    }, function (err, room) {
        if (err) {
            res.send(err);
        } else {
            res.json(room);
            console.log(room)
        }
    });
});
// report-amount
router.post('/report-amount', function (req, res, next) {
    console.log("inside method report-amount");

    var data = req.body;
    console.log(data);
    var amount = 0;
    var object = {
        array: [],
        totalAmount: null
    };
    var usersArray, prevUser = {};

    db.users.find({}, {
        "email": 1,
        "firstName": 1,
        "lastName": 1,
        "_id": 1
    }, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            //console.log(" user data: ", result);
            usersArray = result;

            db.rooms.find({ 'dt': { '$lte': new Date(data.endDate), '$gte': new Date(data.startDate) } },
                { "projectDetails.project.totalAmount": 1, user_id: 1, _id: 1, titleProject: 1, lastEdited: 1 },
                function (err, results) {
                    if (err) {
                        res.send(err);
                    } else {
                        //console.log(results);
                        //console.log("users : ", usersArray);
                        for (var i = 0; i < results.length; i++) {
                            var item = results[i];
                            var amountLocal = (item.projectDetails && item.projectDetails.project && item.projectDetails.project.totalAmount) ?
                                item.projectDetails.project.totalAmount : "";
                            var row = {
                                userId: item.user_id,
                                projectId: item._id,
                                name: item.titleProject,
                                date: item.lastEdited,
                                amount: amountLocal,
                                email: '',
                                userName: ''
                            };

                            console.log('iteration ', i, ': ', amount);
                            if (prevUser._id && (prevUser._id == item.user_id)) {
                                row.email = prevUser.email;
                                row.userName = prevUser.firstName + ' ' + prevUser.lastName;
                            }
                            else {
                                for (var j = 0; j < usersArray.length; j++) {
                                    var user = usersArray[j];
                                    prevUser = user;
                                    if (item.user_id == user._id) {

                                        row.email = user.email;
                                        row.userName = user.firstName + ' ' + user.lastName;
                                        break;
                                    }
                                }
                            }

                            amount += item.projectDetails.project.totalAmount;
                            object.array.push(row);
                        }

                        object.totalAmount = amount;
                        res.json(object);

                    }
                });
        }
    });


});
/* POST/SAVE a Todo */
router.post('/room', function (req, res, next) {
    console.log("inside method save");
    var dt = new Date();
    var data = req.body;
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var year = dt.getFullYear();
    var hours = dt.getHours();
    var minutes = (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
    data.date = data.lastEdited = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    data.dt = dt;
    //console.log(data)

    //writeImage(data.imgPreview);

    var room_tiitle = data.titleProject;
    db.rooms.find({ 'user_id': data.user_id, 'titleProject': room_tiitle }, function (err, collectionRooms) {

        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log("count room with name", room_tiitle, " = ", collectionRooms.length);
            if (collectionRooms.length === 0) {
                db.rooms.save(data, function (err, result) {
                    if (err) {
                        console.log('что-то не получилось');
                        console.log(err);
                        res.send(err);

                    } else {
                        console.log('все хорошо, записалось');
                        res.status(200).json('Project has been saved successfully!');
                    }
                })
            }
            else {
                res.status(400).json({ error: 'Project name must be unique!!!' });
                //res.writeHead( 400, 'Error!', {'content-type' : 'text/plain'});
                //res.write( 'Project name must be unique!!!');
                //return res.end();
            }
        }
    });

});

/* PUT/UPDATE a Todo */
router.put('/room/:id', function (req, res, next) {
    console.log("inside method Update user's room ");

    var data = req.body,
        _id = data.id;
    var room = data.room;

    console.log('_id = ', _id);
    var dt = new Date();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var year = dt.getFullYear();
    var hours = dt.getHours();
    var minutes = (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
    room.lastEdited = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    //console.log('edited room = ', room);

    db.rooms.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: {
            "data": room.data,
            "lastEdited": room.lastEdited,
            "imgPreview": room.imgPreview,
            "titleProject": room.titleProject,
            "projectDetails": room.projectDetails,
            "report": room.report,
            "screenshot": room.screenshot,
            "dt": dt
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.rooms.find({ '_id': mongojs.ObjectId(_id) }, function (err, room) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit room, get this room");
            console.log('edit room = ', room)
        }
    });

});

//NOT IN USE
router.delete('/room/deletescreen', function (req, res) {

    console.log("inside method DELETE Screen");

    var _id = '56a221a24c380e081d03c4a0';
    var step = 'step2';
    var imgurl = '/uploads/screenshot/1453465955431.png';


    db.rooms.findOne({
        "_id": mongojs.ObjectId(_id)
    }, function (err, room) {
        if (err) {
            res.send(err);
        }
        else {
            var index;
            index = room.screenshot[step].indexOf(imgurl);

            if (index !== -1) {
                room.screenshot[step].splice(index, 1);
                db.rooms.update({ "_id": mongojs.ObjectId(_id) }, {
                    $set: {
                        'screenshot': room.screenshot
                    }
                });
                console.log('скрин удален');
                //console.log(room.screenshot);
            }
        }
    });

});

/* DELETE  */
router.delete('/room/:id', function (req, res) {
    var room = req.body,
        _id = req.params.id;
    console.log("inside method DELETE");

    db.rooms.remove({
        "_id": mongojs.ObjectId(_id)
    }, '', function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });

});

//Save screenShot in directoty uploads/screenshot
router.post('/save-screenshot', function (req, res) {
    //console.log(req.body.image);
    var imageBuffer = decodeBase64Image(req.body.image),
        dir = process.cwd(),
        index = dir.indexOf('bin'),
        datetime = new Date(),
        //mon = datetime.getMonth() + 1,
        //dat = datetime.getDate(),
        filename = datetime.getTime(),
        //folder = datetime.getFullYear()+ '_' + (mon < 10 ? '0' + mon : mon) + '_' + (dat < 10 ? '0' + dat : dat) + '/',
        distDir = '/dist',
        path = '/uploads/screenshot/';

    if (index !== -1) {
        dir = dir.substring(0, index) + dir.substring(index + 5, dir.length);
    }

    if (fs.existsSync(dir + distDir + path) === false) {
        fs.mkdirSync(dir + distDir + path);
    }

    path += filename;

    fs.writeFile(dir + distDir + path + '.png', imageBuffer.data, function (err) {
        if (err) {

            return res.status(500).json({
                error: 'Cannot upload the image. Sorry.' + err
            });

        } else {
            var url = path + '.png';
            return res.status(200).json({ msg: 'image upload to dir success', url: url })
        }
    })

});

//Delete screenShot in directoty uploads/screenshot
router.delete('/delete-screenshot/:id', function (req, res) {

    var dir = process.cwd(),
        index = dir.indexOf('bin');

    if (index !== -1) {
        dir = dir.substring(0, index) + dir.substring(index + 5, dir.length);
    }

    var path = '/dist/uploads/screenshot/' + req.params.id + '.png';
    console.log(path);

    fs.unlink(dir + path, (err) => {
        if (err) {
            res.status(500).json(err);
        }else{
            res.status(200).json({msg:"Screenshot deleted"});
            console.log('Screenshot successfully deleted');
        }
    });

});

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
};

function writeImage(base64){
    var imageBuffer = decodeBase64Image(base64),
        dir = process.cwd(),
        index = dir.indexOf('bin'),
        datetime = new Date(),
        filename = datetime.getTime(),
        distDir = '/dist',
        path = '/uploads/projectsPreview/';
        if (index !== -1) {
            dir = dir.substring(0, index) + dir.substring(index + 5, dir.length);
        }

        if (fs.existsSync(dir + distDir + path) === false) {
            fs.mkdirSync(dir + distDir + path);
        }

        path += filename;

        fs.writeFile(dir + distDir + path + '.png', imageBuffer.data, function (err) {
            if (err) {

                return res.status(500).json({
                    error: 'Cannot upload the image. Sorry.' + err
                });

            } else {
                var url = path + '.png';
                return res.status(200).json({ msg: 'image upload to dir success', url: url })
            }
        });
};

module.exports = router;