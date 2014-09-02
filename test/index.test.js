/*!
 * sdk-base - index.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var inherits = require('util').inherits;
var Base = require('..');

function Child() {
  Base.call(this);
}

inherits(Child, Base);

describe('sdk-base', function () {
  describe('default error handler', function () {
    it('should ok', function (done) {
      var c = new Child();
      c.listeners('error').length.should.equal(0);
      setTimeout(function () {
        c.listeners('error').length.should.equal(1);
        done();
      }, 10);
    });
  });

  describe('custom error handler', function () {
    it('should ok', function (done) {
      var c = new Child();
      c.on('error', function (err) {
        err.message.should.equal('mock');
      });
      c.listeners('error').length.should.equal(1);
      setTimeout(function () {
        c.listeners('error').length.should.equal(1);
        c.emit('error', new Error('mock'));
        done();
      }, 10);
    });
  });
});
