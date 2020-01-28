const program = require('commander');
const ProjectController = require('./controller/ProjectController');
const Database = require('./controller/DatabaseController');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const _projectController = new ProjectController();
const _storage = new Database();

program
    .command('link')
    .description('link your remote bfast cloud project with your local project')
    .action(async (cdm) => {
        try {
            spinner.start();
            const user = await _storage.getUser();
            const projects = await _projectController.getMyProjects(user.token);
            let _projects = [];
            projects.forEach(project => {
                const _p = {};
                _p.name = `${project.name} ( projectId: ${project.projectId})`;
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
                console.log("Please go to http://bfast.fahamutech.com to create new project");
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

// program
//     .command('unlink')
//     .description('remove your your remote bfast cloud project form local machine')
//     .action(async (cdm) => {
//         try {
//             spinner.start();
//             await _storage.getUser();
//             await _storage._deleteCurrentProject();
//             spinner.stop(true);
//             console.log('bfast cloud project link destroyed.');
//         } catch (e) {
//             spinner.stop(true);
//             if (e && e.message) {
//                 console.log(e.message);
//             } else {
//                 console.log(e);
//             }
//         }
//     });


// error on unknown commands
program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' ')); // See --help" for a list of available commands.
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

