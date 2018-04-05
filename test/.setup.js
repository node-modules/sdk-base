'use strict';

const ver = process.version;
let major = ver.split('.')[0];
major = parseInt(major.substr(1), 10);
// below node 8
if (major < 8) {
  require('babel-register');
}
