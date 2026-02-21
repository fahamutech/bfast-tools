/**
 * manage local workspace scaffolding
 */
import fsExtra from 'fs-extra';
import fs from 'fs';
import path from 'path';
import {ShellController} from './shell.controller.mjs';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shellController = new ShellController();

export class WorkspaceController {
    constructor() {
        this._fse = fsExtra;
        this._fs = fs;
        this._path = path;
    }

    /**
     * @param projectDir {string}
     * @param progress {function(string)}
     * @return {Promise<string>}
     */
    async prepareWorkspaceFolder(projectDir, progress = console.log) {
        if (this._fs.existsSync(projectDir)) {
            return '\nfolder already exist at: ' + projectDir;
        }

        this._fse.copySync(this._path.join(__dirname, '/../res/backend'), projectDir);
        progress('\nInstall dependencies');
        await shellController.exec('npm install', {cwd: projectDir});
        return `done create project folder, run "cd ${projectDir}" to navigate to your project folder`;
    }
}
