const AfricasTalking = require('africastalking');

// TODO: Initialize Africa's Talking

const africastalking = AfricasTalking({
  apiKey: '803baeca97acf4fab5c2824fc223daf230b0a1da18d84ef401bb0b8aecc59999', 
  username: 'sandbox'
});



module.exports = async function sendSMS(msg) {
    
    // TODO: Send message
    try {
  const result=await africastalking.SMS.send(msg);
  console.log(result);
} catch(ex) {
  console.error(ex);
} 

};