const axios = require('axios');
const BFastJs = require("../bfast.cli");

class UserController {

    async login(email, password) {
        try {
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/users/login`, {
                email: email,
                password: password
            }, {
                headers: {
                    'content-type': 'application/json'
                }
            });
            return response.data;
        } catch (e) {
            if (e.response) {
                throw e.response.data
            } else {
                throw e.toString();
            }
        }
    }

    async logout(token) {
        try {
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/users/logout`, {
                token: token
            }, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (e) {
            if (e.response) {
                throw e.response.data
            } else {
                throw e.toString();
            }
        }
    }
}

module.exports = UserController;
