import { Joueur, Demineur, Case } from "./demineur"
import { cloneDeep } from "lodash"

export class Versus {
    public grilles:{[key:string]:Demineur} = {}
    public ready:{[key:string]:boolean} = {}
    public start:{[key:string]:[number,number]} = {}
    public joueurs:Joueur[] = []
    public long:number = 15
    public larg:number = 15
    public bombs:number = 40
    public leader:string = ""
    public play:boolean = false
    public blank:boolean = false

    constructor (leader:string) {
        this.setLeader(leader)
    }

    reset(){
        for (var joueur of this.joueurs) {
            this.grilles[joueur.id].reset()
            this.ready[joueur.id] = false
            this.start[joueur.id] = [-1,-1]
        }
        this.play = false
    }

    addStart(id:string,xstart:number,ystart:number) {
        if (this.start[id].every((value, index) => value === [-1,-1][index])) {
            this.start[id]=[xstart,ystart]
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

    setReady(id:string){
        if (this.ready[id] == false) {
            this.ready[id] = true
        } else {
            this.ready[id] = false
        }
    }

    isReady():boolean{
        var ready = true
        for (var joueur of this.joueurs) {
            if (this.ready[joueur.id] == false) {
                ready = false
            }
        }
        return ready
    }

    join(id:string,nom:string,color:string):void{
        this.joueurs.push({id:id,nom:nom,color:color})
        this.grilles[id]=new Demineur(id)
        this.ready[id]=false
        this.start[id]=[-1,-1]
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
        for (var joueur of this.joueurs) {
            this.grilles[joueur.id].setValues(long,larg,bombs)
        }
        this.long=long
        this.larg=larg
        this.bombs=bombs
    }

    getStill():Joueur[]{
        var still:Joueur[] = []
        for (var joueur of this.joueurs) {
            if (this.grilles[joueur.id].play == true) {
                still.push(joueur)
            }
        }
        return still
    }

    getFirst():Joueur{
        var first:Joueur = this.joueurs[0]
        var flags:number = this.grilles[this.joueurs[0].id].rightflags
        for (var joueur of this.joueurs) { 
            if (flags == this.grilles[joueur.id].rightflags && this.grilles[joueur.id].play == true) {
                first = joueur
            } else if (flags < this.grilles[joueur.id].rightflags) {
                first = joueur
                flags = this.grilles[joueur.id].rightflags
            }
        }
        return first
    }

    createGrid():void {
        if (this.play == true) {
            return
        } 
        var tab:Case[][] = []
        for (let i=0;i<this.long;i++) {
            tab.push([])
            for (let j=0;j<this.larg;j++) {
                var newCase = new Case(false,false,false,0,false)
                tab[i].push(newCase)
            }
        }
        
        for (var joueur of this.joueurs) {
            var xstart:number = this.start[joueur.id][0]
            var ystart:number = this.start[joueur.id][1]
            for (let x=xstart-1;x<xstart+2;x++) {
                for (let y=ystart-1;y<ystart+2;y++) {
                    if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                        tab[x][y].start = true
                    }
                }
            }
        }
        
    
        for (let k=0;k<this.bombs;k++) {
            var newX:number = Math.floor(Math.random()*this.long)
            var newY:number = Math.floor(Math.random()*this.larg)
            if (tab[newX][newY].bomb || tab[newX][newY].start) {
                k--
            } else {
                tab[newX][newY].bomb = true
                for (let x=newX-1;x<newX+2;x++) {
                    for (let y=newY-1;y<newY+2;y++) {
                        if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                            tab[x][y].around ++
                        }
                    }
                }            
            }
        }
        
        for (var joueur of this.joueurs) {
            this.grilles[joueur.id].tab=cloneDeep(tab)
            this.grilles[joueur.id].defVisible(this.start[joueur.id][0],this.start[joueur.id][1],[])
            this.grilles[joueur.id].play = true
            this.grilles[joueur.id].blank = false
        }

        this.play = true
        this.blank = false
    }
}