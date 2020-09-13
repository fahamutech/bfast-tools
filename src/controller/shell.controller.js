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
            const processingEvent = childProcess.exec(command, {cwd: options.cwd});

            processingEvent.on("error", err => {
                reject(err);
            });

            processingEvent.stdout.on('data', (data) => {
                progress(`${data}`);
            });

            processingEvent.stderr.on('data', (data) => {
                reject(data);
            });

            processingEvent.on("exit", code => {
                resolve(code);
            });

            processingEvent.on("close", code => {
                resolve(code);
            });
            processingEvent.on("disconnect", () => {
                resolve('')
            });

        });
    }
}

module.exports = ShellController;
