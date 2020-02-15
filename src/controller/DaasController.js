const axios = require('axios');
const Utils = require('./utils');
const LocalStorage = require('./LocalStorageController');
const _storage = new LocalStorage();

class DatabaseController {

    /**
     * switch on/off database dashboard
     * @param projectDir {string}
     * @param mode {number}
     * @param force {boolean}
     * @returns {Promise<>}
     */
    async switchDashboard(projectDir, mode, force = false) {
        try {
            const user = await _storage.getUser();
            await Utils.isBFastProject(projectDir);
            const project = await _storage.getCurrentProject(projectDir);
            console.log(`\nCurrent linked bfast project ( projectId: ${project.projectId})`);
            console.log(`Start switching dashboard ${mode === 0 ? 'off' : 'on'}`);
            const response = await axios.post(`https://api.bfast.fahamutech.com/dashboard/${project.projectId}/switch/${mode}?force=${force}`,
                {},
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${user.token}`
                    },
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason;
            }
        }
    }

    /**
     * update liveQuery classes to listen to
     * @param projectDir {string}
     * @param classes {string[]}
     * @param force {boolean}
     * @returns {Promise<>}
     */
    async addClassesToLiveQuery(projectDir, classes, force) {
        try {
            if (!Array.isArray(classes)) {
                throw "classes must be an array of string"
            }
            const user = await _storage.getUser();
            await Utils.isBFastProject(projectDir);
            const project = await _storage.getCurrentProject(projectDir);
            console.log(`\nCurrent linked bfast project ( projectId: ${project.projectId})`);
            const response = await axios.post(`https://api.bfast.fahamutech.com/database/${project.projectId}/liveQuery?force=${force}`,
                {
                    classNames: classes
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${user.token}`
                    },
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason;
            }
        }
    }
}

module.exports = DatabaseController;
