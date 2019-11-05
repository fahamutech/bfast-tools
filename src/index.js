#!/usr/bin/env node

const program = require('commander');
const FunctionController = require('./controller/FunctionController');
const ResourceFactory = require('./factory/ResourceFactory');
const AuthController = require('./controller/AuthController');

const functionController = new FunctionController({
    resourceFactory: new ResourceFactory(),
    authController: new AuthController()
});

program
    .version(require('../package').version)
    .command('functions [name]') // sub-command name
    .alias('fs') // alternative sub-command is `al`
    .option('--create', 'create a new workspace')
    .option('--deploy', 'deploy functions to bfast cloud')
    .option('--serve', 'run functions locally for debug')
    .action((name, program) => {
        const folder = `${process.cwd()}/${name}`;
        if (program.create && program.deploy || program.create && program.serve) {
            console.log('please specify a single option for now')
        } else {
            if (program.create && name && name !== '' && name !== '.') {
                functionController.initiateFunctionsFolder(folder);
            } else if (program.deploy) {
                console.log('we will deploy a function');
            } else if (program.serve) {
                functionController.serve(process.cwd());
            } else {
                console.log('specify what you want to do');
            }
        }
    });


// allow commander to parse `process.argv`
program.parse(process.argv);
