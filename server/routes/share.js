var express = require('express');
var nodemailer = require('nodemailer');
var fs = require('fs');
// Initialize the Router
var router = express.Router();

var mailOptions = {
    //from: 'Andari Systems <andarisystems@gmail.com>', // sender address
    // to: 'andarisystems@gmail.com',// list of receivers
    // subject: 'Your Vehicle Configuration from Andari Systems'// Subject line
};

router.post('/send-email', function (req, response) {

    // create reusable transporter object using SMTP transport
    var mailUser = 'vigilantmailservice@ideaintech.space';
    var smtpConf = {
        host: 'box.ideaintech.space',
        port: 587,
        secure: false,
        auth:{
            user: mailUser,
            pass: 'na3MFqSv7ApXRagN'
        }
    };

    var transporter = nodemailer.createTransport(smtpConf);

    // show the request body in the command line

    var data = req.body;
    console.log('params sending = ', data.from, data.to);

    mailOptions.from = mailUser;
    mailOptions.to = data.to;
    mailOptions.subject = data.subject;

    mailOptions.attachments = [
        {
            filename: "test.png",
            path: data.img
        }
    ];

    mailOptions.html = '<div style="max-width: 80%;">' +
        '<div>' +
        data.content + ' <br/>' +
        '</div>' +
        '<p>Open link for viewing your plan</p>' +
        '<a href="' + data.url_project + '">' + data.url_project + '</a>' +
        '<div style="padding: 20px 0; border-bottom: 1px solid black; width: 100%;"></div>' +
        '<div>You received an email from ' +
        '<a href="mailto:' + data.from + '">' + data.from + '</a>' +
        '<p>Thank you for using our service <a href="http://95.85.31.212:7000/#/">ViewIT Technologies</a></p>' +
        '</div>' +
        '</div>';

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            response.status(500).json({
                error: 'Cannot upload image. Sorry. ' + error
            });
        } else {
            response.status(200).json({
                'msg': 'success: '
            });
        }
    });

});

router.post('/social', function (req, response) {


    var data = req.body;
    console.log('data = ', data.img);
        var image= data.img,
         dir = process.cwd(),
        index = dir.indexOf('bin'),
        datetime = new Date(),
        mon = datetime.getMonth() + 1,
        dat = datetime.getDate(),
        filename = datetime.getTime(),
        folder = datetime.getFullYear()+ '_' + (mon < 10 ? '0' + mon : mon) + '_' + (dat < 10 ? '0' + dat : dat) + '/',
        path = '/dist/uploads/' + folder;

    if(index !== -1){
        dir = dir.substring(0, index) + dir.substring(index + 5, dir.length);
    }

    if(fs.existsSync(dir + path) === false) {
        fs.mkdirSync(dir + path);
    }

    path += filename;

    var host = "https://www.cegarage.interiordesigntools.com";

    var html = '' +
        '<!DOCTYPE html>' +
        '<html lang="en-US" xmlns:og="http://ogp.me/ns" xmlns:fb="http://ogp.me/ns/fb">' +
        '<head>' +
        '<title>Wine Cellar</title>' +
        '<link href="http://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" type="text/css"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">' +

        // '<!-- Go to www.addthis.com/dashboard to customize your tools -->' +
        // '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5667013817bf9d2d" async="async"></script>' +

        '<!-- Go to www.addthis.com/dashboard to customize your tools -->'+
        '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-57c7d64c3313d46e" async="async"></script> '+

        '<!-- Schema.org markup for Google+ -->' +
        '<meta itemprop="name" content="DriCore Products ">' +
        '<meta itemprop="description" content="Wine Cellar Products description">' +
        '<meta itemprop="image" content="'+host +image+'">' +

        '<!-- Twitter Card data -->' +
        '<meta name="twitter:card" content="summary_large_image">' +
        '<meta name="twitter:title" content="Wine Cellar project">' +
        '<meta name="twitter:description" content="Wine Cellar Products description">' +
        '<meta name="twitter:creator" content="@HRE_Wheels">' +
        '<meta name="twitter:image" content="'+host+image+'">' +

        '<!-- Open Graph data  http://95.85.31.212:7000/uploads/2015_06_05/1433502570174.png -->' +
        '<meta property="og:title" content="Wine Cellar Products">' +
        '<meta property="og:type" content="website" />' +
        '<meta property="og:image" content="'+host +image+'"/>' +
            '<meta property="og:image:width" content="500" />'+
            '<meta property="og:image:height" content="300" />'+
        '<meta property="og:description" content="Wine Cellar Products description" />' +
        '<meta property="og:site_name" content="Wine Cellar" />	' +
        '<meta property="og:site" content="https://www.cegarage.interiordesigntools.com" />	' +

        '<style type="text/css">' +
        'html, body { ' +
        'margin: 0; ' +
        'width: 100%; ' +
        'height: 100%;' +
        'background: #DBD9D9;' +
        '}' +
        // '.addthis_sharing_toolbox{' +
        '.addthis_inline_share_toolbox{'+
        'display:inline-block;' +
        '}' +
        '.wrapper { ' +
        'width: 100%;' +
        'height: 100%; ' +
        '}' +
        '.container { ' +
        'width: 100%; ' +
        'height: 100%; ' +
        'padding: 30px;' +
        'text-align: center;' +
        'color: white;' +
        'box-sizing: border-box;' +
        '}' +
        'span.header{' +
        'vertical-align: text-bottom; font-size:26px; font-family: "Oswald", sans-serif; color:#4b449a;' +
        '}' +
        'img{' +
        'max-height: 90%; max-width: 100%;' +
        '}' +
        '.close{position:absolute;right:0;margin:5px;font-size:1.5em;color:black}' +
        '.poster{position:relative;display:inline-block; background-color: #fff;}' +
        '</style>' +


        '</head>' +
        '<body>' +
        '<div class="wrapper">' +
        '<div class="container">' +
        // '<span class="header">Share your design here: </span><div class="addthis_sharing_toolbox"></div>	' +
        '<span class="header">Share your design here: </span><div class="addthis_inline_share_toolbox"></div>	' +
        '<div class="poster">' +
        // '<span class="glyphicon glyphicon-remove close" ></span>' +
        '<img src="'+host+image+'"/>' +
        '</div>'
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>';


    fs.writeFile(dir + path + '.html', html, function (err) {
        if (err){

            console.log('/share error start write');
            return response.status(500).json({
                error: 'Cannot upload the image. Sorry.' + err
            });

        }else{
            var link = host+'/uploads/'+ folder + filename + '.html';
            console.log('///share success filename ' + filename);
            response.status(200).json({
                'msg': 'success: ' + filename,
                'redirect': link
            });

            //response.redirect(link);
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
}

module.exports = router;
