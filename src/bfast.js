#!/usr/bin/env node

const program = require('commander');

program
    .version(require('../package').version)
    .command('functions', 'manage bfast cloud functions', {executableFile: 'bfast-functions'})
    .alias('fs');

program.parse(process.argv);
