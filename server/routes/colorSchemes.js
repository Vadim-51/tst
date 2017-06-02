var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

var db = mongojs('vigilant', ['colorSchemes']);

console.log("starting mongo--colorSchemes it's all ok");

/* GET All colorSchemes */
router.get('/colorSchemes', function (req, res, next) {

    console.log("inside method get all colorSchemes");

    db.colorSchemes.find(function (err, prods) {
        if (err) {
            res.send(err);
        } else {
            res.json(prods);
        }
    });
});

/* POST/SAVE a colorScheme */
router.post('/colorScheme/', function (req, res, next) {
    console.log("inside method save colorScheme ");

    var data = req.body;

    var stain = data.stain.charAt(0).toUpperCase() + data.stain.slice(1);
    var laq = data.laquer ? 'Laq' : 'NoLaq';
    data.colorSchemeUniqueName = data.colorSchemeName.substr(0, 3) + stain + laq;

    db.colorSchemes.find({ "colorSchemeUniqueName": data.colorSchemeUniqueName }, {}, function (err, colorSchemes) {
        if (colorSchemes.length == 0) {
            db.colorSchemes.save(data, function (err, result) {
                if (err) {
                    console.log('colorScheme save fail on server err');
                    console.log(err);
                    res.send(err);
                }

                else {
                    console.log('OK, save new colorScheme to db');
                    res.status(200).json(result);
                    console.log(result)
                }
            })

        }
        else {
            console.log("colorSchemes allready exist");
            console.log(materials);
            res.status(409).json({ status: 409, message: "Save fail, colorSchemes already exist! " });
            return;
        }
    })
});

/* PUT/UPDATE a colorScheme */
router.put('/colorScheme/:id', function (req, res, next) {
    console.log("inside method Update colorScheme");

    var data = req.body.data,
        _id = req.body.id;

    var stain = data.stain.charAt(0).toUpperCase() + data.stain.slice(1);
    var laq = data.laquer ? 'Laq' : 'NoLaq';
    data.colorSchemeUniqueName = data.colorSchemeName.substr(0, 3) + stain + laq;

    db.colorSchemes.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: {
            colorSchemeName: data.colorSchemeName,
            materials: data.materials,
            stain: data.stain,
            laquer: data.laquer,
            productDetailsImage: data.productDetailsImage,
            colorSchemeImage: data.colorSchemeImage,
            colorSchemeUniqueName: data.colorSchemeUniqueName
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.colorSchemes.find({ '_id': mongojs.ObjectId(_id) }, function (err, colorScheme) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit material, get this material");
            console.log('edit material = ', colorScheme)
        }
    });
});

// upload images
router.post('/upload', function (req, res, next) {

    console.log("inside method upload material image");

    var file = req.files.file,
        path = req.body.path;

    fs.renameSync(file.path, '../dist' + path);

    console.log(file.path);
    console.log('../dist' + path + file.name);

    res.status(200).json({ status: 200, message: "Files uploaded" });
});

/* DELETE */
router.delete('/colorScheme/:id', function (req, res) {
    var _id = req.params.id;
    console.log("inside method DELETE colorScheme");

    db.colorSchemes.remove({
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
