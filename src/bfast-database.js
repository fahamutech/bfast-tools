const program = require('commander');
const DatabaseController = require('./controller/DaasController');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const _database = new DatabaseController();

program
    .command('dashboard-off')
    .option('-f, --force', "force update immediately")
    .description('switch bfast::cloud database dashboard off')
    .action(async (cmd) => {
        try {
            spinner.start();
            const response = await _database.switchDashboard(process.cwd(), 0, !!cmd.force);
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
            const response = await _database.switchDashboard(process.cwd(), 1, !!cmd.force);
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
