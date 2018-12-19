
const Email = require('../config/email');

usersEmail = [];

for(var i = 0; i< 4; i ++){
  usersEmail.push('jjm21@hotmail.co.uk');
}

var finaly = Email.eventConfirmationEmail(usersEmail,'Testing');

// console.log(usersEmail);
// usersEmail.forEach( async (userEmail) => {
//   // console.log(user);
//   await Email.eventConfirmationEmail(userEmail,'Testing');
// });
