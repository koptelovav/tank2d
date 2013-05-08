
define(['jquery', '../../shared/js/model', 'animation', 'sprites'], function($, Model, Animation, sprites) {

    var Sprite = Model.extend({
        init: function(name) {
        	this.name = name;
        	this.isLoaded = false;
        	this.offsetX = 0;
        	this.offsetY = 0;
            this.loadJSON(sprites[name]);
        },

        loadJSON: function(data) {
    		this.id = data.id;
    		this.filepath = "images/" + this.id + ".png";
    		this.animationData = data.animations;
    		this.width = data.width;
    		this.height = data.height;
    		this.offsetX = (data.offset_x !== undefined) ? data.offset_x : -16;
            this.offsetY = (data.offset_y !== undefined) ? data.offset_y : -16;

    		this.load();
    	},

        load: function() {
        	var self = this;

        	this.image = new Image();
        	this.image.src = this.filepath;

        	this.image.onload = function() {
        		self.isLoaded = true;
        	};
        },

        createAnimations: function() {
            var animations = {};

    	    for(var name in this.animationData) {
    	        var a = this.animationData[name];
    	        animations[name] = new Animation(name, a.length, a.row, this.width, this.height);
    	    }

    	    return animations;
    	}
    });

    return Sprite;
});