#!/usr/bin/env node

const program = require('commander');

program
    .version(require('../package').version);

program
    .command('functions', 'manage bfast cloud functions', {executableFile: 'bfast-functions'})
    .alias('fs');

program
    .command('user', 'manage user account', {executableFile: 'bfast-user'})
    .alias('me');

program
    .command('database', 'manage bfast::cloud database instance(s)', {executableFile: 'bfast-database'})
    .alias('db');

/**
 * @deprecated will be removed in v0.4.x use `cloud` command instead
 */
program
    .command('project', 'manage user bfast projects ( deprecated )', {executableFile: 'bfast-project'});

program
    .command('cloud', 'manage your bfast::cloud projects', {executableFile: 'bfast-cloud'});

program.on('command:*', function () {
    const cmd = program.args[0];
    const valid = (cmd === 'fs' ||
        cmd === 'functions' ||
        cmd === 'database' ||
        cmd === 'db' ||
        cmd === 'me' ||
        cmd === 'user' ||
        cmd === 'cloud' ||
        cmd === 'project');
    if (!valid) {
        console.error('Invalid command: %s\n', program.args.join(' '));
        program.help(help => {
            return help;
        });
    }
});

program.parse(process.argv);
