
const Email = require('../config/email');

usersEmail = [];

for(var i = 0; i< 1; i ++){
  // usersEmail.push('bademail.co.uk');
  usersEmail.push('jjm21@hotmail.co.uk');
  // usersEmail.push('anotherbademail.co.uk');
  // usersEmail.push('jvrabadia@hotmail.com');

}

Email.eventConfirmationEmail(usersEmail,'Testing').then( (resolve) => {
  console.log('worked');
  console.log(resolve);
}, (error) => {
  console.log('error');
  console.log(error);
});


// console.log(usersEmail);
// usersEmail.forEach( async (userEmail) => {
//   // console.log(user);
//   await Email.eventConfirmationEmail(userEmail,'Testing');
// });
