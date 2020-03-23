const program = require('commander');
const DatabaseController = require('./controller/DaasController');
const ProjectController = require('./controller/ProjectController');
const Database = require('./controller/LocalStorageController');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const _database = new DatabaseController();
const _projectController = new ProjectController();
const _storage = new Database();

program
    .command('dashboard-off')
    .option('-f, --force', "force update immediately")
    .description('switch bfast::cloud database dashboard off')
    .action(async (cmd) => {
        try {
            spinner.start();
            const user = await _storage.getUser();
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
                message: 'Choose your bfast::cloud project'
            });
            spinner.start();
            const response = await _database.switchDashboard(answer.project.projectId, 0, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('dashboard-on')
    .option('-f, --force', "force update immediately")
    .description('switch bfast::cloud database dashboard on')
    .action(async (cmd) => {
        try {
            spinner.start();
            const user = await _storage.getUser();
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
                message: 'Choose your bfast::cloud project'
            });
            spinner.start();
            const response = await _database.switchDashboard(answer.project.projectId, 1, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program
    .command('realtime <classes...>')
    .option('-f, --force', "force update immediately")
    .description('update tables/collections/classes for realtime database events')
    .action(async (classes, cmd) => {
        try {
            spinner.start();
            const response = await _database.addClassesToLiveQuery(process.cwd(), classes, !!cmd.force);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e);
        }
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' '));
    program.help(help => {
        return help.replace('bfast-database', 'bfast database');
    });
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-database', 'bfast database');
    });
}
