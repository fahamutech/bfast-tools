const program = require('commander');
const ProjectController = require('./controller/ProjectController');
const Database = require('./controller/LocalStorageController');
const Utils = require('./controller/utils');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const _projectController = new ProjectController();
const _storage = new Database();

program
    .command('create')
    .alias('new')
    .description('Create a new bfast cloud project')
    .action(async (cmd) => {
        try {
            let lastMasterKey = '';
            const user = await _storage.getUser();
            let answer = await inquirer.prompt([
                {
                    type: 'text',
                    validate: (value) => {
                        if (value && value.toString().length >= 6) {
                            return true;
                        } else {
                            return 'Project name required and must be at least 6 characters'
                        }
                    }, name: 'name', message: 'Enter project name :'
                },
                {
                    type: 'text',
                    validate: (value) => {
                        if (value && value.toString().length >= 6) {
                            return true;
                        } else {
                            return 'Project description required and must be at least 6 characters'
                        }
                    }, name: 'description', message: 'Enter project description :'
                },
                {
                    type: 'text', validate: (value) => {
                        if (value && value.toString().length >= 6) {
                            const response = value.toString().search(new RegExp('^[0-9A-Za-z]+$'));
                            if (response === -1) {
                                return 'Project Id must be at least 6 characters and must be alphanumeric';
                            }
                            return true;
                        } else {
                            return 'Project Id is required and must be at least 6 characters';
                        }
                    }, name: 'projectId', message: 'Enter project ID :'
                },
                {
                    type: 'text',
                    validate: (value) => {
                        if (value && value.toString().length >= 8) {
                            return true;
                        } else {
                            return 'Application Id required and must be at least 8 characters'
                        }
                    },
                    name: 'appId',
                    message: 'Enter application Id :'
                },
                {
                    type: 'password',
                    validate: (value) => {
                        if (value && value.toString().length >= 8) {
                            lastMasterKey = value;
                            return true;
                        } else {
                            return 'Application password required and must be at least 8 characters'
                        }
                    },
                    mask: '*',
                    name: 'masterKey',
                    message: 'Enter application password :'
                },
                {
                    type: 'password', validate: (value) => {
                        if (value && value.toString().length >= 8) {
                            if (value !== lastMasterKey) {
                                return 'Application password does not match';
                            } else {
                                return true;
                            }
                        } else {
                            return 'Application password required and must be at least 8 characters'
                        }
                    }, mask: '*', name: 'masterKey', message: 'Enter application password again :'
                },
            ]);
            if (answer) {
                lastMasterKey = undefined;
                spinner.start();
                await _projectController.create({
                    name: answer.name,
                    description: answer.description,
                    projectId: answer.projectId,
                    parse: {
                        appId: answer.appId,
                        masterKey: answer.masterKey
                    }
                }, user.token);
                spinner.stop(true);
                console.log("Project created.");
                answer = undefined;
            } else {
                console.log('General failure, i can find your answers');
            }
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

program
    .command('link')
    .alias('ln')
    .description('link your remote bfast cloud project with your local project')
    .action(async (cdm) => {
        try {
            spinner.start();
            await Utils.isBFastProject(process.cwd());
            const user = await _storage.getUser();
            const projects = await _projectController.getMyProjects(user.token, 'bfast');
            let _projects = [];
            projects.forEach(project => {
                const _p = {};
                _p.name = `${project.name} ( projectId: ${project.projectId} )`;
                _p.value = project;
                _projects.push(_p);
            });
            _projects.push({
                name: '**Create New Project**',
                value: '_new_'
            });
            spinner.stop(true);
            const answer = await inquirer.prompt({
                type: 'list',
                choices: _projects,
                name: 'project',
                message: 'Choose your bfast cloud project to work with'
            });
            if (answer.project === '_new_') {
                console.log("Please run 'bfast cloud create'");
                return;
            }
            await _storage.saveCurrentProject(answer.project, process.cwd());
            console.log('Project linked, happy coding.');
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

program
    .command('list')
    .alias('ls')
    .option('-t,--type <type>', 'specify project type either e.g bfast')
    .description('list your remote bfast cloud projects')
    .action(async (cdm) => {
        try {
            spinner.start();
            const user = await _storage.getUser();
            const projects = await _projectController.getMyProjects(user.token, cdm.type);
            let _projects = [];
            projects.forEach(project => {
                const _p = {};
                _p.name = `${project.name} ( projectId: ${project.projectId} )`;
                _p.value = project;
                _projects.push(_p);
            });
            spinner.stop(true);
            const answer = await inquirer.prompt({
                type: 'list',
                choices: _projects,
                name: 'project',
                message: 'Choose your bfast cloud project to work with'
            });
            console.log(answer.project);
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

program
    .command('delete')
    .alias('rm')
    .description('delete your remote bfast::cloud project')
    .option('-t,--type <type>', 'specify project type either "bfast" or "ssm"')
    .action(async (cdm) => {
        try {
            const user = await _storage.getUser();
            spinner.start();
            const projects = await _projectController.getMyProjects(user.token, cdm.type ? cdm.type : null);
            let _projects = [];
            projects.forEach(project => {
                const _p = {};
                _p.name = `${project.name} ( projectId: ${project.projectId} )`;
                _p.value = project;
                _projects.push(_p);
            });
            spinner.stop(true);
            const answer = await inquirer.prompt({
                type: 'list',
                choices: _projects,
                name: 'project',
                message: 'Choose your bfast::cloud project'
            });
            spinner.start();
            const response = await _projectController.deleteProject(answer.project.projectId, user.token);
            spinner.stop(true);
            console.log(response);

        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

program
    .command('add-member')
    .description('add member to your cloud project')
    .action(async (cdm) => {
        try {
            const user = await _storage.getUser();
            let userModel = await inquirer.prompt([
                {
                    type: 'text',
                    validate: (value) => {
                        if (value) {
                            const response = value.toString().search(
                                new RegExp('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$'));
                            if (response === -1) {
                                console.log('\nPlease enter a valid email');
                                return false;
                            }
                            return true;
                        } else {
                            return 'email required'
                        }
                    }, name: 'email', message: 'Enter user email :'
                },
                {
                    type: 'text',
                    validate: (value) => {
                        if (value && value.toString().length >= 4) {
                            return true;
                        } else {
                            return 'User display name required and must be at least 4 characters'
                        }
                    }, name: 'displayName', message: 'Enter user display name :'
                },
            ]);
            spinner.start();
            const projects = await _projectController.getMyProjects(user.token, null);
            let _projects = [];
            projects.forEach(project => {
                const _p = {};
                _p.name = `${project.name} ( projectId: ${project.projectId} )`;
                _p.value = project;
                _projects.push(_p);
            });
            spinner.stop(true);
            const answer = await inquirer.prompt({
                type: 'list',
                choices: _projects,
                name: 'project',
                message: 'Choose your bfast cloud project to work with'
            });
            spinner.start();
            await _projectController.addMember(user.token, answer.project.projectId, userModel);
            spinner.stop(true);
            console.log('member added to a project');
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' '));
    program.help(help => {
        return help.replace('bfast-cloud', 'bfast cloud');
    });
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-cloud', 'bfast cloud');
    });
}
