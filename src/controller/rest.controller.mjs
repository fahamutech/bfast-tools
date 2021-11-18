import axios from "axios";

export class RestController {

    /**
     *
     * @param httpClientFactory {{
     *     post: function(url, data, config),
     *     put: function(url, data, config),
     *     delete: function(url, config),
     *     get: function(url, config)
     * }}
     */
    constructor(httpClientFactory = undefined) {
        this._http = undefined;
        if (httpClientFactory) {
            this._http = httpClientFactory
        } else {
            this._http = axios;
        }
    }

    /**
     * make a post http request
     * @param url {string} - url to make a request
     * @param data {object} - a json of the body to post
     * @param config {{headers: object, params: object}} - a json contain http config
     * @return {Promise}
     */
    async post(url, data, config) {
        try {
            const response = await this._http.post(url, data, config);
            return response.data;
        } catch (e) {
            throw this._handleError(e);
        }
    }

    /**
     * make a get http request
     * @param url {string} - url to make a request
     * @param config {{headers: object, params: object}} - a json contain http config
     * @return {Promise}
     */
    async get(url, config) {
        try {
            const response = await this._http.get(url, config);
            return response.data;
        } catch (e) {
            throw this._handleError(e);
        }
    }

    /**
     * make a delete http request
     * @param url {string} - url to make a request
     * @param config {{headers: object, params: object}} - a json contain http config
     * @return {Promise}
     */
    async delete(url, config) {
        try {
            const response = await this._http.delete(url, config);
            return response.data;
        } catch (e) {
            throw this._handleError(e);
        }
    }

    _handleError(reason) {
        if (reason && reason.response && reason.response.data) {
            return reason.response.data.message
                ? reason.response.data
                : {message: reason.response.data}
        } else if (reason.message) {
            return {message: reason.message};
        } else if (typeof reason === 'object') {
            return {message: JSON.stringify(reason)};
        } else {
            return {message: reason.toString()};
        }
    }

    /**
     * make a put http request
     * @param url {string} - url to make a request
     * @param data {object} - a json of the body to post
     * @param config {{headers: object, params: object}} - a json contain http config
     * @return {Promise}
     */
    async put(url, data, config) {
        try {
            const response = await this._http.post(url, data, config);
            return response.data;
        } catch (e) {
            throw this._handleError(e);
        }
    }
}
