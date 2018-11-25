// Game state data strucutres

export class GameRoom {
    name: string;
    seed: number;
    players: { [id: string]: Player } = {}; // Lookup players by id
    bullets: Bullet[] = [];
    enemies: { [id: string]: Enemy } = {};

    // Add a new player to the game
    addPlayer(player: Player) {
        // Find the first available id
        const uNameAlpha = player.name.replace(/\W/g, '')
        player.id = this.getAvailableId(uNameAlpha)
        this.players[player.id] = player;
        // TODO: Set their position etc.
    }

    addEnemy(enemy: Enemy) {
        enemy.id = this.getAvailableId(enemy.type);
        this.enemies[enemy.id] = enemy;
    }

    getAvailableId(prefix: string): string {
        let i = 0;
        let id;
        while (true) {
            id = `${prefix}-${i.toString()}`;
            if (this.players[id] === undefined) {
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

    id: string;
    type: string; // player/zombie etc.
    data: { x: number, y: number, rot: number;
        velX: number; velY: number; }
        = { x: 0, y: 0, rot: 0, velX: 0, velY: 0, }

    timestampUpdated: Date;
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
    }
}
