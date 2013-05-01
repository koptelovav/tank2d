var EventEmitter = require(LIBPATH+'/events').EventEmitter,
    cls = require(LIBPATH+'/class'),
    util = require('util');

// =======  ========

var Model = cls.Class.extend({});
util.inherits(Model, EventEmitter);

module.exports = Model;

