const axios = require('axios');

class UserController {
    async login(email, password) {
        try {
            const response = await axios.post('https://api.bfast.fahamutech.com/users/login', {
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
            const response = await axios.post('https://api.bfast.fahamutech.com/users/logout', {
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
