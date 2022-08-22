const misc = require("./misc.js");
const physics = require("./physics.js");

function updatePlayerPos(players, id, FPS, gridSize)
{
    if (!misc.isDefined(players))
        return;
    let accTimer = (1 / FPS) * 1000;
    let deAccTimer = (1 / FPS) * 1000;
    if (players[id].forwards && players.hasOwnProperty(id))
    {
        if (misc.now() > players[id].accelerationNextThink)
        {
            players[id].accelerationNextThink = misc.now() + accTimer;
            let runBonus = 1;
            if (players[id].isRunning)
                runBonus = players[id].runBonusSpeed;
            players[id].forwardsSpeed += players[id].forwardsAcceleration * runBonus;
            if (players[id].forwardsSpeed > players[id].forwardsMaxSpeed * runBonus)
                players[id].forwardsSpeed = players[id].forwardsMaxSpeed * runBonus;
        }
        players[id].momentumDir = physics.player.body[id].angle;
    } else {
        players[id].forwardsSpeed -= players[id].forwardsDeAcceleration;
        if (players[id].forwardsSpeed < 0)
            players[id].forwardsSpeed = 0;
    }

    if (players[id].backwards)
    {
        if (misc.now() > players[id].accelerationNextThink)
        {
            players[id].accelerationNextThink = misc.now() + accTimer;
            players[id].backwardsSpeed += players[id].backwardsAcceleration;
            if (players[id].backwardsSpeed > players[id].backwardsMaxSpeed)
                players[id].backwardsSpeed = players[id].backwardsMaxSpeed;
            players[id].momentumDir = misc.convRad(physics.player.body[id].angle + misc.toRad(180));
        }
    } else {
        players[id].backwardsSpeed -= players[id].backwardsDeAcceleration;
        if (players[id].backwardsSpeed < 0)
            players[id].backwardsSpeed = 0;
    }

    if (players[id].strafeLeft)
    {
        if (misc.now() > players[id].accelerationNextThink)
        {
            players[id].accelerationNextThink = misc.now() + accTimer;
            players[id].strafeLeftSpeed += players[id].strafeAcceleration;
            if (players[id].strafeLeftSpeed > players[id].strafeMaxSpeed)
                players[id].strafeLeftSpeed = players[id].strafeMaxSpeed;
            if (players[id].forwards)
            {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle + misc.toRad(45));
            } else if (players[id].backwards)
            {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle + misc.toRad(45) + misc.toRad(180));
            } else {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle + misc.toRad(90));
            }
        }
    } else {
        players[id].strafeLeftSpeed -= players[id].strafeDeAcceleration;
        if (players[id].strafeLeftSpeed < 0)
            players[id].strafeLeftSpeed = 0;
    }

    if (players[id].strafeRight)
    {
        if (misc.now() > players[id].accelerationNextThink)
        {
            players[id].accelerationNextThink = misc.now() + accTimer;
            players[id].strafeRightSpeed += players[id].strafeAcceleration;
            if (players[id].strafeRightSpeed > players[id].strafeMaxSpeed)
                players[id].strafeRightSpeed = players[id].strafeMaxSpeed;
            if (players[id].forwards)
            {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle - misc.toRad(45));
            } else if (players[id].backwards)
            {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle - misc.toRad(45) + misc.toRad(180));
            } else {
                players[id].momentumDir = misc.convRad(physics.player.body[id].angle - misc.toRad(90));
            }
        }
    } else {
        players[id].strafeRightSpeed -= players[id].strafeDeAcceleration;
        if (players[id].strafeRightSpeed < 0)
            players[id].strafeRightSpeed = 0;
    }
    players[id].currentSpeed = Math.max(players[id].forwardsSpeed, players[id].backwardsSpeed, players[id].strafeLeftSpeed, players[id].strafeRightSpeed);
    players[id].body.position = [physics.player.body[id].position[0], physics.player.body[id].position[1]];
    players[id].body.angle = physics.player.body[id].angle;
    players[id].chunkPos = misc.calcChunkPos(players[id].body.position, gridSize);
    physics.player.body[id].velocity = [Math.cos(players[id].momentumDir) * players[id].currentSpeed, Math.sin(players[id].momentumDir) * players[id].currentSpeed];
    players[id].body.velocity = physics.player.body[id].velocity;
}

function updatePlayersPos(players, FPS, gridSize, mapData)
{
    if (misc.isDefined(players))
    {
        for (let id in players)
        {
            updatePlayerPos(players, id, FPS, gridSize);
            let origin = {
                x: players[id].body.position[0],
                y: players[id].body.position[1],
            };
            let totalRays = 9;
            let fovScanPos = [];
            let angle = [];
            let playerAngle = players[id].body.angle;
            for (let m in mapData[id])
            {
                if (mapData[id][m].tile === "wall")
                {
                    let corner = [];
                    let pos = {x: mapData[id][m].chunkPosX, y: mapData[id][m].chunkPosY};
                    let cornerPos = misc.calcGlobalPos(pos, gridSize);
                    corner[0] = {
                        x: cornerPos.x - gridSize / 2,
                        y: cornerPos.y - gridSize / 2,
                    };
                    corner[1] = {
                        x: cornerPos.x + gridSize / 2,
                        y: cornerPos.y - gridSize / 2,
                    };
                    corner[2] = {
                        x: cornerPos.x - gridSize / 2,
                        y: cornerPos.y + gridSize / 2,
                    };
                    corner[3] = {
                        x: cornerPos.x + gridSize / 2,
                        y: cornerPos.y + gridSize / 2,
                    };
                    for (let c in corner)
                    {
                        let angle1 = misc.angle(origin, {x: corner[c].x - 0.1, y: corner[c].y});
                        let angle2 = misc.angle(origin, {x: corner[c].x + 0.1, y: corner[c].y});
                        angle.push(angle1);
                        angle.push(angle2);
                    }
                }
            }
            angle.sort((a, b) => {
                return a - b;
            });

            for (let a in angle)
            {
                let endPos = {
                    x: origin.x + Math.cos(angle[a]) * 99999999,
                    y: origin.y + Math.sin(angle[a]) * 99999999,
                };
                fovScanPos.push(physics.castFOVRay(origin, endPos));
            }

            players[id].fovScanPath = fovScanPos;


            /*
            for (let rays = 0; rays < totalRays; rays++)
            {
                let origin = {
                    x: players[id].body.position[0],
                    y: players[id].body.position[1],
                };
                let angle = misc.toRad((360 / totalRays) * rays);
                let endPos = {
                    x: origin.x + Math.cos(angle) * 999999,
                    y: origin.y + Math.sin(angle) * 999999,
                };
                let path = physics.castFOVRay(origin, endPos);
                fovScanPos.push(path);
                //fovScanPos.push(path.y);
            }*/
        }
    }
}


module.exports = {
    updatePlayerPos: updatePlayerPos,
    updatePlayersPos: updatePlayersPos,
};