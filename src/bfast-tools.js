const program = require('commander');
const LocalStorageController = require('./controller/LocalStorageController');
const _storage = new LocalStorageController();
const UserController = require('./controller/UserController');
const DatabaseController = require('./controller/LocalStorageController');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const _database = new DatabaseController();
const _userController = new UserController();


class BfastJs {

    constructor() {
    }

    static clusterApiUrl() {
        const _cloudUrl = 'https://api.bfast.fahamutech.com';
        return _cloudUrl;
        // try {
        //     const settings =  _storage.getSettings();
        //     if (settings && settings.cloudUrl) {
        //         return settings.cloudUrl;
        //     } else {
        //         return _cloudUrl;
        //     }
        // } catch (_) {
        //     return _cloudUrl;
        // }
    };

    cli() {
        this._cmds();
        program
            .version(require('../package').version);
        program
            .command('functions', 'manage bfast cloud functions', {executableFile: 'bfast-functions'})
            .alias('fs')
            .alias('fn');
        // program
        //     .command('user', 'manage user account', {executableFile: 'bfast-user'})
        //     .alias('me')
        //     .alias('account');
        program
            .command('database', 'manage bfast::cloud database instance(s)', {executableFile: 'bfast-database'})
            .alias('db');
        program
            .command('cloud', 'manage your bfast::cloud projects', {executableFile: 'bfast-cloud'});

        program.on('command:*', function () {
            const cmd = program.args[0];
            const valid = (cmd === 'fs' ||
                cmd === 'functions' ||
                cmd === 'fn' ||
                cmd === 'database' ||
                cmd === 'db' ||
                cmd === 'login' ||
                cmd === 'login:ci' ||
                cmd === 'logout' ||
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

    _cmds() {
        program
            .command('login')
            .option('-u, --username',
                'Email you used to open bfast cloud account.')
            .option('-p, --password', 'Password for your account')
            .description('login to your remote bfast cloud account')
            .action(async (cdm) => {
                if (cdm.username && cdm.username !== '') {
                    try {
                        const answer = await inquirer.prompt([
                            {name: "password", type: 'password', message: 'Please enter your password', mask: '*'}
                        ]);
                        spinner.start();
                        await _database.saveUser(await _userController.login(cdm.username, answer.password));
                        console.log('\nSuccessful login');
                        spinner.stop();
                    } catch (e) {
                        console.log('\nLogin fails');
                        console.log(e);
                        spinner.stop();
                    }
                } else {
                    try {
                        const answer = await inquirer.prompt([
                            {
                                name: "username",
                                type: 'text',
                                message: 'Please enter your username ( email )',
                            },
                            {
                                name: "password",
                                type: 'password',
                                message: 'Please enter your password',
                                mask: '*'
                            },
                        ]);
                        spinner.start();
                        await _database.saveUser(await _userController.login(answer.username, answer.password));
                        console.log('\nSuccessful login');
                        spinner.stop();
                    } catch (e) {
                        console.log('\nLogin fails');
                        console.log(e);
                        spinner.stop();
                    }
                }
            });

        program
            .command('logout')
            .description('logout from this device')
            .action(async cmd => {
                try {
                    spinner.start();
                    const user = await _database.getUser();
                    const response = await _userController.logout(user);
                    await _database._deleteCurrentUser();
                    spinner.stop(true);
                    console.log(response.message ? response.message : response);
                    console.log('logout successful');
                } catch (e) {
                    await _database._deleteCurrentUser();
                    spinner.stop(true);
                    console.log('logout successful');
                }
            });

        program
            .command('login:ci')
            .option('-u, --username <username>',
                'Email you used open bfast cloud account')
            .option('-p, --password', 'Password for your account')
            .description('get token to be used in your continues integration')
            .action(async (cdm) => {
                if (cdm.username && cdm.username !== '') {
                    try {
                        const answer = await inquirer.prompt([
                            {name: "password", type: 'password', message: 'Please enter your password', mask: '*'}
                        ]);
                        spinner.start();
                        const user = await _userController.login(cdm.username, answer.password);
                        spinner.stop(true);
                        console.log('\nNow in your favorite CI environment' +
                            ' run "bfast functions deploy --token ${BFAST_TOKEN}' +
                            ' --projectId ${PROJECT_ID}" to deploy functions, copy token below');
                        console.log(`\n\t${user.token}\n`)
                    } catch (e) {
                        console.log('\nLogin fails');
                        console.log(e);
                        spinner.stop();
                    }
                } else {
                    try {
                        const answer = await inquirer.prompt([
                            {
                                name: "username",
                                type: 'text',
                                message: 'Please enter your username ( email )',
                            },
                            {
                                name: "password",
                                type: 'password',
                                message: 'Please enter your password',
                                mask: '*'
                            },
                        ]);
                        spinner.start();
                        const user = await _userController.login(answer.username, answer.password);
                        console.log('\nNow in your favorite CI environment' +
                            ' run "bfast functions deploy --token ${BFAST_TOKEN}' +
                            ' --projectId ${PROJECT_ID}" to deploy functions, copy token below');
                        console.log(`\n\t${user.token}\n`);
                        spinner.stop();
                    } catch (e) {
                        console.log('\nLogin fails');
                        console.log(e);
                        spinner.stop();
                    }
                }
            });

        program.on('command:*', function () {
            console.error('Invalid command: %s\n', program.args.join(' ')); // See --help" for a list of available commands.
            program.help(help => {
                return help.replace('bfast-user', 'bfast user');
            });
        });

        // program.parse(process.argv);
        //
        // if (process.argv.length === 2) {
        //     program.help(help => {
        //         return help.replace('bfast-user', 'bfast user');
        //     });
        // }

    }
}

module.exports = BfastJs;
