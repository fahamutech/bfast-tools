import {program} from "commander";
import {DatabaseController} from "./controller/database.controller.mjs";
import {ProjectController} from "./controller/project.controller.mjs";
import {RestController} from "./controller/rest.controller.mjs";
import {LocalStorageController} from "./controller/local-storage.controller.mjs";
import {Spinner} from "cli-spinner";
import inquirer from "inquirer";

const spinner = new Spinner('processing.. %s');
const databaseController = new DatabaseController(new RestController());
const projectController = new ProjectController(new RestController());
const localStorageController = new LocalStorageController();

(function init() {
    spinner.setSpinnerString('|/-\\');
}());

/**
 *
 * @return {Promise<{projectId: string}>}
 */
async function projectToWorkWith() {
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
    return answer.project;
}

(function registerCommands() {
    program
        .command('playground')
        .option('-p, --projectId', 'project id to open database playground', '')
        .alias('ui')
        .description('open a database playground to your browser')
        .action(async (cmd, p) => {
            try {
                spinner.start();
                const response = await databaseController.openUi(cmd.projectId ? p[0] : '');
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                console.log(e && e.message?e.message: e.toString());
            }
        });

    program
        .command('env-add <env...>')
        .option('-f, --force', "force update of bfast database instance immediately")
        .description('add environment(s) to bfast database instance(s)')
        .action(async (env, cmd) => {
            try {
                spinner.start();
                const project = await projectToWorkWith();
                spinner.start();
                const response = await databaseController.addEnv(project, env, !!cmd.force);
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                console.log(e && e.message?e.message: e.toString());
            }
        });

    program
        .command('env-rm <env...>')
        .option('-f, --force', "force update of bfast database instance immediately")
        .description('remove environment(s) from bfast database instance(s)')
        .action(async (env, cmd) => {
            try {
                spinner.start();
                const project = await projectToWorkWith();
                spinner.start();
                const response = await databaseController.removeEnv(project, env, !!cmd.force);
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                console.log(e && e.message?e.message: e.toString());
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
                const project = await projectToWorkWith();
                let imageName;
                // if (name.toString().trim().includes('/')) {
                //     imageName = name
                // } else {
                imageName = `joshuamshana/bfastfunction:${name ? name.toString().replace('/', '') : 'latest'}`;
                // }
                spinner.start();
                const response = await databaseController.image(project.projectId, imageName, cmd.force !== undefined)
                spinner.stop(true);
                console.log(response);
            } catch (e) {
                spinner.stop(true);
                if (e && e.message) {
                    console.log(e.message);
                } else {
                    console.log(e.toString());
                    // console.log('Fails to update database instance image');
                }
            }
        });

    // program
    //     .command('migrate <db>')
    //     .alias('web3')
    //     .description('migrate data to tree based')
    //     .action(async (name, cmd) => {
    //         try{
    //             await databaseController.toWeb3()
    //         }catch (e){
    //
    //         }
    //     });

}());

program.showHelpAfterError();
program.parse(process.argv);
