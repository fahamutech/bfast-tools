# bfast-tools
CLI tools for manage your project(s) in (BFast::Cloud)[https://cloud.bfast.fahamutech.com].

## Get stated
Install package from npm by `npm i -g bfast-tools`

## BFast::Cloud Functions

### Create a workspace

run `bfast functions create <projectName>`. For example 
```shell script
josh@xps:~/Desktop$ bfast functions create bfastDemoFaas
```

after that navigate inside your project directory. 
```shell script
josh@xps:~/Desktop$ cd bfastDemoFaas
josh@xps:~/Desktop/bfastDemoFaas$ 
```

Inside your workspace folder you will find a following folder structure

```
.
|__ functions
|   |__ .ignore
|   |__ index.js
|   |__ package.json
|__ bfast.json
```

Open `index.js` in your favorite text editor. You will see a function example.

File `bfast.json` contain information of your BFast::Cloud project, leave it for now.

### Write your custom functions




Choose text editor of your choice like VSCode or WebStorm. You can write your function is different ways. 

Single callback function

``` javascript
exports.mySingleFunctionName = {
    onRequest: (request, response)=>{
        // your business logic
        response.send('your response');
    }
}
```

Many callback in array. Good if your apply a middleware before execute finally logic. Refer to ExpressJS Middlware
```javascript
exports.myArrayFunctionName = {
    onRequest: [
        (request, response, next)=>{
            // middleware logics
            request.query.from1 =  'query added in first callback';
            next();
        },
        (request, response)=>{
            // your business logic
            response.send(request.query.from1);
        }
    ]
}
```

Mount express router. Your can use Express Router to manage complex routing. First run `npm install express` inside functions folder to add express module

```javascript
var express = require('express')
var router = express.Router()

router.get('/', function (request, response) {
    // your logic
    response.send('get users');
});

router.post('/user', function (request, response) {
    // your logic
    response.send('User saved');
})

exports.functionNameUsingRouter = {
    onRequest: router
}
```

You can mount an express app too!. First run `npm install express` inside functions folder to add express module

```javascript
var express = require('express');
var app = new express();

app.get('/', function (request, response) {
    // your logic
    response.send('get users');
});

app.post('/user', function (request, response) {
    // your logic
    response.send('User saved');
})

exports.functionNameUsingExpressApp = {
    onRequest: app
}
```

### Serve functions locally

In your current project folder, run following script

```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000
```

Default port is 3000 but you can change it by change a value of port option.

When everything is ok, you will see `FaaS Engine Listening on 3000` or any port number you specify.

You will run a function in this format `<hostname>/function/<functionName>`. For example by using curl
```shell script
josh@xps:~$ curl http://localhost:3000/functions/mySingleFunctionName
```

Or open your browser and enter `http://localhost:3000/functions/mySingleFunctionName`

Replace `mySingleFunctionName` with a function name you want to call.

To see available functions name, run 
```shell script
josh@xps:~$ curl http://localhost:3000/functions/names
```

Or open your browser and enter `http://localhost:3000/functions/names`

## Deployment

By using bfast-tools package you can host functions to your server. 

Deployment instruction to BFast::Cloud Functions comming soon. Happy coding.
<!-- To deploy your functions to BFast::Cloud -->

## Note

* In this documentation we use port 3000, if you use a different port to run your functions replace 3000 with a port number you use in all examples found in this document to be relevant.

* You can get your names of your top level functions exported by run
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000

josh@xps:~/Desktop/bfastDemoFaas$ curl localhost:3000/names
```

* You can create a javascript file anywhere inside functions folder or even create a sub folder and put your functions as illustrated above and bfast-tools package will discover your functions

## Help

Contanct FahamuTech Team @Joshua Mshana ( mama27j@gmail.com ) or leave an issue here at github