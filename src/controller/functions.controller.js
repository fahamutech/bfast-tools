const {FaasController} = require('./bfastFunctions.controller');
const {RestController} = require("./rest.controller");
const {ShellController} = require("./shell.controller");
const LocalStorage = require('./local-storage.controller');
const ResourceFactory = require('./workspace.controller');
const BFastJs = require("../bfast.cli");
const fs = require('fs');

const _storage = new LocalStorage();
const _resourceFactory = new ResourceFactory();

class FunctionsController {

    constructor() {
        this.restController = new RestController();
        this.shell = new ShellController()
        /**
         *
         * @param projectDir {string} path of bfast::functions
         * @param port
         * @private
         */
        this._serveFunctions = (projectDir, port) => {
            const bfastJsonPath = `${projectDir}/bfast.json`;
            const functionsDirPath = `${projectDir}/functions`;
            new FaasController({functionsDirPath, bfastJsonPath, port})
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
     * @return {Promise}
     */
    async initiateFunctionsFolder(projectDir) {
        return _resourceFactory.prepareWorkspaceFolder(projectDir);
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
                console.log('not in project folder or bfast.json is invalid');
            }
        } catch (e) {
            console.log(e && e.message ? e.message : e.toString());
        }
    }

    /**
     * Deploy your functions to bfast cloud instance
     * @param projectDir {string} absolute path to your functions workspace
     * @param force {boolean} if true will restart functions instance immediately
     * @param options {{token: string, projectId: string}}
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async deploy(projectDir, force = false, options, progress = console.log) {
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
        await this._prepareTar(projectDir, projectId);
        progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
        return await this.restController.post(
            `${await BFastJs.clusterApiUrl()}/projects/${projectId}/functions?force=${force}`,
            {},
            {
                headers: {
                    'authorization': `Bearer ${token}`,
                }
            }
        );
    }

    /**
     * Add environment(s) variable to bfast cloud function instance
     * @param projectDir {string} absolute path to functions workspace
     * @param envs {string[]} env(s) to add
     * @param force {boolean} should restart cloud functions instance immediately
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async addEnv(projectDir, envs, force = false, progress = console.log) {
        if (envs && Array.isArray(envs)) {
            await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            progress('start add cloud functions environment(s)');
            return await this.restController.post(
                `${await BFastJs.clusterApiUrl()}/projects/${projectId}/functions/env?force=${force}`,
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
     * Remove environment(s) variable from bfast cloud function instance
     * @param projectDir {string} absolute path to your bfast functions workspace locally
     * @param envs {string[]} env(s) to remove
     * @param force {boolean} should restart cloud functions instance immediately
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async removeEnv(projectDir, envs, force = false, progress = console.log) {
        if (envs && Array.isArray(envs)) {
            await this._checkIsBFastProjectFolder(projectDir);
            const user = await _storage.getUser();
            const project = await _storage.getCurrentProject(projectDir);
            const projectId = project.projectId;
            const token = user.token;
            progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            progress('start removing cloud functions environment(s)');
            return await this.restController.delete(
                `${await BFastJs.clusterApiUrl()}/projects/${projectId}/functions/env?force=${force}`,
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

    /**
     * Switch on and off cloud function instance. NOTE: If switch on it will reset your cloud functions instance to 1
     * @param projectDir {string} absolute path to your bfast functions workspace
     * @param mode {number} 1=on, 0=off
     * @param force {boolean}
     * @param progress {function(arg: string)}
     * @return {Promise}
     */
    async switch(projectDir, mode = 1, force = false, progress = console.log) {
        await this._checkIsBFastProjectFolder(projectDir);
        const user = await _storage.getUser();
        const project = await _storage.getCurrentProject(projectDir);
        const projectId = project.projectId;
        const token = user.token;
        progress(`\nCurrent linked bfast project ( projectId: ${projectId})`);
        progress(`start switching ${mode === 1 ? 'on' : 'off'}`);
        return await this.restController.post(
            `${await BFastJs.clusterApiUrl()}/projects/${projectId}/functions/switch/${mode}?force=${force}`,
            {},
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            }
        );
    }

    // /**
    //  *
    //  * @param projectDir
    //  * @param domain
    //  * @param force
    //  * @param progress
    //  * @return {Promise<any>}
    //  */
    // async addDomain(projectDir, domain, force = false, progress = console.log) {
    //     try {
    //         await this._checkIsBFastProjectFolder(projectDir);
    //         const user = await _storage.getUser();
    //         const project = await _storage.getCurrentProject(projectDir);
    //         const projectId = project.projectId;
    //         const token = user.token;
    //         console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
    //         console.log(`start adding custom domain`);
    //         const response = await axios.post(
    //             `${await BFastJs.clusterApiUrl()}/functions/${projectId}/domain?force=${force}`,
    //             {
    //                 domain: domain
    //             },
    //             {
    //                 headers: {
    //                     'content-type': 'application/json',
    //                     'authorization': `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         return response.data;
    //     } catch (reason) {
    //         if (reason && reason.response) {
    //             throw reason.response.data;
    //         } else {
    //             throw reason.toString();
    //         }
    //     }
    // }
    //
    // async clearCustomDomain(projectDir, force = false) {
    //     try {
    //         await this._checkIsBFastProjectFolder(projectDir);
    //         const user = await _storage.getUser();
    //         const project = await _storage.getCurrentProject(projectDir);
    //         const projectId = project.projectId;
    //         const token = user.token;
    //         console.log(`\nCurrent linked bfast project ( projectId: ${projectId} )`);
    //         console.log(`start clear all custom domain(s)`);
    //         const response = await axios.delete(
    //             `${await BFastJs.clusterApiUrl()}/functions/${projectId}/domain?force=${force}`,
    //             {
    //                 headers: {
    //                     'content-type': 'application/json',
    //                     'authorization': `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         return response.data;
    //     } catch (reason) {
    //         if (reason && reason.response) {
    //             throw reason.response.data;
    //         } else {
    //             throw reason.toString();
    //         }
    //     }
    // }

    async _prepareTar(projectDir, projectId) {
        const packageFilePath = `${projectDir}/package.json`;
        const packageFile = require(packageFilePath);
        const bundledDependencies = [];
        Object.keys(packageFile.dependencies ? packageFile.dependencies : {}).forEach(value => {
            bundledDependencies.push(value);
        });
        packageFile.bundledDependencies = bundledDependencies;
        packageFile.name = `${projectId}-${packageFile.name}`;
        fs.writeFileSync(packageFilePath, JSON.stringify(packageFile));
        await this.shell.exec(`npm pack`, {
            cwd: projectDir
        });
    }
}

module.exports = {FunctionsController};
