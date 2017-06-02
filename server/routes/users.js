var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var nodemailer = require('nodemailer');

console.log("starting mongo--users it's all ok");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

//var db = mongojs('mongodb://' + json.DataBaseHost + '/driCore', ['users']);
var db = mongojs('vigilant', ['users']);

// creating template master user
db.users.update({ email: "template_master@gmail.com" },
    {
        firstName: "Template", lastName: "Master", email: "template_master@gmail.com", password: "templateMaster",
        publisher: true
    },
    { upsert: true });

// create reusable transporter object using SMTP transport
var mailUser = 'vigilantmailservice@ideaintech.space';
var smtpConf = {
    host: 'box.ideaintech.space',
    port: 587,
    secure: false,
    auth: {
        user: mailUser,
        pass: 'na3MFqSv7ApXRagN'
    }
};

var transporter = nodemailer.createTransport(smtpConf);

/* register new user */
router.post('/register', function (req, res, next) {
    console.log("inside method register new user");

    var data = req.body;

    db.users.find({ "email": data.email }, { _id: 0, email: 1 }, function (err, users) {
        if (users.length == 0) {
            db.users.save(data, function (err, result) {
                if (err) {
                    console.log('register fail on server  err');
                    console.log(err);
                    res.send(err);
                }
                else {
                    console.log('OK, save new user to db');
                    res.status(200).json(result);
                    console.log(result);
                    
                    // var mailOptions = {};
                    // mailOptions.from = 'vigilantmailservice@ideaintech.space';
                    // mailOptions.to = data.email;
                    // mailOptions.subject = 'Your password reset request for Vigilant';

                    // mailOptions.html = '<div style="max-width: 80%;">' +
                    //     '<div>' +
                    //     '<p>It appears that you would like reset your password. Please click on the link below to setup a new password:</p>' +
                    //     '<a href="http://' + host + '/#/reset/' + user._id + '">' + 'http://' + host + '/#/reset/' + user._id + '</a>' +
                    //     '</div>' +
                    //     '<div>' +
                    //     '<p>Please copy the link to your browser if you are unable click this link.</p>' +
                    //     '</div>' +
                    //     '<p>If you did not request a password reset, please ignore this email</p>' +
                    //     '<div style="padding: 20px 0; border-bottom: 1px solid black; width: 100%;"></div>' +
                    //     '<div>' +
                    //     '<p>Thank you for using our service <a href="http://95.85.31.212:7000/#/">Vigilant</a></p>' +
                    //     '</div>';

                    // transporter.sendMail(mailOptions, function (error, info) {
                    //     if (error) {
                    //         res.status(500).json({
                    //             error: 'Cannot upload image. Sorry. ' + error
                    //         });
                    //     } else {
                    //         res.status(200).json({
                    //             'msg': 'success: '
                    //         });
                    //     }
                    // });
                }
            })
        }
        else {
            console.log("email allready exist");
            console.log(users);
            //res.status(409).json("Register fail, email already exist!");
            res.status(409).json({ status: 409, message: "Register fail, email already exist! " });
            return;
        }
    })
});

/*login user*/
router.post('/login', function (req, res, next) {
    console.log("inside login user");
    var data = req.body;

    db.users.find({ "email": data.email, "password": data.password }, { password: 0, check_password: 0 },
        function (err, users) {
            if (err) {
                res.send(err);
            }
            else {
                if (users.length !== 0) {
                    console.log('login success');
                    console.log(users);

                    res.status(200).json(users[0]);

                }

                else {
                    console.log("wrong email or password")
                    res.status(409).json("wrong email or password");

                }
            }
        });

});


/* GET All Todos */
router.get('/users', function (req, res, next) {

    console.log("inside method get all");
    //    db.users.remove({});

    db.users.find(function (err, rooms) {
        if (err) {
            res.send(err);
        } else {
            res.json(rooms);
        }
    });
});

/* GET All users {id, email,} */
//router.get('/all-users', function (req, res, next) {
//
//    console.log("inside method get all users");
//
//    db.users.find({},{email: 1, _id: 1},function (err, results) {
//        if (err) {
//            res.send(err);
//        } else {
//            res.json(results);
//        }
//    });
//});

//get user data accounts
router.get('/getdata/:id_user', function (req, res, next) {

    console.log("inside method get info user");
    console.log('req.body = ', req.params);

    db.users.findOne({ '_id': mongojs.ObjectId(req.params.id_user) }, { password: 0 }, function (err, userData) {
        if (err) {
            console.log('error when get user info');
            res.send(err);
        } else {
            console.log('success when get user info');
            console.log(userData);
            res.json(userData);
        }
    });
});

router.put('/update/profile/:id_user', function (req, res, next) {
    console.log("update profile user data ");
    var userData = req.body.data;
    console.log(req.body);

    db.users.update({ "_id": mongojs.ObjectId(req.body.id_user) }, {
        $set: {
            "firstName": userData.firstName,
            "lastName": userData.lastName
        }
    }, {}, function (err, result) {
        if (err) {
            console.log('user data update ERROR');
            console.log(err);
            res.status(409).send({ error: err });
        } else {
            console.log('user data update successfully');
            res.status(200).json('Data updated successfully!');
        }
    });

});
router.put('/update/auth/:id_user', function (req, res, next) {
    console.log("update auth user data ");
    var userData = req.body.data;
    console.log(req.body);
    var user;

    db.users.findOne({ "_id": mongojs.ObjectId(req.body.id_user) }, function (err, result) {
        console.log('Get user data = ', result);
        user = result;
        if (user) {
            if (user.password === userData.oldPassword) {
                if (user.password != userData.newPassword) {
                    db.users.update({ "_id": mongojs.ObjectId(req.body.id_user) }, {
                        $set: {
                            "email": userData.email,
                            "password": userData.newPassword
                        }
                    }, {}, function (err, result) {
                        if (err) {
                            console.log('user data update ERROR');
                            console.log(err);
                            res.status(409).send({ error: err });
                        } else {
                            console.log('user data update successfully');
                            console.log(result);
                            res.status(200).json('Data updated successfully!');
                        }
                    });
                }
                else
                    res.status(409).send({ error: 'The new password must differ from the old!' });
            }
            else {
                res.status(409).send({ error: 'The old password is entered incorrectly!' });
            }
        }
    });

});

// Forgot Password, send message to user
router.post('/forgot', function (req, res, next) {
    console.log("inside forgot password");
    var data = req.body;
    var host = req.headers.host;

    db.users.findOne({ "email": data.email }, { password: 0 },
        function (err, user) {
            if (err) {
                res.send(err);
            }
            else {
                var mailOptions = {};
                mailOptions.from = 'vigilantmailservice@ideaintech.space';
                mailOptions.to = user.email;
                mailOptions.subject = 'Your password reset request for Vigilant';

                mailOptions.html = '<div style="max-width: 80%;">' +
                    '<div>' +
                    '<p>It appears that you would like reset your password. Please click on the link below to setup a new password:</p>' +
                    '<a href="http://' + host + '/#/reset/' + user._id + '">' + 'http://' + host + '/#/reset/' + user._id + '</a>' +
                    '</div>' +
                    '<div>' +
                    '<p>Please copy the link to your browser if you are unable click this link.</p>' +
                    '</div>' +
                    '<p>If you did not request a password reset, please ignore this email</p>' +
                    '<div style="padding: 20px 0; border-bottom: 1px solid black; width: 100%;"></div>' +
                    '<div>' +
                    '<p>Thank you for using our service <a href="http://95.85.31.212:7000/#/">Vigilant</a></p>' +
                    '</div>';

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.status(500).json({
                            error: 'Cannot upload image. Sorry. ' + error
                        });
                    } else {
                        res.status(200).json({
                            'msg': 'success: '
                        });
                    }
                });
            }
        });

});

// Update Password, send message to user
router.post('/reset-password/:id', function (req, res, next) {
    console.log("inside rest password");
    var data = req.body;
    //console.log('host = ', req.headers.host);
    var host = req.headers.host;
    var updated = false;

    db.users.update({ "_id": mongojs.ObjectId(data.user_id) }, {
        $set: {
            "password": data.pass
        }
    }, {}, function (err, result) {
        if (err) {
            console.log("ERROR: ", err);
            res.send(err);
        } else {
            console.log(result);
            updated = true;
            res.status(200).json({ msg: "You have successfully reset your password!" });
            successResetPass(updated, data.user_id);
        }
    });

    function successResetPass(updated, id) {
        if (updated) {
            db.users.findOne({ "_id": mongojs.ObjectId(id) }, { password: 0 },
                function (err, user) {
                    if (err) {
                        console.log('ERROR when send email');
                        //res.send(err);
                    }
                    else {
                        var mailOptions = {};
                        mailOptions.from = 'vigilantmailservice@ideaintech.space';
                        mailOptions.to = user.email;
                        mailOptions.subject = 'Your password was reset for Vigilant';

                        mailOptions.html = '<div style="max-width: 80%;">' +
                            '<div>' +
                            '<p>Dear ' + user.firstName + ' ' + user.lastName + ' </p>' +
                            '<p>This is to confirm that your request to reset your password for ' + '<a href="http://95.85.31.212:7000/#/">Vigilant</a> ' +
                            'was successfully implemented</p>' +
                            '</div>' +
                            '<div style="padding: 20px 0; border-bottom: 1px solid black; width: 100%;"></div>' +
                            '<div>' +
                            '<p>Thank you for using our service <a href="http://95.85.31.212:7000/#/">Vigilant</a></p>' +
                            '</div>';

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log('Error: ', error);
                                //res.status(500).json({
                                //    error: 'Cannot upload image. Sorry. ' + error
                                //});
                            } else {
                                console.log('Send email success');
                                //res.status(200).json({
                                //    'msg': 'success: '
                                //});
                            }
                        });
                    }
                });
        }
    }
});

module.exports = router;