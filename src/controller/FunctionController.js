const glob = require('glob');
const https = require('https');
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
                mambo: {
                    onRequest: function (req, response) {
                        response.json({message: 'Powa!'});
                    }
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
                console.log('not in project folder or project file is invalid');
            }
        } catch (e) {
            console.log(e);
            console.log('can not serve project, error : ' + e.toString());
        }
    }

    deploy(projectDir, force = true) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            console.log(`current project is : ${bfastFile.projectId}`);
            if (bfastFile && bfastFile.projectId && bfastFile.projectId !== '' &&
                bfastFile.projectId !== undefined && bfastFile.projectId !== null) {
                console.log('please wait, functions deployed...');
                https.request(`https://cloud.bfast.fahamutech.com/deploy/functions/${bfastFile.projectId}?force=${force}`, res => {
                    res.setEncoding('utf8');
                    res.on('data', chunk => {
                        console.log(chunk);
                    });
                    res.on('error', err => {
                        console.error(err);
                    });
                    res.on('end', (_)=>{
                        console.log('functions deployed');
                    });
                }).end();
            } else {
                console.log('projectId can not be determined, ' +
                    'check if your current directory is bfast project bfast.json file exist');
            }
        } catch (e) {
            console.log(e);
            console.log('can not serve project, error : ' + e.toString());
        }
    }
}

module.exports = FunctionController;
