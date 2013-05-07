define(['../../shared/lib/class','../../shared/lib/events'], function () {
    Class.super_ = Events;
    Class.prototype = Object.create(Events.prototype, {
        constructor: {
            value: Class,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    return Class;
});