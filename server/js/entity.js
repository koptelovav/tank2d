var Backbone = require("backbone"),
    _ = require("underscore"),
    Log = require('log');

/**
 * Базовый класс для динамических объектов находящихся на карте
 */
module.exports = Entity = Backbone.Model.extend({
    _getBaseState: function() {
        return [
            parseInt(this.id),
            this.kind,
            this.x,
            this.y
        ];
    },

    getState: function() {
        return this._getBaseState();
    },

    spawn: function() {
        return new Messages.Spawn(this);
    },

    despawn: function() {
        return new Messages.Despawn(this.id);
    },

    getChunk: function(){
        return [
            [this.get('x'), this.get('y')  ],[this.get('x')+1, this.get('y')  ],
            [this.get('x'), this.get('y')+1],[this.get('x')+1, this.get('y')+1]
        ];
    }
});