const childProcess = require('child_process');

class ShellController {
    /**
     *
     * @param command
     * @param options {{cwd: string}}
     * @param progress {function(arg: string)}
     * @return {Promise<unknown>}
     */
    async exec(command, options = {}, progress = console.log) {
        return new Promise((resolve, reject) => {
            childProcess.exec(command, {cwd: options.cwd}, (error, stdout, stderr) => {
                if (error) {
                    reject(stderr.toString());
                } else {
                    resolve(stdout.toString());
                }
            });
        });
    }
}

module.exports = {
    ShellController: ShellController
};
