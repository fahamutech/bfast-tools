const axios = require('axios');

class ProjectController {
    /**
     * @param token {string}
     */
    async getMyProjects(token) {
        try {
            const response = await axios.get('https://api.bfast.fahamutech.com/projects', {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else if (reason.message) {
                throw reason.message;
            } else if (typeof reason === 'object') {
                throw reason;
            } else {
                throw reason.toString();
            }
        }
    }
}

module.exports = ProjectController;
