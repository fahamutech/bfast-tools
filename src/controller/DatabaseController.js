const NeDb = require('nedb');
const storage = new NeDb({filename: `${__dirname}/../../nedb`, autoload: true});
const ResourceController = require('./ResourceController');
const _resource = new ResourceController();

class DatabaseController {

    constructor() {
    }

    saveUser(user) {
        return new Promise(async (resolve, reject) => {
            try {
                await this._deleteCurrentUser();
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

    getUser() {
        return new Promise((resolve, reject) => {
            storage.findOne({_id: 'user'}, function (error, value) {
                if (error) {
                    console.log(error);
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

    _deleteCurrentUser() {
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

}

module.exports = DatabaseController;
