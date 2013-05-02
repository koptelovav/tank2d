define(function () {
    var Utils = {};

    Utils.random = function (range) {
        return Math.floor(Math.random() * range);
    };

    return Utils;
});