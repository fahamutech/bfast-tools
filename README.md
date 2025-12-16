# bfast-tools
CLI tools for manage your project ( s ) in [BFast Cloud](https://bfast.mraba.co.tz).

## Pre request

* Download and install [NodeJs](https://nodejs.org/en/download/) in your local PC. If you have it your good to go.

## Get stated
Install package from npm by run for linux: `sudo npm install -g bfast-tools`. For windows run: `npm install -g bfast-tools`

## BFast functions

Write your system functions with zero effort. Sub command to manage your functions is `bfast functions` 
or `bfast fs` 

### Create a workspace

run `bfast functions create <projectName>`. For example. 
```shell script
josh@xps:~/Desktop$ bfast functions create bfastDemoFaas
```

after that navigate inside your project directory. 
```shell script
josh@xps:~/Desktop$ cd bfastDemoFaas
josh@xps:~/Desktop/bfastDemoFaas$ 
```

after that install dependencies 
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ npm install
```

Inside your workspace folder you will find a following folder structure

```
.
|__ functions
|   |__ .ignore
|   |__ index.mjs
|   |__ package.json
|__ bfast.json
```

Open `index.mjs` in your favorite text editor. You will see a commented  example.

File `bfast.json` contain information of your BFast::Cloud project.

### Write your custom functions

You use [bfastnode](https://www.npmjs.com/package/bfastnode) package from npm to write your functions 

Choose text editor of your choice like VSCode or WebStorm. You can write your function is different ways. 

Single callback function

```javascript
const {BFast} = require('bfastnode');

exports.mySingleFunctionName = BFast.functions().onHttpRequest('/mySingleFunctionName',(request, response)=>{
        // your business logic
        response.send('your response');
    }
);
```

Many callback in array. Good if your apply a middleware before execute finally logic. Refer to ExpressJS Middlware
```javascript
const {BFast} = require('bfastnode');

exports.myArrayFunctionName = BFast.funtion().onHttpRequest('/myArrayFunctionName', [
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
);
```

### Serve functions locally

In your current project folder, run following script

* Start a dev server ( auto restart when you change or edit a function )
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000
```

Or

```shell script
josh@xps:~/Desktop/bfastDemoFaas$ npm start
```

* Start a static server which do not auto restart when you change or edit files in working directory
```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions serve --port 3000 --static
```

Default port is 3000, but you can change it by change a value of `port` option.

When everything is ok, you will see `BfastFunctions Engine Listening on 3000` or any port number you specify.

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


## Functions deployment

You can deploy your functions and host your server-less functions.
Read the docs here on how to lunch your server to host this functions
whether on docker or on bare server. https://github.com/fahamutech/bfast-functions. The docker image can be found at 

## Help

Contact FahamuTech Team @Joshua Mshana ( mama27j@gmail.com ) or leave an issue here at github
