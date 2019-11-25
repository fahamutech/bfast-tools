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
    .action((name, cdm) => {
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            const folder = `${process.cwd()}/${name}`;
            functionController.initiateFunctionsFolder(folder);
        } else {
            console.log('name format error')
        }
    });

program
    .command('deploy')
    .option('-f, --force', "force update of cloud function immediately")
    .description('deploy functions to bfast cloud functions instance(s)')
    .action((cmd) => {
        functionController.deploy(process.cwd(), !!cmd.force);
    });

program
    .command('serve')
    .option('-p, --port <port>', "port to serve cloud functions local", 3000)
    .description('host functions local for test and development')
    .action((cmd) => {
        functionController.serve(process.cwd(), cmd.port);
    });

program
    .command('env-add <env...>')
    .description('add environment(s) to bfast cloud functions instance(s)')
    .action((env, cmd) => {
        functionController.addEnv(process.cwd(), env, !!cmd.force);
    });

program
    .command('env-rm <env...>')
    .description('remove environment(s) to bfast cloud functions instance(s)')
    .action((env, cmd) => {
        functionController.removeEnv(process.cwd(), env, !!cmd.force);
    });

// error on unknown commands
program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' ')); // See --help" for a list of available commands.
    program.help(help => {
        return help.replace('bfast-functions', 'bfast functions');
    });
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-functions', 'bfast functions');
    });
}

