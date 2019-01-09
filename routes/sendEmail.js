var express = require('express');
var router = express.Router();

const Promise = require("bluebird");
const sgMail = require('@sendgrid/mail');


//env config variables
const apiKey = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(apiKey);
var Recaptcha = require('express-recaptcha').Recaptcha;
const recatchaSecret = process.env.RECAPTCHA_SECRET || '';
var recaptcha = new Recaptcha('6Lev14EUAAAAANwrWVUGu34pxWvr4SaS3E40XsoT', recatchaSecret);

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


/* GET email listing. */
router.get('/', function(req, res, next) {
  res.send('sending some response back!');
});


router.post('/', recaptcha.middleware.verify, function(req, res, next) {
    if (!req.recaptcha.error) {
        // success code
        if(req.body.generalcontact === 'contactform'){
            sendEmail( {
                to: ['l.riley@rileyandco.com', 'd.burns@rileyandco.com', 'g.velez@rileyandco.com'],
                from: 'noreply@rileyandco.com',
                bcc: 'joseiq91@gmail.com',
                subject: 'Customer Form from Website',
                html: jade.renderFile(process.cwd() + '/views/customer.jade', req.body)
            })
            .then(json => {
            //success
            let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
            res.json(result);
            })
            .catch(err => {
            //error
            res.json({ "resultCode": 1, "responseDesc": "Something went wrong, Email not sent!" });
            });
        }
        else if(req.body.designapplication === 'designform') {
                sendEmail( {
                    to: ['l.riley@rileyandco.com', 'd.burns@rileyandco.com', 'g.velez@rileyandco.com'],
                    from: 'noreply@rileyandco.com',
                    bcc: 'joseiq91@gmail.com',
                    attachments: [{content: Buffer.from(req.files.file.data).toString("base64"), filename: req.files.file.name}],
                    subject: 'Design Form from Website',
                    html: jade.renderFile(process.cwd() + '/views/design.jade', req.body)
                })
                .then(json => {
                //success
                let result = {"resultCode": 0, "responseDesc": "Email has successfully sent. Thank you for your business."};
                res.json(result);
                })
                .catch(err => {
                //error
                res.json({ "resultCode": 1, "responseDesc": "Something went wrong, Email not sent!" });
                });
        }
        else {
            res.json({"resultCode": 1, "responseDesc": "Email not sent. Something bad happened!"});
        }
        
      } else {
        // error code
        res.json({"resultCode": 1, "responseDesc": req.recaptcha.error});
      }     
});

module.exports = router;
