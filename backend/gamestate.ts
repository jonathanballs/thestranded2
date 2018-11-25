// Game state data strucutres

export class GameRoom {
    name: string;
    seed: number;
    players: { [id: string]: Player } = {}; // Lookup players by id
    bullets: Bullet[] = [];
    enemies: { [id: string]: Enemy } = {};

    // Add a new player to the game
    addPlayer(player: Player, spec:boolean = false) {
        if(spec){
            return 
        }
        // Find the first available id
        const uNameAlpha = player.name.replace(/\W/g, '')
        player.data.id = this.getAvailableId(uNameAlpha)
        this.players[player.data.id] = player;
        // TODO: Set their position etc.
    }

    addEnemy(enemy: Enemy) {
        enemy.data.id = this.getAvailableId(enemy.type);
        this.enemies[enemy.data.id] = enemy;
    }

    getAvailableId(prefix: string): string {
        let i = 0;
        let id;
        while (true) {
            id = `${prefix}-${i.toString()}`;
            if (this.players[id] === undefined && this.enemies[id] === undefined) {
                break;
            }
            i++;
        }
        return id;
    }

    constructor(roomName: string) {
        this.name = roomName;
        // 100M possible seeds
        this.seed = Math.floor(Math.random() * 100000000);
    }
}

// Generic base class for "living things"; Zombies, players
// and any other autonomous entity will subclass this.
export class LivingEntity {
    constructor(type: string) {
        this.type = type;
    }

    distanceFrom(entity: LivingEntity): number {
        return Math.sqrt(Math.pow(entity.data.x - this.data.x, 2)
            + Math.pow(entity.data.y - this.data.y, 2));
    }

    type: string; // player/zombie etc.
    data: { 
        id: string,
        x: number,
        y: number,
        rot: number,
        velX: number, 
        velY: number, 
        timestampUpdated: number, 
    } = { id: '', x: 0, y: 0, rot: 0, velX: 0, velY: 0, timestampUpdated: Date.now()}
}

// Human controlled player
export class Player extends LivingEntity {
    name: string;
    characterSpriteId: string;
    active: boolean = true;

    constructor(name: string, characterSpriteId: string) {
        super('player');
        this.name = name;
        // TODO: Check if a valid sprite id
        this.characterSpriteId = characterSpriteId || 'default';
    }
}

export class Bullet extends LivingEntity {
}

export class Enemy extends LivingEntity {
}

export class Zombie extends Enemy {
    constructor() {
        super('zombie');
        this.data.timestampUpdated = Date.now();
        this.data.x = Math.floor(Math.random() * 100) - 50
        this.data.y = Math.floor(Math.random() * 100) - 50
    }

    nearestPlayer(players: {[pId: string]: Player }) {
        let nearest: Player = null;
        Object.keys(players).forEach(pId => {
            const p = players[pId];
            if (!nearest) {
                nearest = p;
            }

            let nearestDist = Math.sqrt(Math.pow(nearest.data.x - this.data.x, 2)
                + Math.pow(nearest.data.y - this.data.y, 2));
            let pDist = Math.sqrt(Math.pow(p.data.x - this.data.x, 2)
                + Math.pow(p.data.y - this.data.y, 2));
            if (pDist < nearestDist) {
                nearest = p;
            }
        });

        return nearest;
    }

    update(state: GameRoom) {
        if(Object.keys(state.players).length == 0) {
            return
        }

        const timeDelta = Date.now() - this.data.timestampUpdated;
        if (timeDelta < 100) {
            return;
        }

        this.data.timestampUpdated = Date.now();
        const nearestPlayer = this.nearestPlayer(state.players);
        if (!nearestPlayer) {
            return;
        }

        var diff_x = nearestPlayer.data.x - this.data.x;
        var diff_y = nearestPlayer.data.y - this.data.y;
        var total_dist = Math.sqrt(diff_y * diff_y + diff_x * diff_x);
        var dist_div = total_dist / ((1.5*timeDelta) / 1000);

        // console.log({diff_x, diff_y, total_dist, timeDelta, dist_div});
        
        var delta_x = diff_x / dist_div;
        var delta_y = diff_y / dist_div;

        this.data.velX = (delta_x / timeDelta) * 1000;
        this.data.velY = (delta_y / timeDelta) * 1000;

        // Update the rotation and position of the Zombie.
        this.data.rot = Math.atan2(diff_y, diff_x);
        this.data.x = this.data.x + delta_x;
        this.data.y = this.data.y + delta_y;
    }
}
