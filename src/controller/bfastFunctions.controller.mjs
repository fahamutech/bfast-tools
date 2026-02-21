import {start} from "bfast-function";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


export class FaasController {
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
            return start({
                port: this._port,
                functionsConfig: {
                    bfastJsonPath: this._bfastJsonPath,
                    functionsDirPath: this._functionsDirPath
                }
            });
        }
    }

    async start() {
        return this._startServer();
    }
}
