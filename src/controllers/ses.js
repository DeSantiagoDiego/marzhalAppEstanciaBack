// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

const awsConfig = { 
    "accessKeyId": "AKIA4E77RYS2P52XQRUF",
    "secretAccessKey": "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"
}

AWS.config.update(awsConfig);
// Set the region 
AWS.config.update({region: 'us-west-2'});

//Create function to export
let sendEmail = (email, asunto, html)=>{
// Create sendEmail params 
var params = {
    Destination: { /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        email,
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: html
        },
        // Text: {
        //  Charset: "UTF-8",
        //  Data: mensaje + " " +emailContacto
        // }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: asunto
       }
      },
    Source: 'fakturor@fakturor.com.mx', /* required */
  };
  // Create the promise and SES service object
    return new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
} 


module.exports = {
    sendEmail
};
