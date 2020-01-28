#v0.2.3

Remove unused dependencies

# v0.2.2

Bug fixes and improvement like project linking and show progress for long process and custom path for your function

### Whats new

* Now dev server restart when you changes happens in your workspace directory. 
To start dev server
```shell script
~$ bfast functions serve
```
You can use no restart dev server by running
```shell script
~$ bfast functions serve --static
```
* `user` command is added to manege your bfast cloud account
Now you can authenticate your self with bfast cloud account
```shell script
~$ bfast user login --username <YOUR_EMAIL_USED_TO_OPEN_BFAST_ACCOUNT>
```

To log out you can run 
```shell script
~$ bfast user logout
```

To get token to login in CI mode you run

```shell script
~$ bfast user login:ci --username <YOUR_EMAIL_USED_TO_OPEN_BFAST_ACCOUNT>
```

* `project` command is added manage linking of your local project to bfast cloud project
To link your local project to remote project run
```shell script
~$ bfast project link
```

To remove link between you local project with a remote project run
```shell script
~$ bfast project unlink
```

* Functions can be given a custom path 
```javascript
exports.helloWorld = {
    path: '/hello',
    onRequest: (request, response)=>{
        response.send('Hello from custom path');
    }   
}
```
The above functions will be available at `yourhost/hello` instead of `yourhost/functions/helloWorld`. if `path` field 
is not specified addressing will fall to the default one.

### Bug fixed

* deploy of functions fixed

# v0.2.1

Now you can add environment variable to bfast cloud functions instance and remove it

* Add environment to bfast cloud functions
```shell script
~$ bfast functions env-add name=john age=10
```

* Remove environment
```shell script
~$ bfast functions env-rm name
```

For more details run `bfast functions help`

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
