const program = require('commander');
const {DatabaseController} = require('./controller/database.controller');
const {ProjectController} = require('./controller/project.controller');
const Database = require('./controller/local-storage.controller');
const {Spinner} = require('cli-spinner');
const spinner = new Spinner('processing.. %s');
const inquirer = require('inquirer');
const databaseController = new DatabaseController();
const projectController = new ProjectController();
const localStorageController = new Database();

(function init() {
    spinner.setSpinnerString('|/-\\');
}());

(function registerCommands() {
    program
        .command('playground')
        .alias('ui')
        .description('open a database playground to your browser')
        .action(async (cmd) => {
            try {
                spinner.start();
                const response = await databaseController.openUi(cmd.port);
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                console.log(e);
            }
        });

    program
        .command('image <name>')
        .option('-f, --force', "force update of cloud database instance immediately")
        .alias('engine')
        .alias('runtime')
        .description('Update runtime image to database instance')
        .action(async (name, cmd) => {
            try {
                spinner.start();
                const user = await localStorageController.getUser();
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
                const project = answer.project;
                let imageName = name;
                if (name.toString().trim().includes('/')) {
                    imageName = name
                } else {
                    imageName = `joshuamshana/bfast-ce-daas:${name}`;
                }
                spinner.start();
                const response = await databaseController.image(project.projectId, imageName, cmd.force !== undefined)
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                if (e && e.message) {
                    console.log(e.message);
                } else {
                    console.log(e);
                    console.log('Fails to update database instance image');
                }
            }
        })
}());

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
