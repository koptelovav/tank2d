define(['../../shared/lib/class','../../shared/lib/events'], function () {
    var Model = Class.extend({});

    Model.super_ = EventEmitter;
    Model.prototype = Object.create(EventEmitter.prototype, {
        constructor: {
            value: Model,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    return Model;
});