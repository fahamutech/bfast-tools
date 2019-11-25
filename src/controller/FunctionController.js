const glob = require('glob');
const https = require('https');
const ExpressApp = require('./ExpressAppController');

class FunctionController {

    /**
     *
     * @param resourceFactory {ResourceFactory}
     * @param authController {AuthController}
     */
    constructor({resourceFactory, authController}) {
        this._resourceFactory = resourceFactory;
        this._authController = authController;
        this._getFunctions = (projectDir) => {
            let bfastJSON = require(`${projectDir}/bfast.json`);
            const bfastStringfied = JSON.stringify(bfastJSON);
            bfastJSON = JSON.parse(bfastStringfied);
            const files = glob.sync(`${projectDir}/**/*.js`, {
                absolute: true,
                ignore: bfastJSON.ignore
            });
            let functions = {
                mambo: {
                    onRequest: function (req, response) {
                        response.json({message: 'Powa!'});
                    }
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
        this._getProjectCredential = (projectDir) => {
            return new Promise((resolve, reject) => {
                try {
                    const projectCredential = require(`${projectDir}/bfast.json`);
                    // console.log(`current project is : ${projectCredential.projectId}`);
                    if (projectCredential && projectCredential.projectId && projectCredential.projectId !== '' &&
                        projectCredential.projectId !== undefined && projectCredential.projectId !== null) {
                        resolve(projectCredential);
                    } else {
                        reject('projectId can not be determined, ' +
                            'check if your current directory is bfast project and bfast.json file exist');
                    }
                } catch (e) {
                    // console.log(e);
                    reject('can not serve project, error : not in bfast project folder');
                }
            });
        }
    }

    /**
     * create a bootstrap project for bfast cloud functions
     * @param projectDir {string} a workspace
     */
    initiateFunctionsFolder(projectDir) {
        if (!this._authController.isAuthenticated()) throw Error('login first');
        this._resourceFactory.createProjectFolder(projectDir)
    }

    /**
     * serve cloud functions locally
     * @param projectDir
     * @param port
     */
    // need to auto reload when file changes
    serve(projectDir, port) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            if (bfastFile && bfastFile.projectId !== undefined || bfastFile.projectId !== null) {
                const functions = this._getFunctions(projectDir);
                this._serveFunctions(functions, port);
            } else {
                console.log('not in project folder or project file is invalid');
            }
        } catch (e) {
            //  console.log(e);
            console.log('can not serve project, error : not in bfast project folder');
        }
    }

    /**
     * Deploy project to bfast cloud
     * @param projectDir
     * @param force
     */
    // need to check if user is log in bfast project
    deploy(projectDir, force = false) {
        this._getProjectCredential(projectDir).then(bfastProject => {
            https.request(
                `https://cloud.bfast.fahamutech.com/deploy/functions/${bfastProject.projectId}?force=${force}`,
                res => {
                    res.setEncoding('utf8');
                    // res.on('data', chunk => {
                    //     console.log(chunk);
                    // });
                    res.on('error', err => {
                        console.error(err);
                    });
                    res.on('end', (_) => {
                        console.log('functions deployed');
                    });
                }).end();
        }).catch(reason => {
            console.log(reason);
        });
    }

    addEnv(projectDir, envs, force = false) {
        if (envs && Array.isArray(envs)) {
            this._getProjectCredential(projectDir).then(bfastProject => {
                console.log('start update faas environments');
                const httpsReq = https.request(
                    `https://cloud.bfast.fahamutech.com/functions/${bfastProject.projectId}/env?force=${force}`,
                    {
                        method: 'POST'
                    }, res => {
                        res.setEncoding('utf8');
                        // res.on('data', chunk => {
                        //     console.log(chunk);
                        // });
                        res.on('error', err => {
                            console.error(err);
                        });
                        res.on('end', (_) => {
                            console.log('env(s) added');
                        });
                    });
                httpsReq.write(JSON.stringify({envs: envs}));
                httpsReq.end();
            }).catch(reason => {
                console.log(reason);
            });
        } else {
            console.log('No env(s) to update');
        }
    }

    removeEnv(projectDir, envs, force = false) {
        if (envs && Array.isArray(envs)) {
            this._getProjectCredential(projectDir).then(bfastProject => {
                console.log('start remove faas environments');
                const httpsReq = https.request(
                    `https://cloud.bfast.fahamutech.com/functions/${bfastProject.projectId}/env?force=${force}`,
                    {
                        method: 'DELETE'
                    }, res => {
                        res.setEncoding('utf8');
                        // res.on('data', chunk => {
                        //     console.log(chunk);
                        // });
                        res.on('error', err => {
                            console.error(err);
                        });
                        res.on('end', (_) => {
                            console.log('env(s) removed');
                        });
                    });
                httpsReq.write(JSON.stringify({envs: envs}));
                httpsReq.end();
            }).catch(reason => {
                console.log(reason);
            });
        } else {
            console.log('No env(s) to update');
        }
    }
}

module.exports = FunctionController;
