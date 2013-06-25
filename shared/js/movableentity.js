define(['../../shared/js/entity'],function (Entity) {
    var MovableEntity = Entity.extend({
        init: function (id, type, kind, speed){
            this._super(id, type, kind);

            this.orientation = 1;
            this.speed = speed;
            this.isMovable = false;
        },

        setOrientation: function (newOrientation) {
            var x,
                y;
            if (this.orientation !== newOrientation) {
                this.orientation = newOrientation;
                x = this.x % 16 >= 8 ? Math.ceil(this.x / 16) : Math.round(this.x / 16);
                y = this.y % 16 >= 8 ? Math.ceil(this.y / 16) : Math.round(this.y / 16);
                this.setPosition(x, y);

                this.emit('changeOrientation', this.orientation);
                this.emit('redraw');
            }
        },

        move: function (dt, predict) {
            var dt = dt || 1,
                gridX = this.gridX,
                gridY = this.gridY,
                x = this.x,
                y = this.y;


            if (this.orientation === Types.Orientations.LEFT) x -= this.speed * dt;
            else if (this.orientation === Types.Orientations.UP) y -= this.speed * dt;
            else if (this.orientation === Types.Orientations.RIGHT) x += this.speed * dt;
            else if (this.orientation === Types.Orientations.DOWN) y += this.speed * dt;

            if (x / 16 <= gridX-1 || x / 16 >= gridX+1 ||
                y / 16 <= gridY-1 || y / 16 >= gridY+1) {

                if (this.orientation === Types.Orientations.LEFT) gridX--;
                else if (this.orientation === Types.Orientations.UP) gridY--;
                else if (this.orientation === Types.Orientations.RIGHT) gridX++;
                else if (this.orientation === Types.Orientations.DOWN) gridY++;
            }

            if(predict){
                return [gridX, gridY];
            }else{
                this.emit('beforeMove', this);

                this.x = x;
                this.y = y;
                this.gridX = gridX;
                this.gridY = gridY;

                this.emit('shift', this);
                this.emit('afterMove', this);
                this.emit('redraw');
            }
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