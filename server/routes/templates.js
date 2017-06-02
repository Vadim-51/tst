var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

console.log("starting mongo--rooms it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

var db = mongojs('vigilant', ['templates', 'users', 'suites']);


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

/* GET All Templates */
router.get('/templates', function (req, res, next) {

    console.log("inside method get all");
    //    db.rooms.remove({});

    //db.test.find().sort({name:1}, function(error, tuples) { console.log(tuples) });

    db.templates.find().sort({ dt: -1 }, function (err, collectionRooms) {

        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" get all user templates");

            res.json(collectionRooms);
        }
    })

    // db.templates.find({}, function (err, collectionRooms) {

    //     if (err) {
    //         console.log("error");
    //         res.send(err);
    //     } else {
    //         console.log(" get all user templates");

    //         res.json(collectionRooms);
    //     }
    // })
});

/* GET All Templates */
router.get('/showTemplates', function (req, res, next) {

    console.log("inside method get all");
    //    db.rooms.remove({});

    db.templates.find({ "showAsTemplate": true }, function (err, collectionRooms) {

        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" get all shown templates");

            res.json(collectionRooms);
        }
    })
});

/* GET One Todo with the provided ID */
router.get('/template/:id', function (req, res, next) {
    console.log("inside method get one")
    var _id = req.params.id;
    db.templates.findOne({
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

            db.templates.find({ 'dt': { '$lte': new Date(data.endDate), '$gte': new Date(data.startDate) } },
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
/* POST/SAVE a Template */
router.post('/template', function (req, res, next) {
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

    var room_tiitle = data.titleProject;
    db.templates.find({ 'user_id': data.user_id, 'titleProject': room_tiitle }, function (err, collectionRooms) {

        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log("count template with name", room_tiitle, " = ", collectionRooms.length);
            if (collectionRooms.length === 0) {
                db.templates.save(data, function (err, result) {
                    if (err) {
                        console.log('что-то не получилось');
                        console.log(err);
                        res.send(err);

                    } else {
                        if(data.projectDetails.saveAsSuite){
                            addSuite(data, result._id, res);
                        }else{
                            console.log('все хорошо, записалось');
                            res.status(200).json('Template has been saved successfully!');
                        }
                    }
                })
            }
            else {
                res.status(400).json({ error: 'Template name must be unique!!!' });
            }
        }
    });

});

/* PUT/UPDATE a Template */
router.put('/template/:id', function (req, res, next) {
    console.log("inside method Update user's template ");

    var data = req.body,
        // dt = data.dt,
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

    var newData = {
        "data": room.data,
        "lastEdited": room.lastEdited,
        "imgPreview": room.imgPreview,
        "titleProject": room.titleProject,
        "projectDetails": room.projectDetails,
        "report": room.report,
        "screenshot": room.screenshot,
        "showAsTemplate": room.showAsTemplate,
        "dt": room.dt,
        "saveAsSuite": room.projectDetails.saveAsSuite
    };

    db.templates.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: newData
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            if(room.projectDetails.saveAsSuite && room.suiteId){
                var products = findCEGProducts(room);
                db.suites.update({"_id": mongojs.ObjectId(room.suiteId)},{
                    $set: {
                        "objects": products,
                        "name": room.titleProject
                    }
                }, {}, function (err1, res1) {
                    if (err1) {
                        res.status(500).send(err1);
                    }else{
                        res.send("Suite was updated.");
                    }
                });
            }else if(room.projectDetails.saveAsSuite){
                addSuite(room, _id, res);
            }else{
                res.json(result);
            }
        }
    });

    db.templates.find({ '_id': mongojs.ObjectId(_id) }, function (err, room) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit room, get this room");
            // console.log('edit room = ', room)
        }
    });

});


router.delete('/template/deletescreen', function (req, res) {

    console.log("inside method DELETE Screen");

    var _id = '56a221a24c380e081d03c4a0';
    var step = 'step2';
    var imgurl = '/uploads/screenshot/1453465955431.png';


    db.templates.findOne({
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
                console.log(room.screenshot);
            }
        }
    });

});
/* DELETE  */
router.delete('/template/:id', function (req, res) {
    var room = req.body,
        _id = req.params.id;
    console.log("inside method DELETE");

    db.templates.remove({
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

router.post('/upload', function (req, res, next) {

    console.log("inside method upload image for suite");

    var file = req.files.file,
        name = file.name,
        folderName = req.body.imageFolder,
        _id = req.body.id,
        newPath = '/images/' + folderName + '/' + name;

    fs.rename(file.path, '../dist' + newPath);

    switch (folderName) {
        case 'LeftMenuThumbnails': {
            db.suites.update({ "_id": mongojs.ObjectId(_id) }, {
                $set: {
                    leftMenuImg: newPath
                }
            }, {}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    // res.json(result);
                }
            });
        }
            break;
        case 'ProductImage': {
            db.suites.update({ "_id": mongojs.ObjectId(_id) }, {
                $set: {
                    productImage: newPath
                }
            }, {}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    // res.json(result);
                }
            });
        }
            break;
        case 'SwapPictogram': {
            db.suites.update({ "_id": mongojs.ObjectId(_id) }, {
                $set: {
                    swapImage: newPath
                }
            }, {}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    // res.json(result);
                }
            });
        }
        case 'ShoppingList': {
            db.suites.update({ "_id": mongojs.ObjectId(_id) }, {
                $set: {
                    shoppingListImage: newPath
                }
            }, {}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    // res.json(result);
                }
            });
        }
    }

    res.status(200).json({ status: 200, message: "Files uploaded" });
});

/* PUT/UPDATE a Suite */
router.put('/suite/:id', function (req, res, next) {

    console.log("inside method Update suite ");

    var data = req.body.data,
        _id = req.body.id;

    db.suites.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: {
            name: data.name,
            visible: data.visible
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.suites.find({ '_id': mongojs.ObjectId(_id) }, function (err, suite) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit suite, get this suite");
            console.log('edit suite = ', suite)
        }
    });
});

router.get('/suites', function(req, res){
    db.suites.find({}, function(err, result){
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});
router.delete('/suite/:id', function(req, res){
    var id = req.params.id;
    db.suites.remove({"_id": mongojs.ObjectId(id)},'', function(err, result){
        if(err){
            res.status(500).send(err);
        }else{
            res.send("Deleted");
        }
    })
})

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

function findCEGProducts(data){
    var objs = [];
    for(var i = 0; i<data.data.objects.length; i++){
        if(!data.data.objects[i].isGeneric){
            objs.push(data.data.objects[i]);
        }
    }
    return objs;
}
function addSuite(data, templateId, res){
    var products = findCEGProducts(data);
    db.suites.insert({"objects": products, "name": data.titleProject, "visible": false}, 
        function(er, resp){
            if(er){
                res.status(500).send(er);
            }else{
                db.templates.update({"_id": mongojs.ObjectId(templateId)},
                {$set:{
                    "suiteId": resp._id
                }},{}, function(e, r){
                    if(e){
                        res.status(500).send(e);
                    }else{
                        res.send("Suite was added.");
                    }
                })
            }
        });
}

module.exports = router;