define(['entity'], function (Entity) {

    var Tank = Entity.extend({
        init: function (id, type, kind, x, y, orientation, config) {
            var self = this;
            this._super(id, type, kind, x, y);
            this.id = parseInt(id);
            this._params = config;
            this.speed = self._params['speed'];
            this.armor = self._params['armor'];
            this.bullet = self._params['bullet'];
            this.orientation = orientation;
        },

        move: function(){

        }
    });

    return Tank;
});