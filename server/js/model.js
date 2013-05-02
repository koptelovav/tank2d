define(['util','../../shared/lib/class','../../shared/lib/events'], function (util) {
    var Model = Class.extend({});
    util.inherits(Model, EventEmitter);
    return Model;
});