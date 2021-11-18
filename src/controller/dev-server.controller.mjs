import {FunctionsController} from "./functions.controller.mjs";

const functionController = new FunctionsController();

functionController.serve(process.env.DEV_WORK_DIR, process.env.DEV_PORT);
