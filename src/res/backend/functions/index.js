// const {BFast} = require('bfastnode');
//
// exports.helloWorld = BFast.functions().onHttpRequest('/hello', (request, response) => {
//     // your logic
//     response.send("Hello from BFast!");
// });
//
// exports.helloEvent = BFast.functions().onEvent("/hello", ({auth, payload, socket}) => {
//     // your logic
//     socket.emit('/hello', 'Hello from BFast!');
// });
//
// exports.sampleGuard = BFast.functions().onGuard('/', (request, response, next) => {
//     console.log('I am a guard');
//     next();
// });
//
// exports.sampleJob = BFast.functions().onJob({second: '*/3'}, _ => {
//     console.log(" I am a job running every 3 second");
// });
