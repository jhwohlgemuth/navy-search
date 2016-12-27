'use strict';

const fs   = require('fs-extra');
const path = require('path');

exports.readFile = function(fileName) {
    var filePath = path.join(__dirname, fileName);
    return fs.readFileSync(filePath);
};
