const express = require('express');
const os = require('os');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
const {MongoMemoryServer} = require('mongodb-memory-server-global');
const {ParseServer} = require('parse-server');
const _app = express();
_app.use(cors());
_app.use(logger('dev'));
_app.use(express.json({
    limit: '2024mb'
}));
_app.use(express.urlencoded({extended: false}));
_app.use(cookieParser());

class ExpressAppController {
    /**
     *
     * @param functions {{
     *     path: string,
     *     onRequest: [Function | [Function, Function, ...] | Router]
     * }}
     * @param port
     */
    constructor({functions, port}) {
        this._functions = functions;
        this._port = port;
    }

    async start() {
        if (typeof this._functions === 'object') {
            try {
                const replSet = new MongoMemoryServer({
                    autoStart: true,
                    // replSet: {
                    //     storageEngine: 'wiredTiger',
                    //     dbName: 'bfastTestDb',
                    //     name: 'bfastTestRs',
                    //     count: 1,
                    // },
                    // instanceOpts: [
                    //     {
                    //         port: process.env.DEV_MONGO_PORT,
                    //         dbPath: `${os.homedir()}/bfast-tools/`
                    //     },
                    // ],
                });
                //  console.log('initiate replica set for database');
                //  await replSet.waitUntilRunning();
                const _mongoAutoUrl = await replSet.getUri();
                const _mongoUrl = process.env.MONGO_URL === 'no' ? undefined : process.env.MONGO_URL;
                const parseServer = new ParseServer({
                    appId: process.env.APPLICATION_ID,
                    masterKey: process.env.MASTER_KEY,
                    databaseURI: _mongoUrl ? _mongoUrl : _mongoAutoUrl,
                    serverURL: `http://localhost:${this._port.toString().trim()}/_api`
                });
                _app.use('/_api', parseServer);

                Object.keys(this._functions).forEach(functionName => {
                    if (this._functions[functionName] && typeof this._functions[functionName] === "object"
                        && this._functions[functionName].onRequest) {
                        if (this._functions[functionName].path) {
                            _app.use(this._functions[functionName].path, this._functions[functionName].onRequest);
                        } else {
                            _app.use(`/functions/${functionName}`, this._functions[functionName].onRequest);
                        }
                    }
                });
                const faasServer = http.createServer(_app);
                faasServer.listen(this._port.toString());
                faasServer.on('listening', () => {
                    console.log('BFast::Cloud Functions engine listening on ' + this._port);
                });

            } catch (e) {
                console.log("Fails to start a dev server");
                throw e;
            }
        } else {
            throw {message: 'It\'s not object, hence functions not served'};
        }
    }
}

module.exports = ExpressAppController;
