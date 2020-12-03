const {BfastFunctions} = require('bfast-function');

class BfastFunctionsController {
    /**
     * @param functionsDirPath {string}
     * @param bfastJsonPath {string}
     * @param port
     */
    constructor({functionsDirPath, bfastJsonPath, port}) {
        this._functionsDirPath = functionsDirPath;
        this._bfastJsonPath = bfastJsonPath;
        this._port = port;
        /**
         * start server and start listen for request
         * @private
         * @return {Promise}
         */
        this._startServer = async () => {
            let _faasServer = new BfastFunctions({
                projectId: process.env.PROJECT_ID,
                port: this._port,
                appId: process.env.APPLICATION_ID,
                functionsConfig: {
                    bfastJsonPath: this._bfastJsonPath,
                    functionsDirPath: this._functionsDirPath
                }
            });
            return _faasServer.start();
        }
    }

    async start() {
        return this._startServer();
    }
}

module.exports = {FaasController: BfastFunctionsController};
