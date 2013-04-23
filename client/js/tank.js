define(['entity'], function (Entity) {

    var Tank = Entity.extend({
        init: function (id, type, kind, config) {
            var self = this;
            this._super(id, kind);

            this.id = parseInt(id);
            this.orientation = 0;
            this._params = config;
            this.speed = self._params['speed'];
            this.armor = self._params['armor'];
            this.bullet = self._params['bullet'];
        },

        move: function(){

        },

        setOrientation: function(orientation) {
            if(orientation) {
                this.orientation = orientation;
            }
        }
    });

    return Tank;
});