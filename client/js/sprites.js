
define(['lib/text!../sprites/armoredwall.json',
        'lib/text!../sprites/ice.json',
        'lib/text!../sprites/trees.json',
        'lib/text!../sprites/wall.json',
        'lib/text!../sprites/water.json',
        'lib/text!../sprites/tank.json',
        'lib/text!../sprites/bullet.json',
        'lib/text!../sprites/base.json'], function() {
    
    var sprites = {};
    
    _.each(arguments, function(spriteJson) {
        var sprite = JSON.parse(spriteJson);
        
        sprites[sprite.id] = sprite;
    });
    
    return sprites;
});
