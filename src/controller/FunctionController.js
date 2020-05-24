const axios = require('axios');
const ExpressApp = require('./FaaSController');
const LocalStorage = require('./LocalStorageController');
const ResourceFactory = require('./ResourceController');
const BFastJs = require("../bfast-tools");

const _storage = new LocalStorage();
const _resourceFactory = new ResourceFactory();

class FunctionController {

    constructor() {

        /**
         *
         * @param projectDir {string} path of bfast::functions
         * @param port
         * @private
         */
        this._serveFunctions = (projectDir, port) => {
            const bfastJsonPath = `${projectDir}/bfast.json`;
            const functionsDirPath = `${projectDir}/functions`;
            new ExpressApp({functionsDirPath, bfastJsonPath, port})
                .start()
                .catch(console.log);
        };

        /**
         * Get bfast credentials of a current project
         * @param projectDir {String} path of a bfast functions working directory where <code>bfast</code> command run
         * @returns {Promise<{projectId}>}. Promise rejected when <code>bfast.json</code> is no found.
         * @private
         */
        this._checkIsBFastProjectFolder = (projectDir) => {
            return new Promise((resolve, reject) => {
                try {
                    const projectCredential = require(`${projectDir}/bfast.json`);
                    if (projectCredential && projectCredential.ignore) {
                        resolve(projectCredential);
                    } else {
                        reject('projectId can not be determined, ' +
                            'check if your current directory is bfast project and bfast.json file exist');
                    }
                } catch (e) {
                    reject('Not in bfast project folder');
                }
            });
        }

        // this._checkProjectIsClean = () => {
        //
        // }
    }

    /**
     * create a bootstrap project for bfast cloud functions
     * @param projectDir {string} absolute path to create a workspace
     */
    initiateFunctionsFolder(projectDir) {
        return _resourceFactory.createProjectFolder(projectDir)
    }

    /**
     * start development server locally to host your cloud functions
     * @param projectDir {string} absolute path to your functions
     * @param port
     * @return {void}
     */
    serve(projectDir, port) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            if (bfastFile && bfastFile.ignore) {
                this._serveFunctions(projectDir, port);
            } else {
                console.log('not in project folder or project file is invalid');
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Deploy your functions to bfast cloud instance
     * @param projectDir {string} absolute path to your functions workspace
     * @param force {boolean} if true will restart functions instance immediately
     * @param options {{token: string, projectId: string}}
     * @return {Promise}
     */
    async deploy(projectDir, force = false, options) {
        try {
            await this._checkIsBFastProjectFolder(projectDir);
            let projectId;
            let token;
            if (options && options.token && options.projectId) {
                token = options.token;
                projectId = options.projectId;
            } else {
                const user = await _storage.getUser();
                const project = await _storage.getCurrentProject(projectDir);
                projectId = project.projectId;
                token = user.token;
            }
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            const response = await axios.post(
                `${await BFastJs.clusterApiUrl()}/functions/${projectId}?force=${force}`,
                {},
                {
                    headers: {
                        'authorization': `Bearer ${token}`,
                    }
                }
            );
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
     * Add environment(s) variable to bfast cloud function instance
     * @param projectDir {string} absolute path to functions workspace
     * @param envs {string[]} env(s) to add
     * @param force {boolean} should restart cloud functions instance immediately
     * @return {Promise}
     */
    async addEnv(projectDir, envs, force = false) {
        if (envs && Array.isArray(envs)) {
            try {
                await this._checkIsBFastProjectFolder(projectDir);
                const user = await _storage.getUser();
                const project = await _storage.getCurrentProject(projectDir);
                const projectId = project.projectId;
                const token = user.token;
                console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
                console.log('start add cloud functions environment(s)');
                const response = await axios.post(
                    `${await BFastJs.clusterApiUrl()}/functions/${projectId}/env?force=${force}`,
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
                return response.data;
            } catch (reason) {
                if (reason && reason.response) {
                    throw reason.response.data;
                } else {
                    throw reason.toString();
                }
            }
        } else {
            throw 'Please specify env(s) to add';
        }
    }

    /**
     * Remove environment(s) variable from bfast cloud function instance
     * @param projectDir {string} absolute path to your bfast functions workspace locally
     * @param envs {string[]} env(s) to remove
     * @param force {boolean} should restart cloud functions instance immediately
     * @return {Promise}
     */
    async removeEnv(projectDir, envs, force = false) {
        try {
            if (envs && Array.isArray(envs)) {
                await this._checkIsBFastProjectFolder(projectDir);
                const user = await _storage.getUser();
                const project = await _storage.getCurrentProject(projectDir);
                const projectId = project.projectId;
                const token = user.token;
                console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
                console.log('start removing cloud functions environment(s)');
                const response = await axios.delete(
                    `${await BFastJs.clusterApiUrl()}/functions/${projectId}/env?force=${force}`,
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
                return response.data;
            } else {
                throw 'Please specify env(s) to remove';
            }
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason.toString();
            }
        }
    }

    /**
     * Switch on and off cloud function instance. NOTE: If switch on it will reset your cloud functions instance to 1
     * @param projectDir {string} absolute path to your bfast functions workspace
     * @param mode {number} 1=on, 0=off
     * @param force {boolean}
     * @return {Promise}
     */
    async switch(projectDir, mode = 1, force = false) {
        try {
            await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            console.log(`start switching ${mode === 1 ? 'on' : 'off'}`);
            const response = await axios.post(
                `${await BFastJs.clusterApiUrl()}/functions/${projectId}/switch/${mode}?force=${force}`,
                {},
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason.toString();
            }
        }
    }

    async addDomain(projectDir, domain, force = false) {
        try {
            await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            console.log(`start adding custom domain`);
            const response = await axios.post(
                `${await BFastJs.clusterApiUrl()}/functions/${projectId}/domain?force=${force}`,
                {
                    domain: domain
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason.toString();
            }
        }
    }

    async clearCustomDomain(projectDir, force = false) {
        try {
            await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId} )`);
            console.log(`start clear all custom domain(s)`);
            const response = await axios.delete(
                `${await BFastJs.clusterApiUrl()}/functions/${projectId}/domain?force=${force}`,
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason.toString();
            }
        }
    }
}

module.exports = FunctionController;
