import { Game, Joueur } from "./game"
import { Demineur, Case } from "./demineur"
import { cloneDeep } from "lodash"

export class Versus extends Game {
    private grilles:{[key:string]:Demineur} = {}
    private start:{[key:string]:[number,number]} = {}
    private playing:{[key:string]:boolean} = {}
    private count:number = 0

    reset(){
        super.reset()
        this.start = {}
        for (var joueur of this.joueurs) {
            this.grilles[joueur.id]?.reset()
            this.start[joueur.id] = [-1, -1]
        }
    }

    join(id:string,nom:string,color:string):boolean{
        if (!super.join(id, nom, color)) {
            return false
        }
        this.start[id] = [-1,-1]
        return true
    }

    addStart(id:string,xstart:number,ystart:number) {
        if (this.start[id].every((value, index) => value === [-1,-1][index])) {
            this.start[id] = [xstart, ystart]
        }
    }

    isStart():boolean{
        var start = true
        for (var joueur of this.joueurs) {
            if (this.start[joueur.id].every((value, index) => value === [-1,-1][index])) {
                start = false
            }
        }
        return start
    }

    isWin(playerId:string):boolean {
        let state = this.grilles[playerId].isDone() || (this.count == 1 && playerId == this.getWinner().id)
        if (state) {
            this.play = false
        }
        return state
    }

    isLose(playerId:string):boolean {
        let state = this.grilles[playerId].isLose()
        if (state) {
            this.playing[playerId] = false
            this.count --
        }
        return state
    }

    getWinner():Joueur {
        let first = this.joueurs[0]
        for (var joueur of this.joueurs) { 
            if (this.grilles[joueur.id].getNotVisible() < this.grilles[first.id].getNotVisible()) {
                first = joueur
            }
        }
        return first
    }

    createGrid():void {
        if (this.play) {
            return
        } 

        let start:[number, number][] = []
        for (var joueur of this.joueurs) {
            start.push(this.start[joueur.id])
        }

        let grille = new Demineur(this.long, this.larg, this.bombs)
        let grid = grille.createGrid(start)

        for (var joueur of this.joueurs) {
            if (this.grilles[joueur.id]) {
                this.grilles[joueur.id].rebuild(cloneDeep(grid), this.long, this.larg, this.bombs)
            } else {
                this.grilles[joueur.id] = cloneDeep(grille)
            }
            this.grilles[joueur.id].defVisible(this.start[joueur.id][0], this.start[joueur.id][1], [])
            this.playing[joueur.id] = true
        }

        this.play = true
        this.blank = false
        this.timer = Date.now()
        this.count = this.joueurs.length
    }

    getGridById(id:string):Demineur|undefined {
        return this.grilles[id]
    }

    getCount():number {
        return this.count
    }

    getPlaying(playerId:string):boolean {
        return this.playing[playerId]
    }

}