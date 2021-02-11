module.exports.Utils = {
    randomString: (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    /**
     *
     * @param name
     * @return {string}
     * @public
     */
    firstCaseUpper(name) {
        return name.split('').map((value, index) => {
            if (index === 0) {
                return value.toUpperCase();
            }
            return value;
        }).join('');
    },

    /**
     *
     * @param kebalCase {string}
     * @return {string}
     */
    kebalCaseToCamelCase(kebalCase) {
        return kebalCase
            .trim()
            .split('-')
            .map(y => this.firstCaseUpper(y))
            .join('')
    },

    /**
     *
     * @param camelCase {string}
     * @return {string}
     */
    camelCaseToKebal(camelCase) {
        let guardNameParts = camelCase.match(new RegExp('[A-Z][a-z0-9]+', 'g'));
        if (guardNameParts) {
            return guardNameParts.map(x => x.toLowerCase()).join('-');
        } else {
            return camelCase;
        }
    }
}
