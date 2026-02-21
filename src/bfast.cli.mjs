import {program} from "commander";
import {createRequire} from "module";

const require = createRequire(import.meta.url);

export class BFastJs {
    start() {
        program.version(require('../package').version);

        program
            .command('functions', 'manage local bfast functions workspace', {executableFile: 'functions.cli'})
            .alias('fs');

        program.on('command:*', function () {
            const cmd = program.args[0];
            const valid = (cmd === 'fs' || cmd === 'functions');
            if (!valid) {
                console.error('Invalid command: %s\n', program.args.join(' '));
                program.help(help => help);
            }
        });

        program.parse(process.argv);

        if (process.argv.length === 2) {
            program.help(help => help);
        }
    }
}
