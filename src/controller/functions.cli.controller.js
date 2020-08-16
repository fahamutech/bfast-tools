const {FunctionsController} = require('./functions.controller');
let _functionController;

class CliFunctionsController {
    /**
     *
     * @param functionController {FunctionsController}
     */
    constructor({functionController}) {
        _functionController = functionController
    }

    /**
     * create a working space
     * @param name {string}
     * @return {Promise<string>}
     */
    async createAWorkspace(name) {
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            const folder = `${process.cwd()}/${name}`;
            return  await _functionController.initiateFunctionsFolder(folder);
        } else {
            return 'name format error';
        }
    }
}

module.exports = {
    CliFunctionsController
}
