/**
 * manage initiation or project structure
 */

class ResourceFactory {
    constructor() {
        this._fse = require('fs-extra');
        this._fs = require('fs');
        this._path = require('path');
        this._checkIfFileExist = (projectDir) => {
            return this._fs.existsSync(projectDir);
        }
    }

    createProjectFolder(projectDir) {
        if (this._checkIfFileExist(projectDir)) throw Error('project folder already exist at: ' + projectDir);
        this._fse.copySync(this._path.join(__dirname, `/../res`), projectDir);
        console.log('done create project folder');
    }

}

module.exports = ResourceFactory;
