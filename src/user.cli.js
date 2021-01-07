const program = require('commander');
const UserController = require('./controller/user.controller');
const DatabaseController = require('./controller/local-storage.controller');
const {RestController} = require('./controller/rest.controller');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const _database = new DatabaseController();
const _userController = new UserController(new RestController());

program
    .command('register')
    .description('create your bfast account')
    .action(async (cdm) => {
        try {
            let lastPassword;
            const answer = await inquirer.prompt([
                {
                    name: "displayName",
                    type: 'text',
                    validate: (fullname) => {
                        if (fullname && fullname.length >= 3) {
                            return true;
                        } else {
                            return 'your full name required and must be at least 3 alphabet characters'
                        }
                    },
                    message: 'Please enter full name',
                },
                {
                    name: "email",
                    type: 'text',
                    validate: (email) => {
                        if (email && email.toString().search(new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,5}$', 'gi')) !== -1) {
                            return true;
                        } else {
                            return 'email required and must be valid'
                        }
                    },
                    message: 'Please enter your email',
                },
                {
                    name: "phoneNumber",
                    validate: (mobile) => {
                        if (mobile && mobile.toString().length >= 9 && !isNaN(mobile)) {
                            return true;
                        } else {
                            return 'mobile number required and must be valid'
                        }
                    },
                    type: 'text',
                    message: 'Please enter your valid mobile number',
                },
                {
                    name: "password",
                    type: 'password',
                    validate: (password) => {
                        if (password && password.toString().length >= 8) {
                            lastPassword = password;
                            return true;
                        } else {
                            return 'password required an must be at least 8 characters'
                        }
                    },
                    message: 'Please enter your password',
                    mask: '*'
                },
                {
                    name: "rPassword",
                    type: 'password',
                    validate: (password) => {
                        if (password && password.toString().length >= 8 && password === lastPassword) {
                            lastPassword = undefined;
                            return true;
                        } else {
                            return 'password required an must be at least 8 characters and match previous one'
                        }
                    },
                    message: 'Please enter your password again',
                    mask: '*'
                },
            ]);
            spinner.start();
            delete answer.rPassword;
            await _database.saveUser(await _userController.register(answer));
            spinner.stop(true);
            console.log('\nSuccessful Registered\n');
        } catch (e) {
            console.log(e && e.message ? e.message : e.toString());
            spinner.stop();
        }
    });

program
    .command('login')
    .option('-u, --username',
        'Username you used open bfast cloud account, possible the email you use')
    .option('-p, --password', 'Password for your username')
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
                console.log(e && e.message ? e.message : e.toString());
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
                console.log(e && e.message ? e.message : e.toString());
                spinner.stop();
            }
        }
    });

program
    .command('reset')
    .option('-u, --username',
        'Username you used open bfast cloud account, possible the email you use')
    .description('reset password of your remote bfast cloud account')
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
                console.log(e && e.message ? e.message : e.toString());
                spinner.stop();
            }
        } else {
            try {
                const answer = await inquirer.prompt([
                    {
                        name: "username",
                        type: 'text',
                        validate: function (email){
                            if (email && email.toString().search(new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,5}$', 'gi')) !== -1) {
                                return true;
                            } else {
                                return 'email required and must be valid'
                            }
                        },
                        message: 'Please enter your email used to open account',
                    }
                ]);
                spinner.start();
                await _database.saveUser(await _userController.reset(answer.username));
                console.log('\nSuccessful sent instruction to your email');
                spinner.stop();
            } catch (e) {
                console.log('\nPassword reset fails');
                console.log(e && e.message ? e.message : e.toString());
                spinner.stop();
            }
        }
    });

program
    .command('logout')
    .description('logout from local device')
    .action(async cmd => {
        try {
            spinner.start();
            const user = await _database.getUser();
            const response = await _userController.logout(user);
            await _database.deleteCurrentUser();
            spinner.stop(true);
            console.log(response.message ? response.message : response);
            console.log('logout successful');
        } catch (e) {
            await _database.deleteCurrentUser();
            spinner.stop(true);
            console.log('logout successful');
        }
    });

program
    .command('login:ci')
    .option('-u, --username <username>',
        'Username you used open bfast cloud account, possible the email you use')
    .option('-p, --password', 'Password for your username')
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
                console.log(e && e.message ? e.message : e.toString());
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

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-user', 'bfast user');
    });
}

