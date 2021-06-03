const program = require('commander');
const {ProjectController} = require('./controller/project.controller');
const {RestController} = require('./controller/rest.controller');
const Database = require('./controller/local-storage.controller');
const Utils = require('./controller/utils');
const inquirer = require('inquirer');
const {Spinner} = require('cli-spinner');
const Table = require('cli-table');
const spinner = new Spinner('processing.. %s');
const projectController = new ProjectController(new RestController());
const localStorageController = new Database();

(function init() {
    spinner.setSpinnerString('|/-\\');
})();


program
    .command('create')
    .alias('new')
    .option('-t,--type <type>', 'specify project type e.g bfast', 'bfast')
    .description('Create a new bfast cloud project')
    .action(async (cmd) => {
        try {
            let lastMasterKey = '';
            const user = await localStorageController.getUser();
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
                            const response = value.toString().search(new RegExp('^[0-9A-Za-z-]+$'));
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
                        if (value && value.toString().length >= 3) {
                            return true;
                        } else {
                            return 'Application Id required and must be at least 3 characters'
                        }
                    },
                    name: 'appId',
                    message: 'Enter application Id :'
                },
                {
                    type: 'password',
                    validate: (value) => {
                        if (value && value.toString().length >= 3) {
                            lastMasterKey = value;
                            return true;
                        } else {
                            return 'Application password required and must be at least 3 characters'
                        }
                    },
                    mask: '*',
                    name: 'masterKey',
                    message: 'Enter application password :'
                },
                {
                    type: 'password',
                    validate: (value) => {
                        if (value && value.toString().length >= 3) {
                            if (value !== lastMasterKey) {
                                return 'Application password does not match';
                            } else {
                                return true;
                            }
                        } else {
                            return 'Application password required and must be at least 3 characters'
                        }
                    },
                    mask: '*', name: 'masterKeyConfirm', message: 'Enter application password again :'
                },
            ]);
            lastMasterKey = undefined;
            spinner.start();
            await projectController.create({
                name: answer.name,
                description: answer.description,
                projectId: answer.projectId,
                hostDomain: 'fahamutech.com',
                parse: {
                    appId: answer.appId,
                    masterKey: answer.masterKey
                }
            }, cmd.type, user.token);
            spinner.stop(true);
            answer = undefined;
            console.log('Project created.');
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
            const user = await localStorageController.getUser();
            const projects = await projectController.getMyProjects(user.token, null);
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
            await localStorageController.saveCurrentProject(answer.project, process.cwd());
            console.log('Project linked, happy coding.');
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e.toString());
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
            const user = await localStorageController.getUser();
            const projects = await projectController.getMyProjects(user.token, cdm.type);
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
            const project = answer.project;
            // const heads = Object.keys(answer.project);
            const table = new Table({
                //head: ['ID', 'Name', 'Description', 'ApplicationId', 'ProjectId', 'MasterKey'],
                // colWidths: [100, 200]
            });
            table.push({"ID": project._id});
            table.push({"Name": project.name});
            table.push({"Description": project.description});
            table.push({"ApplicationId": project.parse.appId});
            table.push({"ProjectId": project.projectId});
            table.push({"MasterKey": project.parse.masterKey});
            table.push({"Members": project.members.map(x => x.displayName + '(' + x.email + ')').join(',')});
            console.log(table.toString());
        } catch (e) {
            spinner.stop(true);
            if (e && e.message) {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    });

// program
//     .command('sync')
//     .description('sync  project in database with running services in orchestration')
//     .action(async (cdm) => {
//         try {
//             spinner.start();
//             const user = await localStorageController.getUser();
//             const projects = await projectController.getMyProjects(user.token, cdm.type);
//             let _projects = [];
//             projects.forEach(project => {
//                 const _p = {};
//                 _p.name = `${project.name} ( projectId: ${project.projectId} )`;
//                 _p.value = project;
//                 _projects.push(_p);
//             });
//             spinner.stop(true);
//             const answer = await inquirer.prompt({
//                 type: 'list',
//                 choices: _projects,
//                 name: 'project',
//                 message: 'Choose your bfast cloud project to work with'
//             });
//             const project = answer.project;
//             // const heads = Object.keys(answer.project);
//             const table = new Table({
//                 //head: ['ID', 'Name', 'Description', 'ApplicationId', 'ProjectId', 'MasterKey'],
//                 // colWidths: [100, 200]
//             });
//             table.push({"ID": project._id});
//             table.push({"Name": project.name});
//             table.push({"Description": project.description});
//             table.push({"ApplicationId": project.parse.appId});
//             table.push({"ProjectId": project.projectId});
//             table.push({"MasterKey": project.parse.masterKey});
//             table.push({"Members": project.members.map(x => x.displayName + '(' + x.email + ')').join(',')});
//             console.log(table.toString());
//         } catch (e) {
//             spinner.stop(true);
//             if (e && e.message) {
//                 console.log(e.message);
//             } else {
//                 console.log(e);
//             }
//         }
//     });

program
    .command('delete')
    .alias('rm')
    .description('delete your remote bfast::cloud project')
    .option('-t,--type <type>', 'specify project type either "bfast" or "ssm"')
    .action(async (cdm) => {
        try {
            const user = await localStorageController.getUser();
            spinner.start();
            const projects = await projectController.getMyProjects(user.token, cdm.type ? cdm.type : null);
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
            const response = await projectController.deleteProject(answer.project.projectId, user.token);
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
            const user = await localStorageController.getUser();
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
            const projects = await projectController.getMyProjects(user.token, null);
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
            await projectController.addMember(user.token, answer.project.projectId, userModel);
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
        return help.replace('bfast-project', 'bfast project');
    });
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-project', 'bfast project');
    });
}
