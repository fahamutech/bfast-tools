const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');

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
     *     onRequest: [Function | [Function, Function, ...] | Router]
     * }}
     * @param port
     */
    constructor({functions, port}) {
        this._functions = functions;
        this._port = port;
    }

    start() {
        if (typeof this._functions === 'object') {
            _app.use('/names', (request, response) => {
                let functionsNames = [];
                Object.keys(this._functions).forEach(functionName => {
                    if (this._functions[functionName] && typeof this._functions[functionName] === "object"
                        && this._functions[functionName].onRequest) {
                        functionsNames.push(functionName)
                    }
                });
                response.json({names: functionsNames});
            });
            Object.keys(this._functions).forEach(functionName => {
                if (this._functions[functionName] && typeof this._functions[functionName] === "object"
                    && this._functions[functionName].onRequest) {
                    _app.use(`/functions/${functionName}`, this._functions[functionName].onRequest);
                }
            });
            const faasServer = http.createServer(_app);
            faasServer.listen(this._port.toString());
            faasServer.on('listening', () => {
                console.log('FaaS Engine Listening on ' + this._port);
            });
        } else {
            throw {message: 'It\'s not object, hence functions no served'};
        }
    }
}

module.exports = ExpressAppController;
