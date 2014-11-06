/**!
 * sdk-base - index.js
 *
 * Copyright(c) dead_horse and other contributors.
 * MIT Licensed
 *
 * Authors:
 * 	 dead_horse <dead_horse@qq.com>
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = Base;

var defer = global.setImmediate
  ? setImmediate
  : process.nextTick;

function Base() {
  // defer bind default error handler
  defer(function () {
    if (!this.listeners('error').length) {
      /**
       * default error handler
       */
      this.on('error', this.defaultErrorHandler.bind(this));
    }
  }.bind(this));
  EventEmitter.call(this);
}

/**
 * inherits from EventEmitter
 */

inherits(Base, EventEmitter);

Base.prototype.defaultErrorHandler = function (err) {
  if (err.name === 'Error') {
    err.name = this.constructor.name + 'Error';
  }
  console.error('[%s] ERROR %s [sdk-base] Unhandle %s: %s, stack:\n%s',
    Date(), process.pid, err.name, err.message, err.stack);
  // try to should addition property on the error object
  // e.g.: `err.data = {url: '/foo'};`
  console.error(err);
};
