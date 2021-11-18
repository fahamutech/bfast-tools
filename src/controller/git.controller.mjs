import {init, add, commit, push} from "isomorphic-git";
import fs from "fs";

export class GitController {
    async init(functionsDir) {
        return init({
            fs: fs,
            defaultBranch: 'master',
            bare: false,
            dir: functionsDir,
        });
    }

    async add(functionsDir) {
        return add({
            fs: fs,
            gitdir: functionsDir,
            dir: functionsDir,
            filepath: '.',
        });
    }

    async commit(message, functionsDir, {ref} = {}) {
        return commit({
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
        return push({
            fs,
            gitdir: functionsDir,
            onProgress: progress => {
                console.log(progress);
            }
        });
    }
}
