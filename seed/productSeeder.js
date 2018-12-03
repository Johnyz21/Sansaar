const Product = require('../models/product');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping' , { useNewUrlParser: true });

var products = [
  new Product({
    imagePath: "/images/shop/shopImg1.jpg",
    title: "Sample Product 1",
    description: "Sample data for a sample product!",
    price:10
  }),
  new Product({
    imagePath: "/images/shop/shopImg2.jpg",
    title: "Sample Product 2",
    description: "Sample data for a sample product!",
    price: 15
  }),
  new Product({
    imagePath: "/images/shop/shopImg3.jpg",
    title: "Sample Product 3",
    description: "Sample data for a sample product!",
    price: 20
  })
];

var done = 0;
for(var i = 0; i < products.length; i++){
    products[i].save(function(err,result){
      done++;
      if(done === products.length){
        exit();
      }
    });
}

function exit(){
  mongoose.disconnect();
}
