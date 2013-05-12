define(['../../shared/js/movableentity'], function (MovableEntity) {

    var Tank = MovableEntity.extend({
        init: function (id, type, kind, config) {
            this._params = config;
            this.speed = this._params['speed'];
            this.armor = this._params['armor'];
            this.bullet = this._params['bullet'];

            this.tankColliding = true;
            this.bulletColliding = true;

            this._super(id, type, kind, this.speed);
        }
    });

    return Tank;
});