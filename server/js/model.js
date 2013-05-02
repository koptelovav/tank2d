define(['util','events','../../shared/lib/class'], function (util,Events) {
    var Model = Class.extend({});
    util.inherits(Model, Events.EventEmitter);
    return Model;
});