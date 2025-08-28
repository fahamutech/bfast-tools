import {program} from "commander";
import {LocalStorageController} from "./controller/local-storage.controller.mjs";
import inquirer from "inquirer";
import {Spinner} from "cli-spinner";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const _storage = new LocalStorageController();
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

export class BFastJs {

    static async clusterApiUrl() {
        const _cloudUrl = 'https://api.bfast.mraba.co.tz';
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
            .alias('fs');
        program
            .command('user', 'manage user account', {executableFile: 'user.cli'})
            .alias('me');
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
