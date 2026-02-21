import {expect} from 'chai';
import path from 'path';
import {FunctionsCliController} from '../src/controller/functions.cli.controller.mjs';

describe('FunctionsCliController', () => {
    it('rejects invalid workspace names', async () => {
        const controller = new FunctionsCliController({
            functionController: {
                initiateFunctionsFolder: async () => 'should-not-be-called'
            }
        });

        const invalidNames = ['', '.', '.hidden', '../tmp', 'a/b', 'a\\b', 'a..b'];
        for (const name of invalidNames) {
            // eslint-disable-next-line no-await-in-loop
            const result = await controller.createAWorkspace(name);
            expect(result).to.equal('name format error: use letters, numbers, dot, dash, underscore only');
        }
    });

    it('creates workspace path inside current directory for valid name', async () => {
        let capturedFolder = null;
        const controller = new FunctionsCliController({
            functionController: {
                initiateFunctionsFolder: async (folder) => {
                    capturedFolder = folder;
                    return 'ok';
                }
            }
        });

        const result = await controller.createAWorkspace('my-workspace');
        expect(result).to.equal('ok');
        expect(capturedFolder).to.equal(path.resolve(process.cwd(), 'my-workspace'));
    });
});
