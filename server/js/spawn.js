define(['model', 'utils'],
    function (Model, Utils) {

    var Spawn = Model.extend({
        init: function (id, team, x, y, orientation) {
            this.id = id;
            this.team = team;
            this.x = x;
            this.y = y;
            this.orientation = orientation;
        }
    });
    return Spawn
});