
define(['text!../sprites/armoredwall.json',
        'text!../sprites/ice.json',
        'text!../sprites/trees.json',
        'text!../sprites/wall.json',
        'text!../sprites/water.json',
        'text!../sprites/tank.json'], function() {
    
    var sprites = {};
    
    _.each(arguments, function(spriteJson) {
        var sprite = JSON.parse(spriteJson);
        
        sprites[sprite.id] = sprite;
    });
    
    return sprites;
});
