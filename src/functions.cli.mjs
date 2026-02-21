#!/usr/bin/env node
import {program} from "commander";
import {FunctionsController} from "./controller/functions.controller.mjs";
import nodemon from "nodemon";
import {Spinner} from "cli-spinner";
import {FunctionsCliController} from "./controller/functions.cli.controller.mjs";
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const functionController = new FunctionsController();
const cliFunctionsController = new FunctionsCliController({
    functionController: functionController
});

program
    .command('create <name>')
    .description('create new local bfast-functions workspace')
    .action(async (name) => {
        try {
            spinner.start();
            const response = await cliFunctionsController.createAWorkspace(name);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e && e.message ? e.message : e.toString());
        }
    });

program
    .command('serve')
    .option('-p, --port <port>', 'port to serve local functions', '3000')
    .option('--static', 'start without auto restart when files change')
    .description('serve local functions for development')
    .action((cmd) => {
        process.env.DEV_WORK_DIR = process.cwd();
        process.env.DEV_PORT = cmd.port;
        process.env.IS_LOCAL_BFAST = 'true';

        if (cmd.static) {
            process.env.PRODUCTION = '1';
            functionController.serve(process.cwd(), cmd.port);
            return;
        }

        if (!process.env.PRODUCTION) {
            process.env.PRODUCTION = '0';
        }

        nodemon({
            script: `${__dirname}/controller/dev-server.controller.mjs`,
            ignore: ['*.test.js', '**/node_modules/**'],
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
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' '));
    program.help(help => help.replace('bfast-functions', 'bfast functions'));
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => help.replace('bfast-functions', 'bfast functions'));
}
