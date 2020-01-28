#!/usr/bin/env node

const program = require('commander');

program
    .version(require('../package').version)
    .command('functions', 'manage bfast cloud functions', {executableFile: 'bfast-functions'})
    .alias('fs');

program
    .version(require('../package').version)
    .command('user', 'manage user account', {executableFile: 'bfast-user'})
    .alias('me');


program
    .version(require('../package').version)
    .command('project', 'manage user bfast projects', {executableFile: 'bfast-project'});

program.parse(process.argv);
