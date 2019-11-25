# v0.2.1

Start fixing issue on window system

# v0.2.0

Add more detail in documentation

Change command api.

* To deploy a function now run 
```shell script
~$ bfast functions deploy
```

* To create a new workspace
```shell script
~$ bfast functions create <name>
```

* To serve a functions run 
```shell script
~$ bfast functions serve --port 3000
```
when port option omitted, 3000 will be a default port number

# v0.1.2 

Remove un wanted printed logs

# v0.1.1

* Now you can deploy function ( this function is under test )

```shell script
~$ bfast functions --deploy
```

# v0.1.0
 * change function structure, now we can write functions in the following format
 ```javascript
exports.functionName = {
    onRequest: (request, response)=>{
        // your logic
        response.json({message: 'response message'})
    }
}

```

if your using bfast-tools@0.0.1 your required to migrate your functions to meet that format and 
upgrade bfast-tools to v0.1.0

# v0.0.1
first draft release
