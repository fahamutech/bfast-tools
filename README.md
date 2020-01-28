# bfast-tools
CLI tools for manage your project(s) in [BFast::Cloud](https://cloud.bfast.fahamutech.com).

## Get stated
Install package from npm by `npm i -g bfast-tools`

## Pre request
* See [CHANGELOG](CHANGELOG.md) to see whats changed depend on version
* Download and install [NodeJs](https://nodejs.org/en/download/) in your local PC. If you have it your good to go

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

```javascript
exports.mySingleFunctionName = {
    path: '/mySingleFunctionName', /*set path of this function its optional property*/
    onRequest: (request, response)=>{
        // your business logic
        response.send('your response');
    }
}
```

Many callback in array. Good if your apply a middleware before execute finally logic. Refer to ExpressJS Middlware
```javascript
exports.myArrayFunctionName = {
    path: '/myArrayFunctionName', /*set path of this function its optional property*/
    onRequest: [
        (request, response, next)=>{
            // middleware logic
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
    path: '/functionNameUsingRouter', /*set path of this function its optional property*/
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
    path: '/functionNameUsingExpressApp', /*set path of this function its optional property*/
    onRequest: app
}
```

**NOTE**
'path' property is optional when used must start with '/' if not used your functon 
will be available as `<hostname>/functions/<functionNameExported>`

### Serve functions locally

In your current project folder, run following script

* Start a dev server ( auto restart when you change or edit a function )
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000
```

* Start a static server which do not auto restart when you change or edit files in working directory
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000 --static
```

Default port is 3000 but you can change it by change a value of `port` option.

When everything is ok, you will see `FaaS Engine Listening on 3000` or any port number you specify.

### Use functions you write

* If you use `path` field to specify address of your function you will use that path
* If your do not use `path` field the your function will be available in this format 
`<hostname>/function/<functionName>`. For example by using curl
```shell script
josh@xps:~$ curl http://localhost:3000/functions/functionName
```
Or
```shell script
josh@xps:~$ curl http://localhost:3000/<path>
```

Or open your browser and enter `http://localhost:3000/functions/mySingleFunctionName` if you use `path` field 
in your browser put this address http://localhost:3000/pathYouUse

Replace `mySingleFunctionName` with a function name you want to call.


## Cloud Functions Deployment

You can deploy your functions to bfast cloud and host your server-less functions across our network.

#### Open Account
To publish your functions you must have a bfast cloud functions open one here [BFAST::CLOUD](http://bfast.fahamutech.com). 
After open account now you create your new project and you go to next step

#### Login from your computer
Login from your computer by run.
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast user login --username <PUT_EMAIL_YOU_USE_TO_OPEN_BFAST_ACCOUNT>
```

#### Link your local project to remote bfast project
Run thr following in your bfast local project folder
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast project link
```

#### Set git environments

We use git to deploy your functions to bfast cloud function instance(s). Run thr following to set up git environments
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions env-add GIT_USERNAME=yourUsername GIT_TOKEN=personalAccessToken GIT_CLONE_URL=repositoryUrlForYourProject
```

#### To publish your functions
* Make sure you push all your production functions to `master` branch
* Then run
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions deploy
```

#### Continuous Integration

* Generate token to use it for your favorite CI tool

```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast user login:ci --username <PUT_EMAIL_YOU_USE_TO_OPEN_BFAST_ACCOUNT>
```

You can use token generated and example given to set your continuous integration 
environment.

**NOTE**

In CI mode you must set projectId manually to deploy your functions your can find projectId from your project console 
in bfast cloud account


## Notes To Take

* In this documentation we use port 3000, if you use a different port to run your functions replace 3000 with a port number you use in all examples found in this document to be relevant.

* You can create a javascript file anywhere inside functions folder or even create a sub folder and put your functions as illustrated above and bfast-tools package will discover your functions

## Help

Contact FahamuTech Team @Joshua Mshana ( mama27j@gmail.com ) or leave an issue here at github
