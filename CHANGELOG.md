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
