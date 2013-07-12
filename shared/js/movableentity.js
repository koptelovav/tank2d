define(['entity'],function (Entity) {
    var MovableEntity = Entity.extend({
        init: function (id, type, kind, speed){
            this._super(id, type, kind);

            this.movable = true;
            this.orientation = 1;
            this.speed = speed;
            this.isMovable = false;

            this.collections = this.collections.concat([CONST.COLLECTIONS.MOVABLE]);
        },

        setOrientation: function (newOrientation) {
            var gridX,
                gridY;
            if (this.orientation !== newOrientation) {
                this.orientation = newOrientation;

                gridX = (this.x / 16 + 0.5) << 0;
                gridY = (this.y / 16 + 0.5) << 0;

                this.setPosition(gridX, gridY);

                this.emit('changeOrientation', this.orientation);
            }
        },

        move: function (dt, predict) {
            var gridX = this.gridX,
                gridY = this.gridY,
                x = this.x,
                y = this.y,
                dPosition = (0.5 + this.speed * dt) << 0;

            if (this.orientation === CONST.ORIENTATIONS.LEFT) x -= dPosition;
            else if (this.orientation === CONST.ORIENTATIONS.UP) y -= dPosition;
            else if (this.orientation === CONST.ORIENTATIONS.RIGHT) x += dPosition;
            else if (this.orientation === CONST.ORIENTATIONS.DOWN) y += dPosition;

            if (x / 16 <= gridX-1 || x / 16 >= gridX+1 ||
                y / 16 <= gridY-1 || y / 16 >= gridY+1) {

                if (this.orientation === CONST.ORIENTATIONS.LEFT) gridX--;
                else if (this.orientation === CONST.ORIENTATIONS.UP) gridY--;
                else if (this.orientation === CONST.ORIENTATIONS.RIGHT) gridX++;
                else if (this.orientation === CONST.ORIENTATIONS.DOWN) gridY++;
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
            }
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