const program = require('commander');
const {DatabaseController} = require('./controller/database.controller');
const {Spinner} = require('cli-spinner');
const spinner = new Spinner('processing.. %s');
const databaseController = new DatabaseController();

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

    // program
    //     .command('engine <name>')
    //     .alias('image')
    //     .alias('runtime')
    //     .description('Update runtime image to database instance')
    //     .action(async (name,cmd) => {
    //         databaseController.
    //     })
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
