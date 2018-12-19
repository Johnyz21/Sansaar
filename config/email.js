const nodemailer = require('nodemailer');
const Cart = require('../models/cart');

const emailUsername = 'Sansaarpilgrims@gmail.com';
const emailPassword =  'Shiva4774';
const serviceProvider = 'gmail';
// const emailUsername = 'jjm21@hotmail.co.uk';
// const emailPassword = 'Grandad8wow';
// const serviceProvider = 'hotmail';

var transporter = nodemailer.createTransport({
  service: serviceProvider,
  auth: {
    user: emailUsername,
    pass: emailPassword
  }
});

exports.emailOrder = function(recipient, order) {

  var cart = new Cart(order.cart);
  var cartItems = cart.generateArray();
  var htmlItems = '';

  cartItems.forEach(function(cartItem) {
    htmlItems += '<p>' + ' x' + cartItem.qty + ' ' + cartItem.item.title + ' - £' + cartItem.price + ' </p> </br> <hr> </br>'
  })

  var transporter = nodemailer.createTransport({
    service: serviceProvider,
    auth: {
      user: emailUsername,
      pass: emailPassword
    }
  });

  var mailOptions = {
    from: emailUsername,
    to: recipient,
    subject: 'Order Confirmation',
    html: '<h1> Sansaar Pilgrims </h1>' +
      '</br> ' +
      '<p>Thank you for your order, your payment ID is: ' + order.paymentId + '</p>' +
      '</br>' +
      '<p>Your Order is as follows</p>' +
      htmlItems
  };

  transporter.sendMail(mailOptions, function(error, info) {
    return callback(error, info);
  });


}
exports.eventConfirmationEmail = async function(recipients, eventName) {

  // recipients.forEach((recipient) => {



  for (let i = 0; i < recipients.length; i++) {


    setTimeout( function sendM(){

      var mailOptions = {
        from: emailUsername,
        to: recipients[i],
        attachments: [{
          filename: 'SansaarPilgrims-TourRegistrationForm.docx'
          // , path: 'https://www.sansaaruk.com/docx/SansaarPilgrims-TourRegistrationForm.docx'
        }],
        subject: 'Event Confirmation',
        html: '<h1> Sansaar Pilgrims </h1>' +
              '</br> ' +
              '<p>Hey ' + recipients[i] + ',</p>' +
              '</br>'+
              '<p>Your Registration for <strong>' + eventName +  '</strong> has been been approved:</p>' +
              '<p>Please log in, navigate to the events page and complete the registration process </p>'
              // '<p>Please download and fill in the attached word document with the relevant information</p>' +
              // '<p>You are now able purchase the event online. Please do so to confirm your attendence</p> </br>'
      };

      mailOptions.to = recipients[i];

      transporter.sendMail(mailOptions, function(error, info) {
        if(error){
          console.log(error);
          errorEmailing.push(recipient[i]);
        } else {
          console.log(info);
          successfullyEmailed.push(reipient[i]);
        }
      });
    }, i* 2000, i);

  }
  // })


}
