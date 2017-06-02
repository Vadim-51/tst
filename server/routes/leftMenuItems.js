var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

var db = mongojs('vigilant', ['leftMenuItems']);

console.log("starting mongo--leftMenuItems it's all ok");

/* GET All leftMenuItems */
router.get('/leftMenuItems', function (req, res, next) {

    console.log("inside method get all leftMenuItems");

    db.leftMenuItems.find(function (err, prods) {
        if (err) {
            res.send(err);
        } else {
            res.json(prods);
        }
    });
});

/* POST/SAVE a leftMenuItem */
router.post('/leftMenuItem/', function (req, res, next) {
    console.log("inside method save leftMenuItem ");

    var data = req.body;

    db.leftMenuItems.find({ "text": data.text, "parentId": data.parentId }, {}, function (err, leftMenuItems) {
        if (leftMenuItems.length == 0) {
            db.leftMenuItems.save(data, function (err, result) {
                if (err) {
                    console.log('leftMenuItem save fail on server err');
                    console.log(err);
                    res.send(err);
                }

                else {
                    console.log('OK, save new leftMenuItem to db');
                    res.status(200).json(result);
                    console.log(result)
                }
            })

        }
        else {
            console.log("leftMenuItems allready exist");
            console.log(leftMenuItems);
            res.status(409).json({ status: 409, message: "Save fail, leftMenuItems already exist! " });
            return;
        }
    })
});

/* PUT/UPDATE a leftMenuItem */
router.put('/leftMenuItem/:id', function (req, res, next) {
    console.log("inside method Update leftMenuItem");

    var data = req.body.data,
        _id = req.body.id;

    db.leftMenuItems.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: {
            text: data.text,
            parentId: data.parentId
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.leftMenuItems.find({ '_id': mongojs.ObjectId(_id) }, function (err, leftMenuItem) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit leftMenuItem, get this leftMenuItem");
            console.log('edit leftMenuItem = ', leftMenuItem)
        }
    });
});

/* DELETE */
router.delete('/leftMenuItem/:id', function (req, res) {
    var _id = req.params.id;
    console.log("inside method DELETE leftMenuItem");

    db.leftMenuItems.remove({
        "_id": mongojs.ObjectId(_id)
    }, '', function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
