const program = require('commander');
const {FunctionsController} = require('./controller/functions.controller');
const {CliFunctionsController} = require('./controller/functions.cli.controller');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const {RestController} = require("./controller/rest.controller");

const _functionController = new FunctionsController(new RestController());
const _cliFunctionsController = new CliFunctionsController({
    functionController: _functionController
});

program
    .command('create <name>')
    .option('-t, --type <type>', 'project type, only supported angular for now', 'angular')
    .description('create frontend workspace')
    .action(async (name, cdm) => {
        const badIn = name.toString().match(new RegExp('([^A-Za-z])', 'ig'));
        if (badIn && Array.isArray(badIn) && badIn.length > 0) {
            console.log('INFO:  project name must be alphabet only, remove numbers and other symbols');
        } else if (cdm.type && cdm.type === 'angular' && name && name !== '') {
            try {
                name = name.toString().replace(new RegExp('([^A-Za-z])', 'ig'), '').trim();
                spinner.start();
                const response = await _cliFunctionsController.createFrontedWorkspace(name, cdm.type);
                console.log(response);
                spinner.stop(true);
            } catch (e) {
                console.log(e && e.message ? e.message : e.toString());
                spinner.stop(true);
            }
        } else {
            console.log('INFO: now support angular only for project type');
        }
    });

program
    .command('serve')
    .alias('ide')
    .option('-a, --all', 'start at project choose page', false)
    .description('host web ide for development')
    .action(async (cmd) => {
        try {
            spinner.start();
            const response = await _cliFunctionsController.openFrontendIDE(process.cwd(), cmd.all);
            spinner.stop(true);
            console.log(response);
        } catch (e) {
            spinner.stop(true);
            console.log(e && e.message ? e.message : e.toString());
        }
    });


program.on('command:*', function () {
    console.error('Invalid command: %s\n', program.args.join(' ')); // See --help" for a list of available commands.
    program.help(help => {
        return help.replace('bfast-ui', 'bfast ui');
    });
});

program.parse(process.argv);

if (process.argv.length === 2) {
    program.help(help => {
        return help.replace('bfast-ui', 'bfast ui');
    });
}
