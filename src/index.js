#!/usr/bin/env node

const program = require('commander');

program
    .version(require('../package').version)
    .command('functions', 'manage bfast cloud functions')
    .alias('fs');

program.parse(process.argv);
if(program.args.length === 1){
    program.help();
}
