const program = require('commander');
const {FunctionsController} = require('./controller/functions.controller');
const {CliFunctionsController} = require('./controller/functions.cli.controller');
const nodemon = require("nodemon");
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const inquirer = require('inquirer');
const {RestController} = require("./controller/rest.controller");
const {Utils} = require('./utils/utils');

const _functionController = new FunctionsController(new RestController());
const _cliFunctionsController = new CliFunctionsController({
    functionController: _functionController
});

program
    .command('create <name>')
    .description('create new cloud::functions workspace')
    .action(async (name, cdm) => {
        try {
            spinner.start();
            const response = await _cliFunctionsController.createAWorkspace(name);
            console.log(response);
            spinner.stop(true);
        } catch (e) {
            console.log(e);
            spinner.stop(true);
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
            const response = await _functionController.addEnv(process.cwd(), envs, !!cmd.force);
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
            const response = await _functionController.deploy(process.cwd(), !!cmd.force, {
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
    .option('-db, --mongodb-url <mongodb-url>', "path to local mongodb", 'no')
    .option('--static', 'start in static mode without auto restart when files changes')
    .option('--appId', 'Application Id')
    .option('--masterKey', 'Application master key')
    .description('host functions local for test and development')
    .action((cmd) => {
        // process.env.MONGOMS_DEBUG = 1;
        process.env.DEV_WORK_DIR = process.cwd();
        process.env.DEV_PORT = cmd.port;
        // for bfast-node sdk
        process.env.IS_LOCAL_BFAST = 'true'
        process.env.MONGO_URL = cmd["mongodbUrl"];
        process.env.APPLICATION_ID = cmd.appId ? cmd.appId : Utils.randomString(8);
        process.env.MASTER_KEY = cmd.masterKey ? cmd.masterKey : Utils.randomString(12);
        if (cmd.static) {
            process.env.PRODUCTION = "1"
            if (cmd['mongodbUrl'] === 'no') {
                console.log('mongodb url required, try with --mongodb-url <your-mongo-db-url>');
                return;
            }
            _functionController.serve(process.cwd(), cmd.port);
        } else {
            process.env.PRODUCTION = "0";
            nodemon({
                script: `${__dirname}/controller/dev-server.controller`,
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
            const response = await _functionController.addEnv(process.cwd(), env, !!cmd.force);
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
            const response = await _functionController.removeEnv(process.cwd(), env, !!cmd.force);
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
            const response = await _functionController.switch(process.cwd(), 0, !!cmd.force);
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
            const response = await _functionController.switch(process.cwd(), 1, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

// program
//     .command('domain-add <domain>')
//     .option('-f, --force', "force update of cloud function immediately")
//     .description('add custom domain to bfast cloud function instance(s) on')
//     .action(async (domain, cmd) => {
//         try {
//             spinner.start();
//             const response = await _functionController.addDomain(process.cwd(), domain, !!cmd.force);
//             spinner.stop(true);
//             console.log(response);
//         } catch (e) {
//             spinner.stop(true);
//             console.log(e);
//         }
//     });
//
// program
//     .command('domain-rm')
//     .option('-f, --force', "force update of cloud function immediately")
//     .description('remove all custom domain(s) to bfast cloud function instance(s) on')
//     .action(async (cmd) => {
//         try {
//             spinner.start();
//             await _functionController.clearCustomDomain(process.cwd(), !!cmd.force);
//             spinner.stop(true);
//             console.log({message: 'Domain(s) removed'});
//         } catch (e) {
//             spinner.stop(true);
//             console.log(e);
//         }
//     });

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
