module.exports = class Utils {
     static async isBFastProject(projectDir) {
        try {
            const projectInfo = require(`${projectDir}/bfast.json`);
            return JSON.parse(JSON.stringify(projectInfo));
        } catch (e) {
            throw {message: 'Not in bfast project folder'};
        }
    }
};
