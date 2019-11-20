const program = require('commander');
const FunctionController = require('./controller/FunctionController');
const ResourceFactory = require('./factory/ResourceFactory');
const AuthController = require('./controller/AuthController');

const functionController = new FunctionController({
    resourceFactory: new ResourceFactory(),
    authController: new AuthController()
});

program
.command('create <name>')
.description('create new cloud functions workspace')
.action((name, cdm)=>{
    if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
        const folder = `${process.cwd()}/${name}`;
        functionController.initiateFunctionsFolder(folder);
        console.log('create is called with name: ' + name);
    }else{
        console.log('name format error')
    }
});

program
.command('deploy')
.option('-f, --force', "force update of cloud function immediately")
.description('deploy cloud functions to bfast')
.action((cmd)=>{
    functionController.deploy(process.cwd(), !!cmd.force)
    // console.log('deploy is called');
});

program
.command('serve')
.option('-p, --port <port>', "port to serve cloud functions local", 3000)
.description('host cloud functions local for test and development')
.action((cmd)=>{
    functionController.serve(process.cwd(), cmd.port);
    // console.log('serve is called with port : ' + cmd.port);
})

program.parse(process.argv);