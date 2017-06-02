var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

console.log("starting mongo--admins it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

//var db = mongojs('mongodb://' + json.DataBaseHost + '/driCore', ['admins']);
var db = mongojs('vigilant', ['admins']);


/* register new user */
router.post('/register', function (req, res, next) {
    console.log("inside method register admin");

    var data = req.body;

    //db.users.find({"email": data.email}, {_id: 0, email: 1}, function (err, users) {
    //    if (users.length == 0) {
            db.admins.save(data, function (err, result) {
                if (err) {
                    console.log('register fail on server  err');
                    console.log(err);
                    res.send(err);
                }

                else {
                    console.log('OK, save admin to db');
                    res.status(200).json(result);
                    console.log(result)
                }
            });

    //    }
    //    else {
    //        console.log("email allready exist");
    //        console.log(users);
    //        res.status(409).json("register fail, email allready exist");
    //        return;
    //    }
    //})


});

/*login admin*/

router.post('/login', function (req, res, next) {
    console.log("inside login user");
    var data = req.body;

    db.admins.find({"email": data.email, "password": data.password},
        function (err, result) {
            if (err) {
                res.send(err);
            }
            else {
                if (result.length !== 0) {
                    var admin = result[0];
                    console.log('login success');
                    console.log(admin);

                    res.status(200).json(admin);

                }

                else {
                    console.log("wrong email or password")
                    res.status(409).json("wrong email or password");

                }
            }
        });

});




module.exports = router;
