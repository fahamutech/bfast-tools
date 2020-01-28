const glob = require('glob');
const axios = require('axios');
const ExpressApp = require('./ExpressAppController');
const DatabaseController = require('./DatabaseController');
const ResourceFactory = require('../factory/ResourceFactory');

const _storage = new DatabaseController();
const _resourceFactory = new ResourceFactory();

class FunctionController {

    constructor() {
        this._getFunctions = (projectDir) => {
            let bfastJSON = require(`${projectDir}/bfast.json`);
            const bfastStringfied = JSON.stringify(bfastJSON);
            bfastJSON = JSON.parse(bfastStringfied);
            const files = glob.sync(`${projectDir}/**/*.js`, {
                absolute: true,
                ignore: bfastJSON.ignore
            });
            let functions = {
                _init: {
                    // onRequest: function (req, response) {
                    //     response.json({message: 'Powa!'});
                    // }
                }
            };
            files.forEach(file => {
                const fileModule = require(file);
                const functionNames = Object.keys(fileModule);
                functionNames.forEach(name => {
                    functions[name] = fileModule[name];
                });
            });
            return functions;
        };
        this._serveFunctions = (functions, port) => {
            new ExpressApp({functions, port}).start();
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
                    reject('can not serve project, error : not in bfast project folder');
                }
            });
        }

        // this._checkProjectIsClean = () => {
        //
        // }
    }

    /**
     * create a bootstrap project for bfast cloud functions
     * @param projectDir {string} a workspace
     */
    initiateFunctionsFolder(projectDir) {
        return _resourceFactory.createProjectFolder(projectDir)
    }

    /**
     * serve cloud functions locally
     * @param projectDir
     * @param port
     */
    serve(projectDir, port) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            if (bfastFile && bfastFile.ignore) {
                const functions = this._getFunctions(projectDir);
                this._serveFunctions(functions, port);
            } else {
                console.log('not in project folder or project file is invalid');
            }
        } catch (e) {
            console.log('can not serve project, error : not in bfast project folder');
        }
    }

    /**
     * Deploy project to bfast cloud
     * @param projectDir
     * @param force
     * @param options {{token: string, projectId: string}}
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
                const project = await _storage.getCurrentProject();
                projectId = project.projectId;
                token = user.token;
            }
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            const response = await axios.post(
                `https://api.bfast.fahamutech.com/functions/${projectId}?force=${force}`,
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

    async addEnv(projectDir, envs, force = false) {
        if (envs && Array.isArray(envs)) {
            try {
                await this._checkIsBFastProjectFolder(projectDir);
                const user = await _storage.getUser();
                const project = await _storage.getCurrentProject();
                const projectId = project.projectId;
                const token = user.token;
                console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
                console.log('start add cloud functions environment(s)');
                const response = await axios.post(
                    `https://api.bfast.fahamutech.com/functions/${projectId}/env?force=${force}`,
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

    async removeEnv(projectDir, envs, force = false) {
        try {
            if (envs && Array.isArray(envs)) {
                await this._checkIsBFastProjectFolder(projectDir);
                const user = await _storage.getUser();
                const project = await _storage.getCurrentProject();
                const projectId = project.projectId;
                const token = user.token;
                console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
                console.log('start removing cloud functions environment(s)');
                const response = await axios.delete(
                    `https://api.bfast.fahamutech.com/functions/${projectId}/env?force=${force}`,
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
}

module.exports = FunctionController;
