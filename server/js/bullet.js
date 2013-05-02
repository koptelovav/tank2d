
var Utils = require("./utils"),
    Entity = require("./entity"),
    Types = require("../../shared/js/gametypes");

return BulletFactory = {
    create: function(owner, speed, damage){
        return new Bullet(owner, speed, damage);
    }
};

var Bullet = Entity.extend({
    /**
     * Функция конструктор. Инициализация объекта
     * @param {Tank} owner Владелец пули
     * @param {Number} speed скорасть пули
     * @param {Number} damage урон от пули
     */
    init: function(owner, speed, damage){
        this.kind = Types.Entities.BULLET;
        this.owner = owner;
        this.damage = damage || 1;
        this.speed = speed || 5;
        this.orientation = owner.orientation;
        this.setStartingPosition();
    },

    /**
     * Получить состояние объекта
     * @returns {Array} массив с параметрами
     * @private
     */
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

    /**
     * Устновить начальную позицю пули
     */
    setStartingPosition: function(){
        if(this.orientation === Types.Orientations.UP){
            this.x = this.owner.x;
            this.y = this.owner.y + 1;
        }
        else if(this.orientation === Types.Orientations.DOWN){
            this.x = this.owner.x;
            this.y = this.owner.y - 1;
        }
        else if(this.orientation === Types.Orientations.LEFT){
            this.x = this.owner.x - 1;
            this.y = this.owner.y;
        }
        else if(this.orientation === Types.Orientations.RIGHT){
            this.x = this.owner.x + 1;
            this.y = this.owner.y;
        }
    }
});
