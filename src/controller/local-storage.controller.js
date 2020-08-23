const NeDb = require('nedb');
const os = require('os');
const path = require('path');
const _package = require('../../package.json')
const storage = new NeDb({
    filename: path.join(os.homedir(), `/bfast-tools/${_package.version}/.bfast-tools.db`),
    autoload: true
});
const ResourceController = require('./workspace.controller');
const _resource = new ResourceController();

class LocalStorageController {

    constructor() {
    }

    /**
     *
     * @param user
     * @return {Promise<unknown>}
     */
    saveUser(user) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.deleteCurrentUser();
                user['_id'] = 'user';
                if (user) {
                    storage.insert(user, function (error, newDoc) {
                        if (error) {
                            reject({message: 'Err when try to save user'});
                        } else {
                            resolve({message: 'User saved', doc: newDoc});
                        }
                    });
                } else {
                    reject({message: 'user must be provided'});
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     *
     * @return {Promise<unknown>}
     */
    getUser() {
        return new Promise((resolve, reject) => {
            storage.findOne({_id: 'user'}, function (error, value) {
                if (error) {
                    reject({message: 'Fail to get current user', reason: error.toString()});
                } else if (value) {
                    resolve(value);
                } else {
                    reject({
                        message: 'No user records found, please login first by ' +
                            'run "bfast user login" if you do not have an account ' +
                            'open one at http://bfast.fahamutech.com'
                    });
                }
            });
        });
    }

    /**
     *
     * @returns {Promise<{projectId: string}>}
     */
    getCurrentProject(projectDir) {
        return new Promise(async (resolve, reject) => {
            try {
                let bfastJson = await _resource.getProjectIdFromBfastFJSON(projectDir);
                bfastJson = JSON.parse(JSON.stringify(bfastJson));
                if (bfastJson && bfastJson.projectId && bfastJson.projectId !== '') {
                    delete bfastJson.ignore;
                    resolve(bfastJson);
                } else {
                    throw 'Please choose your remote bfast project to work with, run "bfast project link"'
                }
            } catch (e) {
                reject({message: e.toString()});
            }
        });
    }

    /**
     *
     * @param project
     * @param projectDir
     * @return {Promise<unknown>}
     */
    saveCurrentProject(project, projectDir) {
        return new Promise(async (resolve, reject) => {
            try {
                await _resource.saveProjectIdInBFastJSON({
                    projectId: project.projectId,
                    projectDir: projectDir
                });
                resolve({message: 'Project linked'});
            } catch (e) {
                reject({message: 'Fails to link your remote bfast cloud project', reason: e.toString()});
            }
        })
    }

    /**
     *
     * @return {Promise<unknown>}
     */
    deleteCurrentUser() {
        return new Promise((resolve, reject) => {
            storage.remove({_id: 'user'}, {multi: true}, function (err, numRemoved) {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                }
            });
        });
    };

    deleteCurrentSettings() {
        return new Promise((resolve, reject) => {
            storage.remove({_id: '_settings'}, {multi: true}, function (err, numRemoved) {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                }
            });
        });
    };

    /**
     * save tool settings
     * @param settings {{
     *     cloudUrl: string
     * }}
     * @return {Promise<{cloudUrl: string}>}
     */
    saveSettings(settings) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.deleteCurrentSettings();
                settings['_id'] = '_settings';
                storage.insert(settings, function (error, newDoc) {
                    if (error) {
                        console.log(error);
                        reject({message: 'Err when try to save settings'});
                    } else {
                        resolve({message: 'Settings saved', doc: newDoc});
                    }
                });
            } catch (e) {
                throw e;
            }
        });
    }

    /**
     * get current settings of a tool
     * @return {Promise<{cloudUrl: string}>}
     */
    getSettings() {
        return new Promise((resolve, reject) => {
            storage.findOne({_id: '_settings'}, function (error, value) {
                if (error) {
                    reject({message: 'Fail to get current user', reason: error.toString()});
                } else if (value) {
                    resolve(value);
                } else {
                    reject({
                        message: 'No settings records found'
                    });
                }
            });
        });
    }

}

module.exports = LocalStorageController;
