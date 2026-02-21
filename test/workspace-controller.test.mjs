import {expect} from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {WorkspaceController} from '../src/controller/workspace.controller.mjs';
import {ShellController} from '../src/controller/shell.controller.mjs';

describe('WorkspaceController', () => {
    let tmpRoot;
    let originalExec;

    beforeEach(() => {
        tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bfast-tools-test-'));
        originalExec = ShellController.prototype.exec;
    });

    afterEach(() => {
        ShellController.prototype.exec = originalExec;
        fs.rmSync(tmpRoot, {recursive: true, force: true});
    });

    it('returns early when project folder already exists', async () => {
        const projectDir = path.join(tmpRoot, 'existing');
        fs.mkdirSync(projectDir, {recursive: true});
        const controller = new WorkspaceController();

        const progressMessages = [];
        const result = await controller.prepareWorkspaceFolder(projectDir, (message) => progressMessages.push(message));

        expect(result).to.equal(`\nfolder already exist at: ${projectDir}`);
        expect(progressMessages).to.deep.equal([]);
    });

    it('copies template workspace and installs dependencies', async () => {
        const projectDir = path.join(tmpRoot, 'new-project');
        const controller = new WorkspaceController();
        const execCalls = [];
        ShellController.prototype.exec = async (command, options) => {
            execCalls.push({command, options});
            return '';
        };

        const progressMessages = [];
        const result = await controller.prepareWorkspaceFolder(projectDir, (message) => progressMessages.push(message));

        expect(progressMessages).to.deep.equal(['\nInstall dependencies']);
        expect(execCalls).to.deep.equal([{command: 'npm install', options: {cwd: projectDir}}]);
        expect(fs.existsSync(path.join(projectDir, 'bfast.json'))).to.equal(true);
        expect(fs.existsSync(path.join(projectDir, 'functions', 'index.mjs'))).to.equal(true);
        expect(result).to.equal(`done create project folder, run "cd ${projectDir}" to navigate to your project folder`);
    });
});
