import { Game } from './Game';

export class EventBridge {
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    public async processStream(events: any[]) {
        for (const event of events) {
            console.log(`[EventBridge] Processing: ${event.type}`);
            await this.mapEventToAnimation(event);
        }
    }

    private async mapEventToAnimation(event: { type: string; payload: any }) {
        const { type, payload } = event;

        switch (type) {
            case 'SPIN_START':
                await this.game.onSpinStart();
                break;
            case 'GRID_GENERATED':
                await this.game.onReelsStop(payload.grid);
                break;
            case 'WIN_EVALUATED':
                await this.game.onWinFound(payload.winningPositions, payload.accumulatedPayout);
                break;
            case 'MULTIPLIERS_COLLECTED':
                await this.game.onMultiplierAdded(payload.multiplierPositions, payload.accumulatedMultiplier);
                break;
            case 'CASCADE_APPLIED':
                await this.game.onCascade(payload.grid);
                break;
            case 'SPIN_SETTLEMENT':
                await this.game.onSettlement(payload.amount);
                break;
            case 'FREE_SPINS_TRIGGERED':
                await this.game.onFreeSpinsTriggered(payload.amount);
                break;
            case 'FREE_SPINS_STARTED':
                await this.game.onFreeSpinsStarted(payload);
                break;
            case 'FREE_SPINS_ENDED':
                await this.game.onFreeSpinsEnded(payload);
                break;
            default:
                break;
        }
    }
}
