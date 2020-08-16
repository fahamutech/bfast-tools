const childProcess = require('child_process');

class ShellController {
    async exec(command, {cwd}) {
        return new Promise((resolve, reject) => {
            const processingEvent = childProcess.exec(command, {cwd});

            processingEvent.on("error", err => {
                reject(err);
            });

            processingEvent.stdout.on('data', (data) => {
                console.log(data);
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
