import { Demineur } from "../../func/demineur";
import { Versus } from "../../func/versus";
import { ConnectionRepository } from "./ConnectionRepository";

export class GameRepository {
    constructor (
        private connections:ConnectionRepository,
        private games = new Map<string, Demineur|Versus>
    ) {}

    create(id:string,leader:string):Demineur {
        var grid = new Demineur(leader)
        this.games.set(id,grid)
        return grid
    }

    createVersus(id:string,leader:string):Versus {
        var grid = new Versus(leader)
        this.games.set(id,grid)
        return grid
    }

    find(id:string):Demineur|undefined|Versus {
        return this.games.get(id)
    }

    clean(id:string){
        const game = this.games.get(id)
        console.log(game?.joueurs.filter(p => this.connections.has(p.id,id)).length)
        if (game && game.joueurs.filter(p => this.connections.has(p.id,id)).length == 0) {
            this.games.delete(id)
        }
    }
}