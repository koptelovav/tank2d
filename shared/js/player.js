define(['../../shared/js/tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;
            this.isMove = false
            this.isMoveable = false;

            this._super(config.id, "player", config.kind, {
                "speed": 250,
                "armor": 1,
                "bullet": 1
            });
        },

        setOrientation: function (newOrientation) {
            this.orientation = newOrientation;
        },

        move: function() {
            var self = this;
            this.emit('beforeMove', this);

            this.isMove = true;

            var increment = 0;
            var moveInterval = setInterval(function(){
                if(increment < 16){
                    increment++;
                    if (self.orientation === Types.Orientations.LEFT) self.x--;
                    else if (self.orientation === Types.Orientations.UP) self.y--;
                    else if (self.orientation === Types.Orientations.RIGHT) self.x++;
                    else if (self.orientation === Types.Orientations.DOWN) self.y++;
                    self.emit('animate', self);
                }
                else if(increment === 16){
                    clearInterval(moveInterval);
                    if (self.orientation === Types.Orientations.LEFT) self.gridX--;
                    else if (self.orientation === Types.Orientations.UP) self.gridY--;
                    else if (self.orientation === Types.Orientations.RIGHT) self.gridX++;
                    else if (self.orientation === Types.Orientations.DOWN) self.gridY++;

                    self.setPosition(self.gridX, self.gridY);
                    self.isMove = false;
                    self.emit('move', self);

                }
            },1000/this.speed);




        },

        getState: function () {
            var state = [
                this.id,
                this.kind,
                this.team,
                this.isReady
            ];
            return state;
        }
    });

    return Player;
});