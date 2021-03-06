// const paypal = require('paypal-rest-sdk');


// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': 'AVCZeYrCux3K7_R-c9sx9Eq9V2NcxKmVw-h9-Zk6c-8MMq-JnMJxMZhlu_m9kTQw62sZSAH1CSlYrcHe',
//   'client_secret': 'ECL880EkDN_WKC9nvXrjlmZ3fi7GckEFiRoT0Zp23GwSzOFkhlSHFLH19TfbeCSirk2ok0LOTSG9787A'
// });

exports.eventPaypalPaymentJson = function(event){

  var create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/shop/successfulEventPayment",
          "cancel_url": "http://localhost:3000/shop/cancelPayment"
      },
      "transactions": [{
          "item_list": {
            "items" : [{
              "name" : event._id,
              "sku" : "event",
              "price" : event.price,
              "currency" : "USD",
              "quantity" : 1
            }]
          },
          "amount": {
              "currency": "USD",
              "total": event.price
          },
          "description": "This is the payment description."
      }]
  };
  return create_payment_json;
}
exports.cartPaypalPaymentJson = function(cart){

  var payPalItemList = [];

  cart.generateArray().forEach(function(cartItem){
    payPalItemList.push({ "name": cartItem.item.title, "sku": "item", "price": cartItem.item.price, "currency":"USD", quantity:cartItem.qty});
  });
  console.log(payPalItemList);
  var create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/shop/successfulCartPayment",
          "cancel_url": "http://localhost:3000/shop/cancelPayment"
      },
      "transactions": [{
          "item_list": {
            "items" : payPalItemList
          },
          "amount": {
              "currency": "USD",
              "total": cart.totalPrice
          },
          "description": "This is the payment description."
      }]
  };
  return create_payment_json;
  // console.log(create_payment_json.transactions[0].item_list.items);

};

exports.createPaypalExecutePaymentJson = function(payerId, totalPrice){
  var execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": totalPrice
        }
    }]
  };

  return execute_payment_json;
}
