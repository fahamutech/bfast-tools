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
    constructor({functions, port}) {
        this._functions = functions;
        this._port = port;
    }

    start() {
        if (typeof this._functions === 'object') {
            _app.use('/names', (request, response) => {
                response.json({names: Object.keys(this._functions)})
            });
            Object.keys(this._functions).forEach(functionName => {
                _app.use(`/functions/${functionName}`, this._functions[functionName]);
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
