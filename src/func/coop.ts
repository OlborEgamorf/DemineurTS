import { Demineur } from "./demineur"
import { Game, Infos, Joueur } from "./game"

export class Coop extends Game {
    private grid:Demineur

    reset():void {
        this.play = false
        this.grid!.reset()
    }

    createGrid(xstart:number,ystart:number):void {
        if (!this.play) {
            this.grid = new Demineur(this.long, this.larg, this.bombs)
            this.grid.createGrid([[xstart, ystart]])
            this.grid.defVisible(xstart, ystart, [])

            this.play = true
            this.blank = false
            this.timer = Date.now()
        } 
    }

    isDone():boolean {
        let state = this.grid.isDone()
        if (state) {
            this.play = false
        }
        return state
    }

    isLose():boolean {
        let state = this.grid.isLose()
        if (state) {
            this.play = false
        }
        return state
    }

    getGrid():Demineur {
        return this.grid
    }
}