
var cls = require("./lib/class"),
    _ = require("underscore"),
    Utils = require("./utils"),
    Entity = require("./entity"),
    Types = require("../../shared/js/gametypes");


module.exports = BulletFactory = {
    create: function(type){
        return new Bullet(type);
    }
};

var Bullet = Entity.extend({
    init: function(owner, speed, damage){
        this.kind = Types.Entities.BULLET;
        this.owner = owner;
        this.damage = damage || 1;
        this.speed = speed || 5;
        this.orientation = owner.orientation;
        this.setStartingPosition();
    },

    _getBaseState: function() {
        return [
            this.kind,
            this.owner,
            this.x,
            this.y,
            this.speed,
            this.damage
        ];
    },

    setStartingPosition: function(){
        if(this.orientation = Types.Orientations.UP){
            this.x = this.owner.x;
            this.y = this.owner.y + 0.5;
        }
        else if(this.orientation = Types.Orientations.DOWN){
            this.x = this.owner.x;
            this.y = this.owner.y - 0.5;
        }
        else if(this.orientation = Types.Orientations.LEFT){
            this.x = this.owner.x - 0.5;
            this.y = this.owner.y;
        }
        else if(this.orientation = Types.Orientations.RIGHT){
            this.x = this.owner.x + 0.5;
            this.y = this.owner.y;
        }s
    }
});
