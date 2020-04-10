const program = require('commander');
const FunctionController = require('./controller/FunctionController');
const nodemon = require("nodemon");
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const inquirer = require('inquirer');

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
    .command('config')
    .description('set up git integration for deployment in bfast::cloud')
    .action(async (cmd) => {
        try {
            const answer = await inquirer.prompt([
                {
                    name: 'username',
                    message: 'remote github/bitbucket username',
                    type: 'text',
                    validate: (username) => {
                        if (username) {
                            return true;
                        } else {
                            return 'username required'
                        }
                    }
                },
                {
                    name: 'token',
                    message: 'personal access token ( if repo is private )',
                    type: 'text'
                },
                {
                    name: 'url',
                    message: 'remote repository url',
                    type: 'text',
                    validate: (url) => {
                        if (url) {
                            if (url.toString().startsWith('http') && url.toString().search('://') !== -1 && url.toString().endsWith('.git')) {
                                return true;
                            } else {
                                return 'must be a url and must start with http or https and ends with .git';
                            }
                        } else {
                            return 'repository url required'
                        }
                    }
                },
            ]);
            spinner.start();
            const envs = [];
            envs.push(`GIT_USERNAME=${answer.username}`, answer.token ? `GIT_TOKEN=${answer.token}` : '', `GIT_CLONE_URL=${answer.url}`);
            const response = await functionController.addEnv(process.cwd(), envs, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
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
    .option('-f, --force', "force update of cloud function immediately")
    .option('-p, --port <port>', "port to serve cloud functions local", 3000)
    .option('-d, --mongodb-url <mongodb-url>', "path to local mongodb", 'no')
    .option('--static', 'start in static mode without auto restart when files changes')
    .description('host functions local for test and development')
    .action((cmd) => {
        // process.env.MONGOMS_DEBUG = 1;
        process.env.DEV_WORK_DIR = process.cwd();
        process.env.DEV_PORT = cmd.port;
        process.env.MONGO_URL = cmd["mongodbUrl"];
        process.env.APPLICATION_ID = 'bfast_debug_appId';
        process.env.MASTER_KEY = 'bfast_debug_masterKey';
        process.env.DEV_ENV = 'true';
        if (cmd.static) {
            functionController.serve(process.cwd(), cmd.port);
        } else {
            nodemon({
                script: `${__dirname}/controller/devServer`,
                ext: 'js json',
                cwd: process.cwd() + '/functions'
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
    .option('-f, --force', "force update of cloud function immediately")
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
    .option('-f, --force', "force update of cloud function immediately")
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

program
    .command('switch-off')
    .option('-f, --force', "force update of cloud function immediately")
    .description('switch bfast cloud function instance(s) off')
    .action(async (cmd) => {
        try {
            spinner.start();
            const response = await functionController.switch(process.cwd(), 0, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('switch-on')
    .option('-f, --force', "force update of cloud function immediately")
    .description('switch bfast cloud function instance(s) on')
    .action(async (cmd) => {
        try {
            spinner.start();
            const response = await functionController.switch(process.cwd(), 1, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('domain-add <domain>')
    .option('-f, --force', "force update of cloud function immediately")
    .description('add custom domain to bfast cloud function instance(s) on')
    .action(async (domain, cmd) => {
        try {
            spinner.start();
            const response = await functionController.addDomain(process.cwd(), domain, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('domain-clear')
    .option('-f, --force', "force update of cloud function immediately")
    .description('remove all custom domain(s) to bfast cloud function instance(s) on')
    .action(async (cmd) => {
        try {
            spinner.start();
            await functionController.clearCustomDomain(process.cwd(), !!cmd.force);
            spinner.stop(true);
            console.log({message: 'Domain(s) removed'});
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
