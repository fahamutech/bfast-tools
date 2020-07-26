const axios = require('axios');
const BFastJs = require("../bfast.cli");

class ProjectController {

    /**
     *
     * @param projectId {string}
     * @param token {string}
     * @returns {Promise}
     */
    async deleteProject(projectId, token) {
        try {
            const response = await axios.delete(`${await BFastJs.clusterApiUrl()}/projects/${projectId}`, {
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

    /**
     *  create a new bfast cloud project
     * @param project {{
     *     name: string,
     *     description: string,
     *     projectId: string,
     *     parse: {
     *         appId: string,
     *         masterKey: string
     *     }
     * }}
     * @param type {string} project type
     * @param token {token} login user token
     * @returns {Promise}
     */
    async create(project, type, token) {
        try {
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/projects/${type}`, project, {
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

    /**
     * @param token {string}
     * @param type {'ssm' | 'bfast' | null}
     */
    async getMyProjects(token, type) {
        try {
            const response = await axios.get(`${await BFastJs.clusterApiUrl()}/projects`, {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });
            if (!type) {
                return response.data;
            }
            return response.data.filter(value => (value.type && value.type === type));
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

    async addMember(token, projectId, user) {
        try {
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/projects/${projectId}/members`, user, {
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
