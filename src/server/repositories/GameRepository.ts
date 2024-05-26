import { Demineur } from "../../func/demineur";
import { Versus } from "../../func/versus";
import { ConnectionRepository } from "./ConnectionRepository";

export class GameRepository {
    constructor (
        private connections:ConnectionRepository,
        private games = new Map<string, Demineur|Versus>
    ) {}

    create(id:string):Demineur|Versus {
        var already:Demineur|undefined|Versus = this.find(id)
        if (typeof(already) === "undefined") {
            var grid = new Demineur()
            this.games.set(id,grid)
            return grid
        } else {
            return already
        }
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
        setTimeout(() => {
            const game = this.games.get(id)
            if (game && game.joueurs.filter(p => this.connections.has(p.id,id)).length == 0) {
                this.games.delete(id)
            }
        }, 120000);
    }
}