import { Coop } from "../../func/coop";
import { Versus } from "../../func/versus";
import { ConnectionRepository } from "./ConnectionRepository";

export class GameRepository {
    constructor (
        private connections:ConnectionRepository,
        private games = new Map<string, Coop|Versus>
    ) {}

    create(id:string, versus:boolean):Coop|Versus {
        var already:Coop|Versus|undefined = this.find(id)
        if (typeof(already) === "undefined") {
            var game = versus ? new Versus() : new Coop() 
            this.games.set(id, game)
            return game
        } else {
            return already
        }
    }

    createVersus(id:string,leader:string):Versus {
        var grid = new Versus(leader)
        this.games.set(id,grid)
        return grid
    }

    find(id:string):Coop|Versus|undefined {
        return this.games.get(id)
    }

    clean(id:string){
        setTimeout(() => {
            const game = this.games.get(id)
            if (game && game.getJoueurs().filter(p => this.connections.has(p.id,id)).length == 0) {
                this.games.delete(id)
            }
        }, 120000);
    }
}