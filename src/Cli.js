class Cli {
    /**
     *
     * @param functionsController {FunctionController}
     * @param authController {AuthController}
     * @param commander {Command}
     */
    constructor({functionsController, authController, commander}) {
        this._commander = commander;
        this._functionsController = functionsController;
        this._authController = authController;
    }

    version() {
        this._commander.version('1.2')
    }

    init() {

    }

    // build() {
    //     this._version();
    //     this._init();
    //     this._registerOptions();
    // }
}

module.exports = Cli;
