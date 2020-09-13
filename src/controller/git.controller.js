const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');


class GitController {
    async init(functionsDir) {
        return git.init({
            fs: fs,
            defaultBranch: 'master',
            bare: false,
            dir: functionsDir,
        });
    }

    async add(functionsDir) {
        return git.add({
            fs: fs,
            gitdir: functionsDir,
            dir: functionsDir,
            filepath: '.',
        });
    }

    async commit(message, functionsDir, {ref} = {}) {
        return git.commit({
            fs: fs,
            dir: functionsDir,
            author: {
                name: 'you',
                email: 'you@example.com',
            },
            noUpdateBranch: true,
            ref: ref !== undefined ? ref : 'master',
            gitdir: functionsDir,
            message,
        });
    }

    async push(functionsDir) {
        return git.push({
            fs,
            gitdir: functionsDir,
            onProgress: progress => {
                console.log(progress);
            }
        });
    }
}

module.exports = GitController;
