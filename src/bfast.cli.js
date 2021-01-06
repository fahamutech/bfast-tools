const program = require('commander');
const LocalStorageController = require('./controller/local-storage.controller');
const _storage = new LocalStorageController();
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

class BfastCli {

    static async clusterApiUrl() {
        const _cloudUrl = 'https://api.bfast.fahamutech.com';
        try {
            const settings = await _storage.getSettings();
            if (settings && settings.cloudUrl) {
                return settings.cloudUrl;
            } else {
                return _cloudUrl;
            }
        } catch (_) {
            return _cloudUrl;
        }
    };

    start() {
        program
            .version(require('../package').version);
        program
            .command('config')
            .description('Configure bfast tools')
            .action(async (cmd) => {
                try {
                    const answer = await inquirer.prompt([{
                        type: 'text',
                        validate: function (value) {
                            if (value) {
                                if (value.toString().trim().startsWith('http')) {
                                    return true;
                                }
                                return 'Please enter a valid http url'
                            } else {
                                return 'Please enter your cloud url'
                            }
                        },
                        name: 'cloudUrl',
                        message: 'Enter bfast cloud server url'
                    }]);
                    await _storage.saveSettings({cloudUrl: answer.cloudUrl.trim()});
                    console.log('Settings updated');
                } catch (e) {
                    console.log(e && e.message?e.message: e.toString());
                }
            });
        program
            .command('functions', 'manage bfast cloud functions', {executableFile: 'functions.cli'})
            .alias('fs')
        program
            .command('user', 'manage user account', {executableFile: 'user.cli'})
            .alias('me')
        program
            .command('database', 'manage bfast::cloud database instance(s)', {executableFile: 'database.cli'})
            .alias('db');
        program
            .command('project', 'manage your bfast cloud projects', {executableFile: 'project.cli'})
            .alias('cloud');

        program.on('command:*', function () {
            const cmd = program.args[0];
            const valid = (cmd === 'fs' ||
                cmd === 'functions' ||
                cmd === 'config' ||
                cmd === 'user' ||
                cmd === 'account' ||
                cmd === 'fn' ||
                cmd === 'database' ||
                cmd === 'db' ||
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
    }
}

module.exports = BfastCli;
