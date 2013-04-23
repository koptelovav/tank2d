
var cls = require("./lib/class"),
    _ = require("underscore"),
    Utils = require("./utils"),
    Types = require("../../client/shared/js/gametypes");

module.exports = Spawn = cls.Class.extend({
    init: function(id, team, x, y, orientation){
        this.id = id;
        this.team = team;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }
});
