/*!
 * sdk-base - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
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

function Base () {
  // defer bind default error handler
  var self = this;
  defer(function () {
    if (!self.listeners('error').length) self.on('error', onerror);
  });
  EventEmitter.call(this);
}

/**
 * inherits from EventEmitter
 */

inherits(Base, EventEmitter);

/**
 * default error handler
 */

function onerror(err) {
  if (process.env.NODE_ENV !== 'test') console.error(err.stack);
}
