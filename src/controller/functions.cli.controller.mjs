import path from 'path';

const WORKSPACE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

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
        if (!this._isValidWorkspaceName(name)) {
            return 'name format error: use letters, numbers, dot, dash, underscore only';
        }

        const baseDir = path.resolve(process.cwd());
        const folder = path.resolve(baseDir, name);
        if (!folder.startsWith(`${baseDir}${path.sep}`)) {
            return 'name format error: workspace must be created inside current directory';
        }

        return this._functionController.initiateFunctionsFolder(folder);
    }

    _isValidWorkspaceName(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        const value = name.trim();
        if (!value || value === '.' || value.startsWith('.')) {
            return false;
        }
        if (value.includes('/') || value.includes('\\') || value.includes('..')) {
            return false;
        }
        return WORKSPACE_NAME_PATTERN.test(value);
    }
}
