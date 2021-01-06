const BFastJs = require("../bfast.cli");

class ProjectController {

    /**
     *
     * @param restController {RestController}
     */
    constructor(restController) {
        this.restController = restController
    }

    /**
     *
     * @param projectId {string}
     * @param token {string}
     * @returns {Promise}
     */
    async deleteProject(projectId, token) {
        return await this.restController.delete(`${await BFastJs.clusterApiUrl()}/projects/${projectId}`, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
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
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/projects/${type}`, project, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * @param token {string}
     * @param type {'ssm' | 'bfast' | null}
     * @return {Promise<Array<*>>}
     */
    async getMyProjects(token, type) {
        const response = await this.restController.get(`${await BFastJs.clusterApiUrl()}/projects`, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
        if (!type) {
            return response;
        }
        return response.filter(value => (value.type && value.type === type));
    }

    /**
     *
     * @param token {string}
     * @param projectId {string}
     * @param user {object}
     * @return {Promise<*>}
     */
    async addMember(token, projectId, user) {
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/projects/${projectId}/members`, user, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
    }
}

module.exports = {ProjectController};
