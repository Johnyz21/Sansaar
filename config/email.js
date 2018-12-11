const nodemailer = require('nodemailer');
const Cart = require('../models/cart');

const emailUsername = 'Sansaarpilgrims@gmail.com';
const emailPassword =  'Shiva4774';

//jonnyWillEmail21@gmail.com
// 'Testing123!';

exports.emailOrder = function(recipient, order){

   var cart = new Cart(order.cart);
   var cartItems = cart.generateArray();
   var htmlItems = '';

   cartItems.forEach(function(cartItem){
     htmlItems +=  '<p>' + ' x' + cartItem.qty +' '+cartItem.item.title  + ' - £'+ cartItem.price + ' </p> </br> <hr> </br>'
   })

   var transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: emailUsername,
       pass: emailPassword
     }
   });

   var mailOptions = {
     from: emailUsername,
     to: recipient,
     subject: 'Event Confirmation',
     html: '<h1> Sansaar Pilgrims </h1>' +
           '</br> ' +
           '<p>Thank you for your order, your payment ID is: ' + order.paymentId + '</p>' +
           '</br>'+
           '<p>Your Order is as follows</p>' +
           htmlItems
   };

   transporter.sendMail(mailOptions, function(error, info) {
     if (error) {
       console.log(error);
     } else {
       console.log('Email sent: ' + info.response);
     }
   });


}
exports.eventConfirmationEmail = function(recipient, eventName) {
  // var htmlEventNames = '';
  // eventNames.forEach(function(event){
  //   htmlEventNames += '<p>' + event + '</p> </br>'
  // });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUsername,
      pass: emailPassword
    }
  });

  var mailOptions = {
    from: emailUsername,
    to: recipient,
    attachments: [{
      filename: 'SansaarPilgrims-TourRegistrationForm.docx',
      path: 'https://www.sansaaruk.com/docx/SansaarPilgrims-TourRegistrationForm.docx'
    }],
    subject: 'Event Confirmation',
    html: '<h1> Sansaar Pilgrims </h1>' +
          '</br> ' +
          '<p>Hey ' + recipient + ',</p>' +
          '</br>'+
          '<p>Your Registration for <strong>' + eventName +  '</strong> has been been approved:</p>' +
          '<p>Please download and fill in the attached word document with the relevant information</p>' +
          '<p>You are now able purchase the event online. Please do so to confirm your attendence</p> </br>'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}
