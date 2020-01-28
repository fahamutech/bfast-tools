const program = require('commander');
const FunctionController = require('./controller/FunctionController');
const nodemon = require("nodemon");
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const functionController = new FunctionController();

program
    .command('create <name>')
    .description('create new cloud functions workspace')
    .action((name, cdm) => {
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            spinner.start();
            const folder = `${process.cwd()}/${name}`;
            const response = functionController.initiateFunctionsFolder(folder);
            spinner.stop(true);
            console.log(response);
        } else {
            console.log('\nname format error');
            spinner.stop();
        }
    });

program
    .command('deploy')
    .option('-f, --force', "force update of cloud function immediately")
    .option('--projectId <projectId>', 'Project Id to deploy functions')
    .option('--token <token>', "Token to authenticate when deploy functions")
    .description('deploy functions to bfast cloud functions instance(s)')
    .action(async (cmd) => {
        try {
            spinner.start();
            const response = await functionController.deploy(process.cwd(), !!cmd.force, {
                token: cmd.token,
                projectId: cmd.projectId
            });
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('serve')
    .option('-p, --port <port>', "port to serve cloud functions local", 3000)
    .option('--static', 'start in static mode without auto restart when files changes')
    .description('host functions local for test and development')
    .action((cmd) => {
        if (cmd.static) {
            functionController.serve(process.cwd(), cmd.port);
        } else {
            process.env.DEV_WORK_DIR = process.cwd();
            process.env.DEV_PORT = cmd.port;
            nodemon({
                script: `${__dirname}/controller/devServer`,
                ext: 'js json',
                cwd: process.cwd()
            });
            nodemon.on('start', function () {
                console.log('auto restart dev server has started');
            }).on('quit', function () {
                console.log('App has quit');
                process.exit();
            }).on('restart', function (files) {
                console.log('App restarted due to: ', files);
            });
        }
    });

program
    .command('env-add <env...>')
    .description('add environment(s) to bfast cloud functions instance(s)')
    .action(async (env, cmd) => {
        try {
            spinner.start();
            const response = await functionController.addEnv(process.cwd(), env, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('env-rm <env...>')
    .description('remove environment(s) to bfast cloud functions instance(s)')
    .action(async (env, cmd) => {
        try {
            spinner.start();
            const response = await functionController.removeEnv(process.cwd(), env, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

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

