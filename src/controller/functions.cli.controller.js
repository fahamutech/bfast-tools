const {FunctionsController} = require('./functions.controller');

class FunctionsCliController {
    /**
     *
     * @param functionController {FunctionsController}
     */
    constructor({functionController}) {
        this._functionController = functionController
    }

    /**
     * create a working space
     * @param name {string}
     * @return {Promise<string>}
     */
    async createAWorkspace(name) {
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            const folder = `${process.cwd()}/${name}`;
            return await this._functionController.initiateFunctionsFolder(folder);
        } else {
            return 'name format error';
        }
    }
}

module.exports = {
    CliFunctionsController: FunctionsCliController
}
