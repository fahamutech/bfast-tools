export class FunctionsCliController {

    /**
     * @param functionController {import('./functions.controller.mjs').FunctionsController}
     */
    constructor({functionController}) {
        this._functionController = functionController;
    }

    /**
     * create a working space
     * @param name {string}
     * @return {Promise<string>}
     */
    async createAWorkspace(name) {
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            const folder = `${process.cwd()}/${name}`;
            return this._functionController.initiateFunctionsFolder(folder);
        }

        return 'name format error';
    }
}
