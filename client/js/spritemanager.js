define(['sprite'], function(Sprite){
    var SpriteManager = {
        sprites: {},
        spriteNames: [],
        addResource: function(data){

            if(_.isArray(data)){
                this.spriteNames = this.spriteNames.concat(data);
            }else{
                this.spriteNames.push(data);
            }
            return this;
        },

        load: function(){

            _.map(this.spriteNames, this._loadSprite, this);
        },

        getSprite: function(name){
            var sprite = this.sprites[name];

            if(!sprite) {
                console.error(this.id + " : sprite is null", true);
                throw "Error";
            }

            return sprite;
        },

        _loadSprite: function (name) {
            this.sprites[name] = new Sprite(name, 3);
        }
    };

    return SpriteManager;
});