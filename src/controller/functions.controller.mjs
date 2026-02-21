import {FaasController} from "./bfastFunctions.controller.mjs";
import {WorkspaceController} from "./workspace.controller.mjs";
import fs from 'fs';

const resourceFactory = new WorkspaceController();

export class FunctionsController {

    /**
     * create a bootstrap project for local bfast functions
     * @param projectDir {string}
     * @return {Promise<string>}
     */
    async initiateFunctionsFolder(projectDir) {
        return resourceFactory.prepareWorkspaceFolder(projectDir);
    }

    /**
     * start local development server to host functions
     * @param projectDir {string}
     * @param port {number|string}
     */
    serve(projectDir, port) {
        const bfastJsonPath = `${projectDir}/bfast.json`;
        const functionsDirPath = `${projectDir}/functions`;

        if (!fs.existsSync(bfastJsonPath)) {
            console.log('not in project folder or bfast.json is missing');
            return;
        }

        if (!fs.existsSync(functionsDirPath)) {
            console.log('functions folder not found in current project');
            return;
        }

        try {
            JSON.parse(fs.readFileSync(bfastJsonPath).toString());
        } catch (_) {
            console.log('bfast.json is invalid JSON');
            return;
        }

        new FaasController({functionsDirPath, bfastJsonPath, port})
            .start()
            .catch((error) => {
                console.log(error && error.message ? error.message : error.toString());
            });
    }
}
