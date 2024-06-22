import { Demineur } from "./demineur"

export type Joueur = {
    id:string,
    nom:string,
    color:string
}

export type Infos = {
    long:number,
    larg:number,
    bombs:number,
    leader:string
    flags:number,
    timer:number
}

export abstract class Game {
    protected joueurs:Joueur[] = []
    protected leader:string = ""
    protected timer:number = 0
    protected play:boolean = false
    protected blank:boolean = false
    protected long:number = 15
    protected larg:number = 15
    protected bombs:number = 40

    join(id:string,nom:string,color:string):void{
        this.joueurs.push({id:id,nom:nom,color:color})
        if (this.joueurs.length == 1) {           
            this.setLeader(id)
        }
    }

    leave(id:string):void {
        this.joueurs = this.joueurs.filter((around,i,joueur) => {return around.id != id})
        if (id == this.leader && this.joueurs.length != 0) {
            this.setLeader(this.joueurs[0].id)
        }
    }

    setLeader(id:string):void {
        this.leader = id
    }

    setValues(long:number,larg:number,bombs:number):void{
        this.long=long
        this.larg=larg
        this.bombs=bombs
    }

    setBlank(blank:boolean) {
        this.blank = blank
    }

    getJoueurs():Joueur[] {
        return this.joueurs
    }
    isPlay():boolean {
        return this.play
    }
    isBlank():boolean {
        return this.blank
    }
    getLeader():string {
        return this.leader
    }
    getAllInfos(grid:Demineur|undefined):Infos {
        return {long:this.long, larg:this.larg, bombs:this.bombs, leader:this.leader, flags:grid ? grid.getTotalFlags() : 0, timer:this.timer}
    }
    
}