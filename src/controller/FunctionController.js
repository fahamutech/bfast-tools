class FunctionController {

    /**
     *
     * @param resourceFactory {ResourceFactory}
     * @param authController {AuthController}
     */
    constructor({resourceFactory, authController}) {
        this._resourceFactory = resourceFactory;
        this._authController = authController;

        this._serve = (projectDir) => {

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

    serve(projectDir) {
        try {
            const bfastFile = require(`${projectDir}/bfast.json`);
            console.log(bfastFile);
            console.log(bfastFile.projectId);
            if (bfastFile && bfastFile.projectId !== undefined || bfastFile.projectId !== null) {
                console.log('serve project');
            } else {
                console.log('project file is invalid');
            }
        } catch (e) {
            console.log('not in bfast project folder : ' + e.toString());
        }
    }

    deploy() {

    }
}

module.exports = FunctionController;
