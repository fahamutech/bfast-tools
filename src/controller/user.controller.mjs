import {BFastJs} from "../bfast.cli.mjs";

export class UserController {

    /**
     *
     * @param restController {RestController}
     */
    constructor(restController) {
        this.restController = restController;
    }

    async login(email, password) {
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/users/login`, {
            email: email,
            password: password
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });
    }

    async reset(email) {
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/users/password/request`, {
            email: email
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });
    }

    /**
     *
     * @param user {{
     *     displayName: string,
     *     email: string,
     *     password: string,
     *     phoneNumber: string
     * }}
     * @return {Promise<*>}
     */
    async register(user) {
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/users`, user, {
            headers: {
                'content-type': 'application/json'
            }
        });
    }

    async logout(token) {
        return await this.restController.post(`${await BFastJs.clusterApiUrl()}/users/logout`, {
            token: token
        }, {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${token}`
            }
        });
    }
}
