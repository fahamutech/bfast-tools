import { createRequire } from "module";
const require = createRequire(import.meta.url);
export class Utils {
     static async isBFastProject(projectDir) {
        try {
            const projectInfo = require(`${projectDir}/bfast.json`);
            return JSON.parse(JSON.stringify(projectInfo));
        } catch (e) {
            throw {message: 'Not in bfast project folder'};
        }
    }
}
