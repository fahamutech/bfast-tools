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
     *     path: string,
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
            /* handle return of all functions registered */
            // _app.use('/names', (request, response) => {
            //
            //
            //     _app._router.stack.forEach(layer => {
            //         console.log(layer);
            //         console.log(layer.name);
            //         console.log(layer.path);
            //     });
            //
            //     let functionsNames = [];
            //     Object.keys(this._functions).forEach(functionName => {
            //         if (this._functions[functionName] && typeof this._functions[functionName] === "object"
            //             && this._functions[functionName].onRequest) {
            //             functionsNames.push(functionName)
            //         }
            //     });
            //     response.json({names: functionsNames});
            // });

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
        } else {
            throw {message: 'It\'s not object, hence functions no served'};
        }
    }
}

module.exports = ExpressAppController;
