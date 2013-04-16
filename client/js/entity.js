define(function () {
    var Entity = Class.extend({
        init: function (id, type, kind, x, y) {
            this.id = parseInt(id);
            this.type = type;
            this.kind = kind;
            this.x = x;
            this.y = y;
        }
    });

    return Entity;
});