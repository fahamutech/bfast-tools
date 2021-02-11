const {BfastUiAngular} = require("bfast-ui-ng");
const {Utils} = require("../utils/utils");
const {FunctionsController} = require('./functions.controller');
const {join, basename} = require('path');
const {promisify} = require('util');
const {readdir} = require('fs');
const {open} = require('out-url');

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

    async createFrontedWorkspace(name, type = 'angular') {
        type = 'angular';
        if (name && name !== '' && name !== '.' && !name.startsWith('.')) {
            const folder = `${process.cwd()}/${name}`;
            return await this._functionController.initiateFrontendFolder(folder, name, type);
        } else {
            return 'name format error';
        }
    }

    async openFrontendIDE(projectDir, all = false) {
        const bfastUi = await new BfastUiAngular().init();
        await bfastUi.ide.start();
        async function openStart() {
            const url = `http://localhost:${bfastUi.port}`;
            await open(url);
            return 'bfast ui ide running at \"' + url + '\"';
        }
        if (all === true) {
            await openStart();
        } else {
            try {
                const projectDirContents = await promisify(readdir)(join(projectDir, 'src', 'app'));
                const moduleName = projectDirContents.filter(x=>x.includes('.module.ts'))
                    .map(y=>y.replace('.module.ts', '').trim())
                    .join('');
                const projectDirectoryName = basename(projectDir).toString()
                    .replace(new RegExp('[\\s]', 'ig'), '').trim();
                const path = encodeURIComponent(join(projectDir, 'src', 'app'));
                const module = encodeURIComponent(Utils.camelCaseToKebal(moduleName));
                const projectName = encodeURIComponent(Utils.kebalCaseToCamelCase(projectDirectoryName));
                const url = `\"http://localhost:${bfastUi.port}/project?path=${path}&module=${module}&name=${projectName}\"`;
                await open(url);
                return 'bfast ui ide running at \"' + url + '\"';
            } catch (e) {
                await openStart();

            }
        }
    }
}

module.exports = {
    CliFunctionsController: FunctionsCliController
}
