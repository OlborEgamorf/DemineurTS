import { Demineur } from "./demineur"
import { Game } from "./game"

export class Coop extends Game {
    private grid:Demineur|undefined

    reset():void {
        super.reset()
        this.grid?.reset()
    }

    createGrid(xstart:number,ystart:number):void {
        if (!this.play) {
            if (!this.grid) {               
                this.grid = new Demineur(this.long, this.larg, this.bombs)
            } else {
                this.grid.reconstruct(this.long, this.larg, this.bombs)
            }
            
            this.grid.createGrid([[xstart, ystart]])
            this.grid.defVisible(xstart, ystart, [])

            this.play = true
            this.blank = false
            this.timer = Date.now()
        } 
    }

    isDone():boolean {
        if (this.grid) {
            let state = this.grid?.isDone()
            if (state) {
                this.play = false
            }
            return state
        }
        return false
    }

    isLose():boolean {
        if (this.grid) {
            let state = this.grid.isLose()
            if (state) {
                this.play = false
            }
            return state
        }
        return false
    }

    getGrid():Demineur|undefined {
        return this.grid
    }
}