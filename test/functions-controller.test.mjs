import {expect} from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {FunctionsController} from '../src/controller/functions.controller.mjs';

describe('FunctionsController', () => {
    let tmpRoot;
    let logs;
    let originalLog;

    beforeEach(() => {
        tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bfast-tools-test-'));
        logs = [];
        originalLog = console.log;
        console.log = (message) => logs.push(message);
    });

    afterEach(() => {
        console.log = originalLog;
        fs.rmSync(tmpRoot, {recursive: true, force: true});
    });

    it('reports missing bfast.json', () => {
        const controller = new FunctionsController();

        controller.serve(tmpRoot, 3000);

        expect(logs).to.deep.equal(['not in project folder or bfast.json is missing']);
    });

    it('reports missing functions folder', () => {
        const controller = new FunctionsController();
        fs.writeFileSync(path.join(tmpRoot, 'bfast.json'), '{}');

        controller.serve(tmpRoot, 3000);

        expect(logs).to.deep.equal(['functions folder not found in current project']);
    });

    it('reports invalid bfast.json content', () => {
        const controller = new FunctionsController();
        fs.writeFileSync(path.join(tmpRoot, 'bfast.json'), '{invalid');
        fs.mkdirSync(path.join(tmpRoot, 'functions'));

        controller.serve(tmpRoot, 3000);

        expect(logs).to.deep.equal(['bfast.json is invalid JSON']);
    });
});
