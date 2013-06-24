define(['../../shared/js/entity'],function (Entity) {
    var MovableEntity = Entity.extend({
        init: function (id, type, kind, speed){
            this._super(id, type, kind);

            this.orientation = 1;
            this.speed = speed;
            this.isMovable = false;
        },

        setOrientation: function (newOrientation) {
            if (this.orientation !== newOrientation) {
                this.orientation = newOrientation;
                this.emit('changeOrientation', this.orientation);
                this.emit('redraw');

              /*  var x = this.x % 16 >= 8 ? Math.ceil(this.x / 16) : Math.round(this.x / 16);
                var y = this.y % 16 >= 8 ? Math.ceil(this.y / 16) : Math.round(this.y / 16);*/

                this.setPosition(this.gridX, this.gridY);
            }
        },

        move: function (dt) {
            var dt = dt || 1;
            this.emit('beforeMove', this);

            if (this.orientation === Types.Orientations.LEFT) this.x -= this.speed * dt;
            else if (this.orientation === Types.Orientations.UP) this.y -= this.speed * dt;
            else if (this.orientation === Types.Orientations.RIGHT) this.x += this.speed * dt;
            else if (this.orientation === Types.Orientations.DOWN) this.y += this.speed * dt;
            this.emit('shift', this);

            if (this.x / 16 <= this.gridX-1 || this.x / 16 >= this.gridX+1 ||
                this.y / 16 <= this.gridY-1 || this.y / 16 >= this.gridY+1) {

                if (this.orientation === Types.Orientations.LEFT) this.gridX--;
                else if (this.orientation === Types.Orientations.UP) this.gridY--;
                else if (this.orientation === Types.Orientations.RIGHT) this.gridX++;
                else if (this.orientation === Types.Orientations.DOWN) this.gridY++;
            }

            this.emit('afterMove', this);
            this.emit('redraw');
        },

        syncPososition: function(x, y, gridX, gridY){
            this.x = x;
            this.y = y;
            this.gridX = gridX;
            this.gridY = gridY;
        },

        toggleMovable: function () {
            this.isMovable = !this.isMovable;

            if (this.isMovable) {
                this.emit('beginMove');
            } else {
                this.emit('endMove');
            }
        }
    });

    return MovableEntity;
});