
var Model = require("./model"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

module.exports = Spawn = Model.extend({
    init: function(id, team, x, y, orientation){
        this.id = id;
        this.team = team;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }
});
