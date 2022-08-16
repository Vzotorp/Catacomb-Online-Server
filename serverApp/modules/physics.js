let p2 = require('p2');
const misc = require("./misc.js");

let world = new p2.World({
    gravity : [0,0],
    frictionGravity: 10,
    //islandSplit : true,
});

//world.sleepMode = p2.World.ISLAND_SLEEPING;
world.solver.iterations = 20;
world.solver.tolerance = 0.1;
//world.setGlobalStiffness(1000000000000);

const FLAG = {
    WALL: 1,
    PLAYER: 2,
    BULLET: 4,
    BULLET_MOVEMENT: 8,
    ZOMBIE: 16,
    AMMO_CLIP: 32,
    VISION_GOGGLES: 64,
};

let physics = {
    player: {
        body: {},
        shape: {},
    },
    wall: {
        body: {},
        shape: {},
    }
};



function newPlayerBody(playerID, pos, width, height)
{
    physics.player.body[playerID] = new p2.Body({
        mass: 100,
        position: [pos.x, pos.y],
        angle: misc.toRad(misc.rng(0, 360)),
    });
    physics.player.shape[playerID] = new p2.Box({
        width: width,
        height: height,
    });
    physics.player.shape[playerID].anchorRatio = {x: 0.237983, y: 0.547403};
    physics.player.shape[playerID].collisionGroup = FLAG.PLAYER;
    physics.player.shape[playerID].collisionMask = FLAG.WALL | FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;
    physics.player.body[playerID].object = "player";
    physics.player.body[playerID].objectID = playerID;
    physics.player.body[playerID].damping = 0;
    physics.player.body[playerID].centerMass = {x: (width / 2) - (width * physics.player.shape[playerID].anchorRatio.x), y: (height / 2) - (height * physics.player.shape[playerID].anchorRatio.y)};
    physics.player.body[playerID].addShape(physics.player.shape[playerID], [physics.player.body[playerID].centerMass.x, physics.player.body[playerID].centerMass.y], misc.toRad(0));
    world.addBody(physics.player.body[playerID]);
}

function newWallBody(id, pos, width, height)
{
    if (!misc.isDefined(physics.wall.body[id]))
    {
        physics.wall.body[id] = new p2.Body({
            position: [pos.x, pos.y],
            angle: 0,
            type: p2.Body.STATIC,
        });
        physics.wall.shape[id] = new p2.Box({
            width: width,
            height: height,
        });
        physics.wall.shape[id].anchorRatio = {x: 0.5, y: 0.5};
        physics.wall.shape[id].collisionGroup = FLAG.WALL;
        physics.wall.shape[id].collisionMask = FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;
        physics.wall.body[id].object = "wall";
        physics.wall.body[id].objectID = id;
        physics.wall.body[id].damping = 0;
        physics.wall.body[id].centerMass = {x: (width / 2) - (width * physics.wall.shape[id].anchorRatio.x), y: (height / 2) - (height * physics.wall.shape[id].anchorRatio.y)};
        physics.wall.body[id].addShape(physics.wall.shape[id], [physics.wall.body[id].centerMass.x, physics.wall.body[id].centerMass.y], misc.toRad(0));
        world.addBody(physics.wall.body[id]);
    }
}

module.exports = {
    world: world,
    FLAG: FLAG,
    playerBody: physics.player.body,
    wallBody: physics.wall.body,
    newPlayerBody: newPlayerBody,
    newWallBody: newWallBody,
};