#!/usr/bin/env node
const os = require('os');
const {join} = require('path');
const file = require('fs-extra');
const BfastTools = require('./bfast.cli');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const bfast = new BfastTools();
(function () {
    const path = join(`${os.homedir()}`,'bfast-tools');
    if (file.existsSync(path)) {
        return;
    }
    file.mkdirsSync(path);
})();
(function () {
    updateNotifier({pkg}).notify();

})();
bfast.start();
