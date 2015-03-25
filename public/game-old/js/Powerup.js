define(["Sprite"],function(core) {

    const POWERUPS = ["CD"];

    Powerup = Sprite.extend({
        defaults: {
            x: 0,
            y: 0,
            type: POWERUPS[0]
        }
    });

});
