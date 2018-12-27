var express = require('express');
var router = express.Router();

const Promise = require("bluebird");
const sgMail = require('@sendgrid/mail');

const request = require('request');

var jade = require('jade');

const sendEmail = params => {
    return new Promise((resolve, reject) => {
      sgMail.send(params, (err, json) => {
        if (err) {
          reject(err);
        } else {
          resolve(json);
        }
      });
    });
  };


//env config variables
const recaptchaSecretKey = process.env.RECAPTCHA_SECRET || '';
const apiKey = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(apiKey);

var msg = {
    to: ["joseiq91@gmail.com"],
    from: "noReply@rileyandco.com",
    bcc: "joseiq91@gmail.com",
    subject: "Test upload an attachment form",
    html: ""
  };

/* GET email listing. */
router.get('/', function(req, res, next) {
  res.send('sending some response back!');
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

router.post('/', function(req, res, next) {
    var myObj = req.body; // set request body coming from client
    var grecaptchaStatus = verifyGoogleRecaptcha(req.body['g-recaptcha-response'], req.connection.remoteAddress);


    //setTimeout(function(){res.json(grecaptchaStatus.responseCode)},2000);
    setTimeout(function(){
        if(isEmpty(myObj) || grecaptchaStatus.resultCode !== 0) {
        //console.log(myObj);
        //myObj.error="Error supply a data set.";
        //myObj.desc = grecaptchaStatus['responseDesc'];
        console.log(grecaptchaStatus);
        res.json(grecaptchaStatus);

    } else {
        // Object is NOT empty
        console.log(req.body.designapplication);
        if(req.body['designapplication'] === "designform") {
            //req is coming from resources page
            //var resObj = SendEmail(myObj, "/views/designIndex.pug");
            let uploadFile = req.files.file;
            msg.attachments[0].content = Buffer.from(uploadFile.data).toString("base64");
            msg.attachments[0].filename = uploadFile.name;
            let data = jade.renderFile(process.cwd() + '/views/design.jade', myObj)
            msg.html = data;
            sendEmail(msg)
            .then(json => {
            //success
            let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
            res.json(result);
            })
            .catch(err => {
            //error
            res.json({ code: err.code, message: err.message });
            //console.log(err);
            });
            // const msg = {
            //     to: ['l.riley@rileyandco.com', 'd.burns@rileyandco.com', 'g.velez@rileyandco.com'],
            //     from: 'noReply@rileyandco.com',
            //     bcc: 'joseiq91@gmail.com',
            //     subject: 'Lift Station Design Form',
            //     html: data,
            //   };
            // sgMail.send(msg, function(err, json) {
            //     if(err) {
            //         throw err;
            //     }
            //     let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
            //     res.json(result);
            //     //console.log(json);
            // });
        }
        else {
            //req coming from contact page
            //var resObj = SendEmail(myObj, "/views/index.pug");
            let data = jade.renderFile(process.cwd() + '/views/customer.jade', myObj)
            msg.html = data;
            sendEmail(msg)
            .then(json => {
            //success
            let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
            res.json(result);
            })
            .catch(err => {
            //error
            res.json({ code: err.code, message: err.message });
            //console.log(err);
            });
            // const msg = {
            //     to: ['l.riley@rileyandco.com', 'd.burns@rileyandco.com', 'g.velez@rileyandco.com'],
            //     from: 'noReply@rileyandco.com',
            //     bcc: 'joseiq91@gmail.com',
            //     subject: 'Customer Form',
            //     html: data,
            //   };
            // sgMail.send(msg, function(err, json) {
            //     if(err) {
            //         throw err;
            //     }
            //     let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
            //     res.json(result);
            //     //console.log(json);
            // });
        }
    }
    }, 2000);
        
});

verifyGoogleRecaptcha = (response, rip) => {
    var result = {};
    if(response === undefined || response === '' || response === null) {
        result.resultCode = 1;
        result.responseDesc = "Please Select captcha";
        return result;
  }
    

    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + recaptchaSecretKey + "&response=" + response + "&remoteip=" + rip;//+ "&remoteip=" + rip
  console.log(verificationUrl);
  console.log("secret Key: ", recaptchaSecretKey);
    // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
        result.resultCode = 1;
        result.responseDesc = "Failed captcha verification";
    }
      else {
          result.resultCode = 0;
          result.responseDesc = "Success";
      }

  });
    return result;
}

module.exports = router;
