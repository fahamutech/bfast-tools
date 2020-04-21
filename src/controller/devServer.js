const FunctionController = require('./FunctionController');
const functionController = new FunctionController();

functionController.serve(process.env.DEV_WORK_DIR, process.env.DEV_PORT);
