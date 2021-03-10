/**
 * manage initiation or project structure
 */
const {readFile, writeFile} = require('fs');
const {promisify} = require('util');
const {join} = require('path');
const GitController = require('./git.controller');
const {Utils} = require("../utils/utils");
let gitController = new GitController();
const {ShellController} = require('./shell.controller');
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
            return '\nfolder already exist at: ' + projectDir;
        } else {
            this._fse.copySync(this._path.join(__dirname, `/../res/backend`), projectDir);
            await gitController.init(projectDir);
            progress('\nInstall dependencies');
            await shellController.exec(`cd ${projectDir} && npm install`);
            return `done create project folder, run "cd ${projectDir}" to navigate to your project folder`;
        }
    }

    /**
     *
     * @param projectDir {string}
     * @param name {string} project name
     * @param progress {function(arg: string)}
     * @param type {string}
     * @return {Promise<string>}
     */
    async prepareFrontendWorkspaceFolder(projectDir, name, type = 'angular', progress = console.log,) {
        if (this._checkIfFileExist(projectDir)) {
            return '\nfolder already exist at: ' + projectDir;
        } else {
            this._fse.copySync(join(__dirname, `/../res/frontend`, type), projectDir);
            await gitController.init(projectDir);
            await this._updatePackageName(projectDir, name);
            await this._updateAngularJson(projectDir, name);
            await this._updateIndexHtml(projectDir, name);
            await this._writeAngularMainModule(projectDir, name);
            await this._writeGitIgnoreFile(projectDir, type);
            progress('\nInstall dependencies');
            await shellController.exec(`cd ${projectDir} && npm install`);
            return `done create project folder, run "cd ${projectDir}" to navigate to your project folder`;
        }
    }

    /**
     *
     * @param projectDir {string} project dir
     * @param name {string} project name
     * @return {Promise<*>}
     * @private
     */
    async _writeAngularMainModule(projectDir, name) {
        const filePath = join(projectDir, 'src', 'app', `${name}.module.ts`);
        const fileMainPath = join(projectDir, 'src', `main.ts`);
        const mainModuleContent = `import {bfast} from 'bfastjs';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class ${Utils.kebalCaseToCamelCase(name)}Module {
  constructor() {
  }// end
}

        `;
        const main = `import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ${Utils.kebalCaseToCamelCase(name)}Module } from './app/${Utils.camelCaseToKebal(name)}.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(${Utils.kebalCaseToCamelCase(name)}Module)
  .catch(err => console.error(err));

        `;
        await promisify(writeFile)(filePath, mainModuleContent);
        await promisify(writeFile)(fileMainPath, main);
        return 'done';
    }

    /**
     *
     * @param projectDir {string} project dir
     * @param name {string} project name
     * @return {Promise<*>}
     * @private
     */
    async _updatePackageName(projectDir, name) {
        const filePath = join(projectDir, 'package.json');
        const packageJsonFile = await promisify(readFile)(filePath);
        const updatePackageJson = packageJsonFile.toString()
            .replace(new RegExp('(bfast-ui-app)', 'ig'), name)
            .trim();
        return promisify(writeFile)(filePath, updatePackageJson);
    }

    /**
     *
     * @param projectDir {string} project dir
     * @param name {string} project name
     * @return {Promise<*>}
     * @private
     */
    async _updateAngularJson(projectDir, name) {
        const filePath = join(projectDir, 'angular.json');
        const packageJsonFile = await promisify(readFile)(filePath);
        const updatedAngularJson = packageJsonFile.toString()
            .replace(new RegExp('(bfast-ui-app)', 'ig'), name)
            .trim();
        return promisify(writeFile)(filePath, updatedAngularJson);
    }

    /**
     *
     * @param projectDir {string} project dir
     * @param name {string} project name
     * @return {Promise<*>}
     * @private
     */
    async _updateIndexHtml(projectDir, name) {
        const filePath = join(projectDir, 'src', 'index.html');
        const indexInString = await promisify(readFile)(filePath);
        const updatedIndexHtml = indexInString.toString()
            .replace(new RegExp('(bfast-ui-app)', 'ig'), name)
            .trim();
        return promisify(writeFile)(filePath, updatedIndexHtml);
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

    /**
     *
     * @param projectDir {string}
     * @param type {string}
     * @return {Promise<string>}
     * @private
     */
    async _writeGitIgnoreFile(projectDir, type) {
        try {
            const gitIgnorePath = join(__dirname, `/../res/frontend`, type, '/.gitignore');
            const gitignore = await promisify(readFile)(gitIgnorePath);
            this._fs.writeFileSync(join(projectDir, '/.gitignore'), gitignore);
            return 'Ok';
        } catch (e) {
            return 'Fails to update gitignore file';
        }
    }
}

module.exports = WorkspaceController;
