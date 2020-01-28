const NeDb = require('nedb');
const storage = new NeDb({filename: `${__dirname}/../../nedb`, autoload: true});

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
    getCurrentProject() {
        return new Promise((resolve, reject) => {
            try {
                storage.findOne({_id: 'project'}, function (error, value) {
                    if (error) {
                        reject({message: 'Fail to get current project'});
                    } else if (value) {
                        resolve(value);
                    } else {
                        reject('Please choose your ' +
                            'remote bfast project to work with, run "bfast project link"');
                    }
                });
            } catch (e) {
                reject({message: 'Fails to get current project', reason: e.toString()});
            }
        });
    }

    saveCurrentProject(project) {
        try {
            delete project.user;
            delete project.members;
            delete project.parse.masterKey;
        } catch (e) {
        }
        project._id = 'project';
        return new Promise(async (resolve, reject) => {
            try {
                await this._deleteCurrentProject();
                storage.insert(project, function (error) {
                    if (error) {
                        reject({
                            message: 'Fails to save your remote bfast cloud project locally',
                            reason: error.toString()
                        });
                    } else {
                        resolve({message: 'Project saved'});
                    }
                })
            } catch (e) {
                reject({message: 'Fails to link your remote bfast cloud project', reason: e.toString()});
            }
        })
    }

    _deleteCurrentProject() {
        return new Promise((resolve, reject) => {
            storage.remove({_id: 'project'}, {multi: true}, function (err, numRemoved) {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                }
            });
        });
    };

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
