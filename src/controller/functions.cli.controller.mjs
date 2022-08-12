import {Utils} from "../utils/utils.mjs";
import {FunctionsController} from "./functions.controller.mjs";
import {basename, join} from "path";
import {promisify} from "util";
import {readdir} from "fs";
import {open} from "out-url";


export class FunctionsCliController {

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

    // async openFrontendIDE(projectDir, autoOpen = false, all = false) {
    //     const bfastUi = await new BfastUiAngular().init();
    //     await bfastUi.ide.start();

    //     async function openStart(url) {
    //         if (autoOpen === true) {
    //             await open(url);
    //         }
    //         return 'bfast ui ide running at \"' + url + '\"';
    //     }

    //     if (all === true) {
    //         return await openStart(`http://localhost:${bfastUi.port}`);
    //     } else {
    //         try {
    //             const projectDirContents = await promisify(readdir)(join(projectDir, 'src', 'app'));
    //             const moduleName = projectDirContents.filter(x => x.includes('.module.ts'))
    //                 .map(y => y.replace('.module.ts', '').trim())
    //                 .join('');
    //             const projectDirectoryName = basename(projectDir).toString()
    //                 .replace(new RegExp('[\\s]', 'ig'), '').trim();
    //             const path = join(projectDir, 'src', 'app');
    //             const module = Utils.camelCaseToKebal(moduleName);
    //             const projectName = Utils.kebalCaseToCamelCase(projectDirectoryName);
    //             const url = `http://localhost:${bfastUi.port}/project?path=${path}&module=${module}&name=${projectName}`;
    //             return await openStart(url);
    //         } catch (e) {
    //             console.log(e.toString());
    //             return await openStart(`http://localhost:${bfastUi.port}`);
    //         }
    //     }
    // }
}
