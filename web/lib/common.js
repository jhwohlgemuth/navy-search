'use strict';

const _    = require('lodash');
const fs   = require('fs-extra');
const path = require('path');

const hasSameAttr = (val) => (a, b) => (a[val] === b[val]);

module.exports = {
    readFile,
    hasSameAttr,
    uniqWithAttr
};

function readFile(fileName) {
    var filePath = path.join(__dirname, fileName);
    return fs.readFileSync(filePath);
}

function uniqWithAttr(collection, val) {
    return _.uniqWith(collection, hasSameAttr(val));
}
