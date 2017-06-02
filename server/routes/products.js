var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

var exec = require('child_process').exec;

console.log("starting mongo--products it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));
var multipart = require('connect-multiparty');

var db = mongojs('vigilant', ['products']);

function setOrderNumber() {
    db.products.find({ "isGeneric": { $ne: true } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        orderNumber: 0
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
            }
        }
    });
}

function setDefaultRotationDegree() {
    db.products.find({ "category": { $ne: ["windows", "doors"] } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        defaultRotationDegree: 10
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
            }
        }
    });
}

function deleteAllGeneric() {
    db.products.remove({ "isGeneric": true });
}

function deleteAllVIgilant() {
    db.products.remove({ "vigilant": true });
}

function setIsGenericFalse() {
    db.products.find({ "isGeneric": { $ne: true } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        isGeneric: false
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
            }
        }
    });
}

function StringToNumberFieldCoercing() {
    db.products.find({ "isGeneric": { $ne: true } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        orderNumber: Number(prods[i].orderNumber),
                        width: Number(prods[i].width),
                        height: Number(prods[i].height),
                        weight: Number(prods[i].weight),
                        length: Number(prods[i].length),
                        msrp: Number(prods[i].msrp),
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
                var newOrderNumber = Number(prods[i].orderNumber),
                    newWidth = Number(prods[i].width),
                    newHeight = Number(prods[i].height),
                    newWeight = Number(prods[i].weight),
                    newLength = Number(prods[i].length),
                    newMsrp = Number(prods[i].msrp);
            }
        }
    });
}

function swapWidthAndLengthProperties() {
    db.products.find({ "isGeneric": { $ne: true }, left_menu_alias: { $ne: "Work Tables" } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        length: prods[i].width,
                        width: prods[i].length
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
            }
        }
    });
}

function setMountable() {
    db.products.find({ "left_menu_alias": { $in: ["Wall Cabinets", "Wall Panels"] } }, function (err, prods) {
        if (err) {
            console.log('get products error');
        } else {
            for (var i = 0; i < prods.length; i++) {
                db.products.update({ "_id": mongojs.ObjectId(prods[i]._id) }, {
                    $set: {
                        wallInteraction: "mountable"
                    }
                }, {}, function (err, result) {
                    if (err) {
                        // res.send(err);
                    } else {
                        // res.json(result);
                    }
                });
            }
        }
    });
}

// setOrderNumber(); // comment out this line after first use
// deleteAllGeneric(); // do not use
// setIsGenericFalse(); // comment out this line after first use
// deleteAllVIgilant(); // comment out this line after first use
// StringToNumberFieldCoercing(); // comment out this line after first use
// swapWidthAndLengthProperties(); // comment out this line after first use
// setMountable(); // comment out this line after first use
// setDefaultRotationDegree(); // comment out this line after first use

/* GET All Products */
router.get('/products', function (req, res, next) {

    console.log("inside method get all products");

    db.products.find().sort({ orderNumber: 1 }, function (err, prods) {
        if (err) {
            res.send(err);
        } else {
            res.json(prods);
        }
    });
});

/* GET Products */
router.get('/productsCEG', function (req, res, next) {

    console.log("inside method get all products");

    db.products.find({ "isGeneric": { $ne: true } }).sort({ orderNumber: 1 }, function (err, prods) {
        if (err) {
            res.send(err);
        } else {
            res.json(prods);
        }
    });
});

router.post('/products', function (req, res, next) {
    var data = req.body;
    db.products.find({}, function (err, result) {
        var uniqueData = [];
        var toUpdate = [];
        if (result.length) {
            for (var i = 0; i < data.length; i++) {
                var unique = true;
                for (var j = 0; j < result.length; j++) {
                    if (result[j].base_model_name == data[i].base_model_name) {
                        if (needUpdate(result[j], data[i])) {
                            toUpdate.push({ key: result[j]._id, data: data[i] });
                        }
                        unique = false;
                        break;
                    }
                }
                if (unique) {
                    uniqueData.push(data[i]);
                }
            }
            var counter = 0;
            update(counter);
            function update(counter) {
                if (counter < toUpdate.length) {
                    db.products.update({ _id: toUpdate[counter].key }, toUpdate[counter].data, { upsert: true }, function (err, r, next) {
                        console.log(toUpdate[counter].key + " updated");
                        counter++;
                        update(counter);
                    })
                }
            }
        } else { uniqueData = data; }
        if (uniqueData.length) {
            db.products.save(uniqueData, function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).json(result.length);
                }
            })

        } else {
            res.status(200).json(0);
        }
    })
});

function needUpdate(p1, p2) {
    for (var key in p1) {
        if (key === "_id") continue;
        if (key !== "color_scheme" && key !== "hikashop_id_to_color_scheme") {
            if (p1[key] !== p2[key]) return true;
        } else {
            if (key === "color_scheme") {
                if (p1[key].length !== p2[key].length) return true;
                for (var i = 0; i < p1[key].length; i++) {
                    if (p1[key][i] !== p2[key][i]) return true;
                }
            } else {
                if (Object.keys(p1[key]).length !== Object.keys(p2[key]).length) return true;
                for (var k in p1[key]) {
                    if (p1[key][k] !== p2[key][k]) return true;
                }
            }
        }
    }
    return false;
}

// router.delete('/products', function(req, res, next){
//   db.products.drop(function(err, result){
//     if(err){
//       res.status(500).send(err);
//     }else{
//       res.status(200).json(result);
//     }
//   })
// });

/* POST/SAVE a Product */
router.post('/product', function (req, res, next) {

    console.log("inside method save product");

    var data = req.body;
    data.left_menu_alias = data.category;

    db.products.find({ "description": data.description }, {}, function (err, products) {
        if (products.length == 0) {
            db.products.save(data, function (err, result) {
                if (err) {
                    console.log('register fail on server  err');
                    console.log(err);
                    res.send(err);
                }
                else {
                    console.log('OK, save new product to db');
                    res.status(200).json(result);
                    console.log(result)
                }
            })
        }
        else {
            console.log("product allready exist");
            console.log(products);
            res.status(409).json({ status: 409, message: "Save fail, product already exist! " });
            return;
        }
    })
});

router.post('/upload', function (req, res, next) {

    console.log("inside method upload");

    var file = req.files.file,
        folderName = req.body.imageFolder,
        newName = req.body.newName,
        id = mongojs.ObjectId(req.body.id);
        console.log('id');
        console.log(id);

    if (folderName === 'model') {
        var name = '../dist/models/vigilant_models/' + newName;
        if (!fs.existsSync('../dist/models/vigilant_models')) {
            fs.mkdirSync('../dist/models/vigilant_models');
        }
        fs.renameSync(file.path, name);
        var baseName = name.substring(0, name.length - 4);
        convertObj2BinJs('../dist/models/vigilant_models/', baseName, 'vigilant_models');
        console.log('/models/vigilant_models/' + baseName + '.js');
        db.products.update({ "_id": id }, {
            $set: {
                model: '/models/vigilant_models/' + newName.substring(0, newName.length - 4) + '.js'
            }
        }, {}, function (err, result) {
            if (err) {
                // res.send(err);
            } else {
                // res.json(result);
            }
        });
    }
    else {
        switch (folderName) {
            case 'LeftMenuThumbnails': {
                var newPath = '/images/LeftMenuThumbnails/' + newName;
                fs.renameSync(file.path, '../dist' + newPath);
                db.products.update({ "_id": id }, {
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
            case 'PlanView': {
                var newPath = '/images/PlanView/' + newName;
                fs.renameSync(file.path, '../dist' + newPath);
                db.products.update({ "_id": id }, {
                    $set: {
                        sprite: newPath
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
                var newPath = '/images/ProductImage/' + newName;
                fs.renameSync(file.path, '../dist' + newPath);
                db.products.update({ "_id": id }, {
                    $set: {
                        productImg: newPath
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
            case 'ShoppingList': {
                var newPath = '/images/ShoppingList/' + newName;
                fs.renameSync(file.path, '../dist' + newPath);
                db.products.update({ "_id": id }, {
                    $set: {
                        slImg: newPath
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
            // case 'SwapPictogram': {
            //     var newPath = '/images/SwapPictogram/' + newName;
            //     db.products.update({ "_id": id }, {
            //         $set: {
            //             swapImage: newPath
            //         }
            //     }, {}, function (err, result) {
            //         if (err) {
            //             res.send(err);
            //         } else {
            //             // res.json(result);
            //         }
            //     });
            // }
            //     break;
            case 'Texture': {
                var newPath = '/models/vigilant_models/' + newName;
                fs.renameSync(file.path, '../dist' + newPath);
                db.products.update({ "_id": id }, {
                    $addToSet: {
                        texture: newPath
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
        }
    }

    db.products.find({ '_id': id }, function (err, product) {
        if (err) {
            console.log("error");
            // res.send(err);
        } else {
            console.log(" edit product, get this product");
            console.log('edit product = ', product)
        }
    });

    res.status(200).json({ status: 200, message: "Files uploaded" });
});

router.post('/uploadGeneric', function (req, res, next) {

    console.log("inside method upload generic");

    var file = req.files.file,
        folderName = req.body.imageFolder,
        newName = req.body.newName,
        isImage = req.body.isImage,
        category = req.body.category,
        model = req.body.model,
        id = req.body.id.length > 3 ? mongojs.ObjectId(req.body.id) : parseFloat(req.body.id);

    isImage = JSON.parse(isImage);
    console.log(typeof isImage);

    if (isImage) {

        console.log('is image');

        if (folderName === 'Texture') {
            var last = model.lastIndexOf('/');
            var temp = model.slice(0, last);
            var newPath = temp.concat('/', newName);
        }
        else {
            var newPath = '/images/generic/' + folderName + '/' + category + '/' + newName;
            if (!fs.existsSync('../dist/images/generic/' + folderName)) {
                fs.mkdirSync('../dist/images/generic/' + folderName);
            }
            if (!fs.existsSync('../dist/images/generic/' + folderName + '/' + category)) {
                fs.mkdirSync('../dist/images/generic/' + folderName + '/' + category);
            }
        }
        fs.renameSync(file.path, '../dist' + newPath);

        switch (folderName) {
            case 'LeftMenuThumbnails': {
                db.products.update({ "_id": id }, {
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
            case 'PlanView': {
                db.products.update({ "_id": id }, {
                    $set: {
                        sprite: newPath
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
                db.products.update({ "_id": id }, {
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
                db.products.update({ "_id": id }, {
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
                break;
            case 'Texture': {
                db.products.update({ "_id": id }, {
                    $addToSet: {
                        texture: newPath
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
        }
    }
    else {
        var name = '../dist/models/' + category + '/' + newName;
        if (!fs.existsSync('../dist/models/' + category)) {
            fs.mkdirSync('../dist/models/' + category);
        }
        fs.renameSync(file.path, '../dist/models/' + category + '/' + newName);
        var baseName = newName.substring(0, newName.length - 4);
        convertObj2BinJs('../dist/models/' + category + '/', baseName, category);
        console.log('/models/' + category + '/' + baseName + '.js');
        db.products.update({ "_id": id }, {
            $set: {
                model: '/models/' + category + '/' + baseName + '.js'
            }
        }, {}, function (err, result) {
            if (err) {
                // res.send(err);
            } else {
                // res.json(result);
            }
        });
        db.products.find({ '_id': id }, function (err, product) {
            if (err) {
                console.log("error");
                // res.send(err);
            } else {
                console.log(" edit product, get this product");
                console.log('edit product = ', product)
            }
        });
    }
    res.status(200).json({ status: 200, message: "Files uploaded" });
});

/* PUT/UPDATE a Product */
router.put('/product/:id', function (req, res, next) {
    console.log("inside method Update product ");

    var data = req.body.data,
        _id = req.body.id.length > 3 ? mongojs.ObjectId(req.body.id) : req.body.id;
    console.log(data.color_scheme);

        switch (data.left_menu_alias) {
        case 'Windows': {
            data.wallInteraction = 'embeddable';
        }
            break;
        case 'Doors - Entry': {
            data.wallInteraction = 'embeddable';
        }
            break;
    }

    db.products.update({ "_id": _id }, {
        $set: {
            name: data.name,
            description: data.description,
            category: data.category,
            width: data.width,
            length: data.length,
            height: data.height,
            defaultHeightFromFloor: data.defaultHeightFromFloor,
            color_scheme: data.color_scheme,
            left_menu_alias: data.left_menu_alias,
            borders: data.borders,
            hotzones: data.hotzones,
            visible: data.visible,
            orderNumber: data.orderNumber,
            disableAutoOrientation: data.disableAutoOrientation,
            wallInteraction: data.wallInteraction,
            disableCollisionDetection: data.disableCollisionDetection,
            wallInteraction: data.wallInteraction,
            isOpening: data.isOpening,
            defaultRotationDegree: data.defaultRotationDegree
        }
    }, {}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
    db.products.find({ '_id': _id }, function (err, product) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log(" edit product, get this product");
            console.log('edit product = ', product)
        }
    });
});

/* DELETE */
router.delete('/product/:id', function (req, res) {
    var _id = req.params.id;
    console.log("inside method DELETE product");

    db.products.remove({
        "_id": mongojs.ObjectId(_id)
    }, '', function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
});

router.put('/addHotzoneGaps/:category', function (req, res, next) {
    var data = req.body;
    var category = req.params.category;
    switch (category) {
        case 'wc': category = 'Wall Cabinets';
            break;
        case 'awt': category = 'Adjustable Work Tables';
            break;
        case 'cwt': category = 'Corner Work Table';
            break;
        case 'tsc': category = 'Tool Storage Cabinets';
            break;
        case 'hcc': category = 'High Capacity Cabinets';
            break;
        default: {
            res.status(404).json({ error: "Category doesn't exist" });
            return;
        }
    }
    db.products.update({ category: category }, {
        '$set': {
            hotzones: data.hotzones,
            //gaps: data.gaps
            borders: data.borders
        }
    }, { multi: true }, function (err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(result);
        }
    })
});

/* Move generic objects to db */
router.post('/genericProducts', function (req, res, next) {

    console.log("inside method save genric products");

    var data = req.body;

    db.products.insert(data, function (err, result) {
        if (err) {
            console.log('save generic objects fail on server err');
            console.log(err);
            res.send(err);
        }
        else {
            console.log('OK, save new product to db');
            res.status(200).json(result);
            console.log(result)
        }
    })
});

function convertObj2BinJs(path, filenameNoExt, category) {
    if (fs.existsSync(filenameNoExt + ".obj") && fs.existsSync(filenameNoExt + ".mtl")) {
        console.log('inside if method convertObj2BinJs');
        var command = "python /var/www/Vigilant/dist/models/" + category + "/convert_obj_three.py -i" +
            filenameNoExt + ".obj -o " + filenameNoExt + ".js -t binary";
        exec(command, function (error, stdout, stderr) {
            if (error || stderr) {
                console.log(error);
                console.log(stderr);
            }
            else {
                console.log('converted');
            }
        });
    }
}

router.put("/addModels", function (req, res, next) {
    db.products.find({ "color_scheme": { $exists: true } }, { "color_scheme": 1 }, function (err, result) {
        if (err) {
            res.status(404).send();
        } else {
            var i = 0;
            f();
            function f() {
                if (i === result.length) {
                    res.status(200).send();
                    return;
                }
                db.products.update({ "color_scheme": result[i].color_scheme }, {
                    $set: {
                        "model": "/models/vigilant_models/" + result[i].color_scheme[0].sku + ".js",
                        "productImg": "/images/ProductImage/" + result[i].color_scheme[0].sku + "-350.jpg",
                        "slImg": "/images/ShoppingList/" + result[i].color_scheme[0].sku + "-100.jpg",
                        "color_scheme.0.color_scheme_name": "Mahagony",
                        "color_scheme.1.color_scheme_name": "Pine"
                    }
                }, {}, function (err1, result1) {
                    if (err1) {
                        res.status(500).send();
                    } else {
                        i++;
                        f();
                    }
                })
            }
        }
    })
    // db.products.update({}, {$set:{
    //     model:"/models/vigilant_models/"+
    // }})
});
router.put("/setVisible", function (req, res, next) {
    db.products.update({ "vigilant": true }, {
        $set: {
            visible: true
        }
    }, { multi: true }, function (err, result) {
        if (err) {
            res.status(404).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

module.exports = router;
