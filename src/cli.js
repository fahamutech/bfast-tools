#!/usr/bin/env node
const BFastJs = require('./bfast');
const bfast = new BFastJs({
    clusterApiUrl: 'https://api.bfast.fahamutech.com'
});
bfast.cli();
