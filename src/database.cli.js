const program = require('commander');
const DatabaseController = require('./controller/database.controller');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
const _database = new DatabaseController();

program
    .command('playground')
    .alias('ui')
    .option('-p, --port [port]','port to open a database playground',3002)
    .description('open a database playground to your browser')
    .action(async (cmd) => {
        try {
            console.log(cmd.port)
            spinner.start();
            const response = await _database.openUi(cmd.port);
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
