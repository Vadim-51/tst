var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var sizeOf = require('image-size');
console.log("starting mongo--materials it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

var db = mongojs('vigilant', ['materials']);

function setMaterialsIntoDB() {

    db.materials.remove();

    var materialsArray = [],
        curMatObj = {
            material: '',
            materialGroup: '',
            name: '',
            path: '',
            scale: 2,
            height: '',
            width: ''
        },
        defaultPass = '../dist/images/materialList/';

    var folders = fs.readdirSync(defaultPass);
    for (var i = 0; i < folders.length; i++) {
        if (folders[i] === 'floor' || folders[i] === 'wall') {
            curMatObj.material = folders[i];
            var subfolders = fs.readdirSync(defaultPass + folders[i]);
            for (var j = 0; j < subfolders.length; j++) {
                var stats = fs.statSync(defaultPass + folders[i] + '/' + subfolders[j])
                if (stats.isDirectory()) {
                    curMatObj.materialGroup = subfolders[j];
                    var files = fs.readdirSync(defaultPass + folders[i] + '/' + subfolders[j]);
                    for (var k = 0; k < files.length; k++) {
                        var tempPath = defaultPass + folders[i] + '/' + subfolders[j] + '/' + files[k];
                        var dimensions = sizeOf(tempPath);
                        curMatObj.height = dimensions.height;
                        curMatObj.width = dimensions.width;
                        curMatObj.path = tempPath.replace('./dist', '');
                        var newstr = files[k].replace('.png', '').replace('.jpg', '');
                        curMatObj.name = newstr;
                        console.log(newstr);

                        materialsArray.push(curMatObj);
                        curMatObj = {
                            material: curMatObj.material,
                            materialGroup: curMatObj.materialGroup,
                            name: '',
                            path: '',
                            scale: 2,
                            height: '',
                            width: ''
                        }
                    }
                }
            }
        }
    }
    db.materials.insert(materialsArray, function (err, result) {
        if (err) {
            console.log('err');
            console.log(err);
        }
        else {
            console.log('OK, material saved');
            // console.log(result)
        }
    });
}

// setMaterialsIntoDB(); // comment this line out after first use
// this function rewrites materials database

/* GET All materials */
router.get('/materials', function (req, res, next) {

    console.log("inside method get all materials");

    db.materials.find(function (err, prods) {
        if (err) {
            res.send(err);
        } else {
            res.json(prods);
        }
    });
});

/* POST/SAVE a Product */
router.post('/material/', function (req, res, next) {
    console.log("inside method save material ");

    var data = req.body;

    db.materials.find({ "name": data.name }, {}, function (err, materials) {
        if (materials.length == 0) {
            db.materials.save(data, function (err, result) {
                if (err) {
                    console.log('material save fail on server err');
                    console.log(err);
                    res.send(err);
                }

                else {
                    console.log('OK, save new material to db');
                    res.status(200).json(result);
                    console.log(result)
                }
            })

        }
        else {
            console.log("material allready exist");
            console.log(materials);
            res.status(409).json({ status: 409, message: "Save fail, material already exist! " });
            return;
        }
    })
});

/* PUT/UPDATE a Product */
router.put('/material/:id', function (req, res, next) {
    console.log("inside method Update material ");

    var data = req.body.data,
        _id = req.body.id;

    db.materials.update({ "_id": mongojs.ObjectId(_id) }, {
        $set: {
            name: data.name,
            material: data.material,
            materialGroup: data.materialGroup,
            scale: data.scale
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.materials.find({ '_id': mongojs.ObjectId(_id) }, function (err, material) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit material, get this material");
            console.log('edit material = ', material)
        }
    });
});

// upload material texture
router.post('/upload', function (req, res, next) {

    console.log("inside method upload material image");

    var file = req.files.file,
        materialGroup = req.body.materialGroup,
        name = file.name,
        material = req.body.material,
        id = req.body.id;

    var newPath = '/images/materialList/' + material + '/' + materialGroup + '/' + name;
    fs.renameSync(file.path, '../dist' + newPath);
    var dimensions = sizeOf('../dist' + newPath);

    db.materials.update({ "_id": mongojs.ObjectId(id) }, {
        $set: {
            path: newPath,
            height: dimensions.height,
            width: dimensions.width
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            // res.json(result);
        }
    });

    res.status(200).json({ status: 200, message: "Files uploaded" });
});

/* DELETE */
router.delete('/material/:id', function (req, res) {
    var _id = req.params.id;
    console.log("inside method DELETE material");

    db.materials.remove({
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
