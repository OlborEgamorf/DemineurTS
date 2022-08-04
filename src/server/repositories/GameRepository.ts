import { Demineur } from "../../func/demineur";
import { ConnectionRepository } from "./ConnectionRepository";

export class GameRepository {
    constructor (
        private connections:ConnectionRepository,
        private games = new Map<string, Demineur>
    ) {}

    create(id:string):Demineur {
        var grid = new Demineur()
        this.games.set(id,grid)
        return grid
    }

    find(id:string):Demineur|undefined {
        return this.games.get(id)
    }

    clean(id:string){
        const game = this.games.get(id)
        if (game && game.joueurs.filter(p => this.connections.has(p.id,id)).length == 0) {
            this.games.delete(id)
        }
    }


}