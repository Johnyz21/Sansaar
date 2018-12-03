const User = require('../models/user');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping' , { useNewUrlParser: true });

var users = [
  new User({
    email: 'admin@admin.com',
    admin : true
  }),
  new User({
    email: 'normal@normal.com',
    admin : false
  }),
  new User({
    email: 'normal2@normal2.com',
    admin : false
  })
];

var done = 0;
for(var i = 0; i < users.length; i++){
    users[i].password = users[i].encryptPassword('test');
    users[i].save(function(err,result){
      done++;
      if(done === users.length){
        exit();
      }
    });
}

function exit(){
  mongoose.disconnect();
}
