#!/usr/bin/env node
import os from "os";
import {join} from "path";
import fse from "fs-extra";
import {BFastJs} from "./bfast.cli.mjs";

const {mkdirsSync, pathExistsSync} = fse;
const bfast = new BFastJs();
(function () {
    const path = join(`${os.homedir()}`, 'bfast-tools');
    if (pathExistsSync(path)) {
        return;
    }
    mkdirsSync(path);
})();
bfast.start();
