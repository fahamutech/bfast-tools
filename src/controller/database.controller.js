const axios = require('axios');
const Utils = require('./utils');
const LocalStorage = require('./local-storage.controller');
const BFastJs = require("../bfast.cli");
const _storage = new LocalStorage();
const {open} = require('out-url');

class DatabaseController {

    async openUi(port) {
        const url = 'https://bfast-playground.web.app/';
        await open(url);
        return 'BFast::Database playground listening at ' + url + ' in your browser';
    }

    /**
     *
     * @param projectId {string}
     * @param {string} name - docker image to be used
     * @param force {boolean} - force restart immediately
     * @return {Promise}
     */
    async image(projectId, name, force = false) {
        try {
            const user = await _storage.getUser();
            console.log(`\nCurrent bfast project ( projectId: ${projectId})`);
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/database/${projectId}/image?force=${force}`,
                {
                    image: name
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

module.exports = {DatabaseController};
