const program = require('commander');

class BfastJs {

    /**
     *
     * @param options {{clusterApiUrl: string}} bfast cluster api url
     */
    constructor(options) {

    }

    // todo : must be configurable
    static clusterApiUrl() {
        return 'https://api.bfast.fahamutech.com';
    };

    cli() {
        // console.log(BfastJs.clusterApiUrl);
        program
            .version(require('../package').version);
        program
            .command('functions', 'manage bfast cloud functions', {executableFile: 'bfast-functions'})
            .alias('fs');
        program
            .command('user', 'manage user account', {executableFile: 'bfast-user'})
            .alias('me');
        program
            .command('database', 'manage bfast::cloud database instance(s)', {executableFile: 'bfast-database'})
            .alias('db');
        program
            .command('cloud', 'manage your bfast::cloud projects', {executableFile: 'bfast-cloud'});
        program.on('command:*', function () {
            const cmd = program.args[0];
            const valid = (cmd === 'fs' ||
                cmd === 'functions' ||
                cmd === 'database' ||
                cmd === 'db' ||
                cmd === 'me' ||
                cmd === 'user' ||
                cmd === 'cloud' ||
                cmd === 'project');
            if (!valid) {
                console.error('Invalid command: %s\n', program.args.join(' '));
                program.help(help => {
                    return help;
                });
            }
        });
        program.parse(process.argv);
    }
}

module.exports = BfastJs;
