define(['../../shared/js/baseEntity'], function (BaseEntity) {
    var Entity = BaseEntity.extend({
        init: function (id, type, kind) {
            this._super(id, type, kind);
        }
    });

    return Entity;
});