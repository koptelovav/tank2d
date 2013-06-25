define(['../../shared/js/movableentity'], function (MovableEntity) {

    var Tank = MovableEntity.extend({
        init: function (id, type, kind, config) {
            this._params = config;
            this.speed = this._params['speed'];
            this.strength = this._params['armor'];
            this.bullet = this._params['bullet'];

            this.tankColliding = true;
            this.bulletColliding = true;

            this._super(id, type, kind, this.speed);

            this.setSize(32);
        }
    });

    return Tank;
});