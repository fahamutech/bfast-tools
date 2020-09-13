const LocalStorage = require('./local-storage.controller');
const BFastJs = require("../bfast.cli");
const _storage = new LocalStorage();
const {open} = require('out-url');

class DatabaseController {

    /**
     *
     * @param restController {RestController} - http client controller
     */
    constructor(restController) {
        this.restController = restController;
    }

    async openUi(_) {
        const url = 'https://bfast-playground.web.app/';
        await open(url);
        return 'BFast::Database playground listening at ' + url + ' in your browser';
    }

    /**
     *
     * @param projectId {string}
     * @param {string} name - docker image to be used
     * @param force {boolean} - force restart immediately
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async image(projectId, name, force = false, progress = console.log) {
        const user = await _storage.getUser();
        progress(`\nCurrent bfast project ( projectId: ${projectId})`);
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/database/${projectId}/image?force=${force}`,
            {
                image: name
            },
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${user.token}`
                },
            }
        );
    }

    /**
     * Add environment(s) variable to bfast database instance
     * @param project {{projectId: string}} absolute path to functions workspace
     * @param envs {string[]} env(s) to add
     * @param force {boolean} should restart cloud functions instance immediately
     * @param progress {function(arg: string)} - a function which process will report a progress
     * @return {Promise}
     */
    async addEnv(project, envs, force = false, progress = console.log) {
        if (envs && Array.isArray(envs)) {
            // await Utils.isBFastProject(projectDir);
            const user = await _storage.getUser();
            // const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            progress('start add bfast database environment(s)');
            return await this.restController.post(
                `${await BFastJs.clusterApiUrl()}/database/${projectId}/env?force=${force}`,
                {
                    envs: envs
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                }
            );
        } else {
            throw 'Please specify env(s) to add';
        }
    }

    /**
     * Remove environment(s) variable from bfast database instance
     * @param project {{projectId:string}} absolute path to your bfast functions workspace locally
     * @param envs {string[]} env(s) to remove
     * @param force {boolean} should restart cloud functions instance immediately
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async removeEnv(project, envs, force = false, progress = console.log) {
        if (envs && Array.isArray(envs)) {
            // await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            // const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            progress('start removing bfast database environment(s)');
            return await this.restController.delete(
                `${await BFastJs.clusterApiUrl()}/database/${projectId}/env?force=${force}`,
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    },
                    data: {
                        envs: envs
                    }
                }
            );
        } else {
            throw 'Please specify env(s) to remove';
        }
    }

}

module.exports = {DatabaseController};
