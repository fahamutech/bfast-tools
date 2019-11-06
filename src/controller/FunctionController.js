const glob = require('glob');
const ExpressApp = require('./ExpressAppController');

class FunctionController {

    /**
     *
     * @param resourceFactory {ResourceFactory}
     * @param authController {AuthController}
     */
    constructor({resourceFactory, authController}) {
        this._resourceFactory = resourceFactory;
        this._authController = authController;
        this._getFunctions = (projectDir) => {
            let bfastJSON = require(`${projectDir}/bfast.json`);
            const bfastStringfied = JSON.stringify(bfastJSON);
            bfastJSON = JSON.parse(bfastStringfied);
            const files = glob.sync(`${projectDir}/**/*.js`, {
                absolute: true,
                ignore: bfastJSON.ignore
            });
            let functions = {
                mambo: function (req, response) {
                    response.json({message: 'Powa!'});
                }
            };
            files.forEach(file => {
                const fileModule = require(file);
                const functionNames = Object.keys(fileModule);
                functionNames.forEach(name => {
                    functions[name] = fileModule[name];
                });
            });
            return functions;
        };
        this._serveFunctions = (functions, port) => {
            new ExpressApp({functions, port}).start();
        }
    }

    /**
     * create a bootstrap project for bfast cloud functions
     * @param projectDir {path} a workspace
     */
    initiateFunctionsFolder(projectDir) {
        if (!this._authController.isAuthenticated()) throw Error('login first');
        this._resourceFactory.createProjectFolder(projectDir)
    }

    /**
     * serve cloud functions locally
     * @param projectDir
     * @param port
     */
    serve(projectDir, port) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            if (bfastFile && bfastFile.projectId !== undefined || bfastFile.projectId !== null) {
                const functions = this._getFunctions(projectDir);
                this._serveFunctions(functions, port);
            } else {
                console.log('project file is invalid');
            }
        } catch (e) {
            console.log(e);
            console.log('can not serve project, error : ' + e.toString());
        }
    }

    deploy() {

    }
}

module.exports = FunctionController;
