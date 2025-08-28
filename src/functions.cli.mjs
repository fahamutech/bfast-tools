import {program} from "commander";
import {FunctionsController} from "./controller/functions.controller.mjs";
import nodemon from "nodemon";
import {Spinner} from "cli-spinner";
import inquirer from "inquirer";
import {RestController} from "./controller/rest.controller.mjs";
import {Utils} from "./utils/utils.mjs";
import {FunctionsCliController} from "./controller/functions.cli.controller.mjs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');



const _functionController = new FunctionsController(new RestController());
const _cliFunctionsController = new FunctionsCliController({
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
            console.log(e && e.message ? e.message : e.toString());
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
            console.log(e && e.message ? e.message : e.toString());
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
            console.log(e && e.message ? e.message : e.toString());
        }
    });

program
    .command('serve')
    .option('-p, --port <port>', "port to serve cloud functions local", 3000)
    .option('-db, --mongodb-url <mongodb-url>', "path to local mongodb")
    .option('--static', 'start in static mode without auto restart when files changes')
    .option('--appId <appId>', 'Application Id')
    .option('--projectId <projectId>', 'Project Id')
    .option('--masterKey <masterKey>', 'Application master key')
    .description('host functions local for test and development')
    .action((cmd) => {
        // process.env.MONGOMS_DEBUG = 1;
        process.env.DEV_WORK_DIR = process.cwd();
        process.env.DEV_PORT = cmd.port;
        // for bfast-node sdk
        process.env.IS_LOCAL_BFAST = 'true'
        if (cmd['mongodbUrl']) {
            process.env.MONGO_URL = cmd["mongodbUrl"];
        }
        if (cmd.appId) {
            process.env.APPLICATION_ID = cmd.appId;
        } else if (!process.env.APPLICATION_ID) {
            process.env.APPLICATION_ID = Utils.randomString(8);
            console.log("===========================================");
            console.log("GENERATED APPLICATION_ID :: " + process.env.APPLICATION_ID);
            console.log("===========================================");
        }

        if (cmd.projectId) {
            process.env.PROJECT_ID = cmd.projectId;
        } else if (!process.env.PROJECT_ID) {
            process.env.PROJECT_ID = Utils.randomString(12);
            console.log("===========================================");
            console.log("GENERATED PROJECT_ID :: " + process.env.PROJECT_ID);
            console.log("===========================================");
        }

        if (cmd.masterKey) {
            process.env.MASTER_KEY = cmd.masterKey;
        } else if (!process.env.MASTER_KEY) {
            process.env.MASTER_KEY = Utils.randomString(12);
            console.log("===========================================");
            console.log("GENERATED MASTER_KEY :: " + process.env.MASTER_KEY);
            console.log("===========================================");
        }


        if (cmd.static) {
            process.env.PRODUCTION = "1"
            if (!cmd['mongodbUrl']) {
                console.log('mongodb url required, try with --mongodb-url <your-mongo-db-url>');
                return;
            }
            _functionController.serve(process.cwd(), cmd.port);
        } else {
            if (!process.env.PRODUCTION) {
                process.env.PRODUCTION = "0";
            }
            nodemon({
                script: `${__dirname}/controller/dev-server.controller.mjs`,
                ignore: ["*.test.js", "**/node_modules/**"],
                ext: '.js,.json,.mjs,.cjs',
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
            console.log(e && e.message ? e.message : e.toString());
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
            console.log(e && e.message ? e.message : e.toString());
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
            console.log(e && e.message?e.message: e.toString());
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
            console.log(e && e.message?e.message: e.toString());
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
