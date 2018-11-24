// Game state data strucutres

export class GameRoom {
    name: string;
    players: { [id: string]: Player } = {}; // Lookup players by id
    seed: number;

    // Add a new player to the game
    addPlayer(player: Player) {
        // Find the first available id
        const uNameAlpha = player.name.replace(/\W/g, '')
        let i = 0;
        while (this.players[`player-${uNameAlpha}-${i.toString()}`] !== undefined) {
            i++;
        }

        player.id = `player-${uNameAlpha}-${i.toString()}`;
        this.players[player.id] = player;

        // TODO: Set their position etc.
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
    id: string;
    type: string; // player/zombie etc.

    constructor(type: string) {
        this.type = type;
    }

    pos: {
        x: number,
        y: number,
    }
    rotation: number;
    currentVelocity: number;
    maxVelocity: number;
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
