/**
 * manage initiation or project structure
 */
const GitController = require('./git.controller');
let gitController = new GitController();
const ShellController = require('./shell.controller');
let shellController = new ShellController();

class WorkspaceController {
    constructor() {
        this._fse = require('fs-extra');
        this._fs = require('fs');
        this._path = require('path');
        this._checkIfFileExist = (projectDir) => {
            return this._fs.existsSync(projectDir);
        }
    }

    /**
     *
     * @param projectDir {string}
     * @param progress {function(arg: string)}
     * @return {Promise<string>}
     */
    async prepareWorkspaceFolder(projectDir, progress = console.log) {
        if (this._checkIfFileExist(projectDir)) {
            progress('\nproject folder already exist at: ' + projectDir);
            // process.exit(0);
        }
        this._fse.copySync(this._path.join(__dirname, `/../res`), projectDir);
        await gitController.init(projectDir);
        // await gitController.add(projectDir);
        // await gitController.commit('initial commit', projectDir);
        progress('\nInstall dependencies');
        await shellController.exec(`cd ${projectDir} && npm install`);
        // await gitController.add(projectDir);
        return `done create project folder, run "cd ${projectDir}" to navigate to your project folder`;
    }

    async getProjectIdFromBfastFJSON(projectDir) {
        try {
            return require(this._path.join(projectDir, '/bfast.json'));
        } catch (e) {
            return 'This is not a bfast project folder "bfast.json" not found';
        }
    }

    /**
     *
     * @param projectId {string}
     * @param projectDir {string} current project directory path
     * @returns {Promise<string>}
     */
    async saveProjectIdInBFastJSON({projectId, projectDir}) {
        try {
            let bfastJson = require(this._path.join(projectDir, '/bfast.json'));
            bfastJson = JSON.parse(JSON.stringify(bfastJson));
            bfastJson.projectId = projectId;
            this._fs.writeFileSync(this._path.join(projectDir, '/bfast.json'), JSON.stringify(bfastJson));
            return 'Ok';
        } catch (e) {
            return 'Fails to save project id in bfast.json file'
        }
    }

}

module.exports = WorkspaceController;
