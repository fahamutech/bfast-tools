# bfast-tools
CLI tools for bfast-ee cloud.

## Get stated
install package from npm by `npm i -g bfast-tools` or clone project and then run `npm i -g ./`

## BFast Cloud Functions

### Start a new project

run `bfast functions --create <projectName>`. For example 
```shell script
josh@xps:~/Desktop$ bfast functions --create bfastDemoFaas
```

after that navigate inside your project directory. 
```shell script
josh@xps:~/Desktop$ cd bfastDemoFaas
josh@xps:~/Desktop/bfastDemoFaas$ 
```

Then open your project folder in any text edit and start write your functions


### Serve functions locally

In your current project folder, run following script

```shell script
josh@xps:~/Desktop/bfastDemoFaas$ bfast functions --serve --port 3000
```
default port is 3000 but you can change it by change a value of port option

