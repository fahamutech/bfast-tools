const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
// const {MongoMemoryServer} = require('mongodb-memory-server');
const {ParseServer} = require('parse-server');
const _app = express();
_app.use(cors());
_app.use(logger('dev'));
_app.use(express.json({
    limit: '2024mb'
}));
_app.use(express.urlencoded({extended: false}));
_app.use(cookieParser());
const _faasServer = http.createServer(_app);
const _io = require('socket.io')(_faasServer);

class ExpressAppController {
    /**
     *
     * @param functions {{
     *     path: string,
     *     name?: string,
     *     onEvent?: function(event:{auth: any,payload: any,socket: any}),
     *     onRequest: [Function | [Function, Function, ...] | Router]
     * }}
     * @param port
     */
    constructor({functions, port}) {
        this._functions = functions;
        this._port = port;
        /**
         * start a mongodb in memory server
         * @returns {Promise<string|undefined>}
         * @private
         */
        this._imMemoryMongoDb = async () => {
            // if (process.env.PRODUCTION === '0') {
            //     const replSet = new MongoMemoryServer({
            //         autoStart: true,
            //     });
            //     console.log('successful start in memory mongodb server');
            //     return await replSet.getUri();
            // }
            return '';
        }
        /**
         *start embedded parse server for database manipulation
         * @private
         */
        // on production must be removed to use independent database instance
        this._parseServer = () => {
            const _mongoUrl = process.env.MONGO_URL === 'no' ? undefined : process.env.MONGO_URL;
            if (_mongoUrl) {
                const parseServer = new ParseServer({
                    appId: process.env.APPLICATION_ID,
                    masterKey: process.env.MASTER_KEY,
                    databaseURI: _mongoUrl,
                    serverURL: `http://localhost:${this._port.toString().trim()}/_api`
                });
                _app.use('/_api', parseServer);
                console.log('start embedded daas server');
            }
        }
        /**
         * register http requested functions
         * @private
         */
        this._addHttpFunctions = () => {
            Object.keys(this._functions).forEach(functionName => {
                if (this._functions[functionName] && typeof this._functions[functionName] === "object") {
                    if (this._functions[functionName].onRequest) {
                        if (this._functions[functionName].path) {
                            _app.use(this._functions[functionName].path, this._functions[functionName].onRequest);
                        } else {
                            _app.use(`/functions/${functionName}`, this._functions[functionName].onRequest);
                        }
                    }
                }
            });
        }
        /**
         * register event requested functions
         * @private
         */
        this._addEventsFunctions = () => {
            _io.on('connection', (socket) => {
                Object.keys(this._functions).forEach(functionName => {
                    if (this._functions[functionName] && typeof this._functions[functionName] === "object") {
                        if (this._functions[functionName].onEvent) {
                            if (this._functions[functionName].name) {
                                socket.on(this._functions[functionName].name, (event) => {
                                    this._functions[functionName].onEvent({
                                        auth: event.auth,
                                        payload: event.payload,
                                        socket: socket
                                    });
                                });
                            } else {
                                socket.on(`functions-${functionName}`.name, (event) => {
                                    this._functions[functionName].onEvent({
                                        auth: event.auth,
                                        payload: event.payload,
                                        socket: socket
                                    });
                                });
                            }
                            // socket.on('disconnect', () => {
                            //     console.log('user disconnected');
                            // });
                        }
                    }
                });
            });
        }
        /**
         * start server and start listen for request
         * @private
         */
        this._startServer = () => {
            _faasServer.listen(this._port.toString());
            _faasServer.on('listening', () => {
                console.log('BFast::Cloud Functions Engine Listen On ' + this._port);
            });
        }
    }

    async start() {
        if (typeof this._functions === 'object') {
            try {
                const _mongoAutoUrl = await this._imMemoryMongoDb();
                this._parseServer(_mongoAutoUrl);
                this._addHttpFunctions();
                this._addEventsFunctions();
                this._startServer();
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
