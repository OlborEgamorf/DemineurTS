export type Joueur = {
    id:string,
    nom:string,
    color:string
}

export type Entry = {
    x:number,
    y:number,
    around:number,
    isbomb:boolean
}

export interface FuncCase {
    (c:Case):void
}

export class Case {
    constructor (public bomb:boolean, public flag:boolean, public visible:boolean, public around:number, public start:boolean) {}
}

export class Demineur {
    public tab:Case[][] = []
    public totalflags:number = 0
    public rightflags:number = 0
    public play:boolean = false
    public blank:boolean = false
    public joueurs:Joueur[] = []
    public long:number = 15
    public larg:number = 15
    public bombs:number = 40
    public leader:string = ""
    public timer:number = 0

    constructor () {
        
    }

    reset():void{
        this.tab = []
        this.totalflags = 0
        this.rightflags = 0
        this.play = false
    }

    getGrid():Number[][] {
        var visible:Number[][] = []
        for (var i=0;i<this.long;i++) {
            visible.push([])
            for (var j=0;j<this.larg;j++) {
                if (this.tab[i][j].visible) {
                    visible[i].push(this.tab[i][j].around)
                } else if (this.tab[i][j].flag) {
                    visible[i].push(-1)
                } else {
                    visible[i].push(-2)
                }
            }
        }
        return visible
    }

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
        if (this.play == false) {
            this.long=long
            this.larg=larg
            this.bombs=bombs
        }
    }

    around(xstart:number, ystart:number, func:FuncCase):void {
        for (let x=xstart-1;x<xstart+2;x++) {
            for (let y=ystart-1;y<ystart+2;y++) {
                if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                    func(this.tab[x][y])
                }
            }
        }
    }

    createGrid(xstart:number,ystart:number):Demineur {
        if (this.play == true) {
            return this
        } 
        for (let i=0;i<this.long;i++) {
            this.tab.push([])
            for (let j=0;j<this.larg;j++) {
                var newCase = new Case(false,false,false,0,false)
                this.tab[i].push(newCase)
            }
        }

        this.around(xstart, ystart, (c:Case) => {c.start = true})
    
        for (let k=0;k<this.bombs;k++) {
            var newX:number = Math.floor(Math.random()*this.long)
            var newY:number = Math.floor(Math.random()*this.larg)
            if (this.tab[newX][newY].bomb || this.tab[newX][newY].start) {
                k--
            } else {
                this.tab[newX][newY].bomb = true
                this.around(newX, newY, (c:Case) => {c.around++})
            }
        }

        // this.solve(xstart, ystart)
        
        this.defVisible(xstart,ystart,[])
        this.play = true
        this.blank = false
        this.timer = Date.now()
        return this 
    }

    setFlag(xcase:number,ycase:number):boolean{
        if (this.tab[xcase][ycase].flag) {
            this.tab[xcase][ycase].flag = false
            this.totalflags --
            if (this.tab[xcase][ycase].bomb == true) {
                this.rightflags --
            }
            return false
        } else {
            this.tab[xcase][ycase].flag = true
            this.totalflags ++
            if (this.tab[xcase][ycase].bomb == true) {
                this.rightflags ++
            }
            return true
        }
    }

    clearCase(xcase:number,ycase:number):Entry[] {
        if (this.tab[xcase][ycase].flag == true) {
            return []
        } else if (this.tab[xcase][ycase].bomb == true) {
            this.tab[xcase][ycase].visible = true
            this.play = false
            return [{x:xcase, y:ycase, around:8, isbomb:true}]
        } else {
            return this.defVisible(xcase,ycase,[])
        }
    }

    clearAroundCase(xcase:number,ycase:number):Entry[] {
        var nbFlags:number = 0
        var listeAround:[number,number,Case][] = []
    
        for (var checkLong=xcase-1;checkLong<xcase+2;checkLong++) {
            for (var checkLarg=ycase-1;checkLarg<ycase+2;checkLarg++) {
                if (checkLong>=0 && checkLarg>=0 && checkLong < this.long && checkLarg < this.larg) {
                    listeAround.push([checkLong,checkLarg,this.tab[checkLong][checkLarg]])
                    if (this.tab[checkLong][checkLarg].flag == true) {
                        nbFlags ++
                    }
                }
            }
        } 
    
        if (nbFlags == this.tab[xcase][ycase].around) {
            console.log("oui");
            
            var i:number = 0
            var liste:Entry[] = []
            for (var i=0;i<listeAround.length;i++) {
                if (listeAround[i][2].bomb == true && listeAround[i][2].flag == true) {} else {
                    liste = this.defVisible(listeAround[i][0],listeAround[i][1],liste)
                    console.log("12",liste);
                }
            }
            return liste
        } else {
            return []
        }
    }

    defVisible(xcase:number,ycase:number,liste:[number,number,number,boolean][]):[number,number,number,boolean][] {
        if (this.tab[xcase][ycase].visible == false) {
            this.tab[xcase][ycase].visible = true
            liste.push({x:xcase, y:ycase, around:this.tab[xcase][ycase].around, isbomb:this.tab[xcase][ycase].bomb})
            if (this.tab[xcase][ycase].around == 0) {
                for (let x=xcase-1;x<xcase+2;x++) {
                    for (let y=ycase-1;y<ycase+2;y++) {
                        if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                            // liste.push({x:x, y:y, around:this.tab[x][y].around, isbomb:this.tab[x][y].bomb})
                            if (this.tab[x][y].bomb == true) {
                                this.play = false
                            }
                            liste=this.defVisible(x,y,liste)
                        }
                    }
                } 
            }
        }
        return liste
    }

    isDone():boolean{
        var sum:number = 0
        for (var ligne of this.tab) {
            for (var caseG of ligne) {
                if (caseG.visible == false) {
                    sum+=1
                }
            }
        }
        if (sum == this.bombs) {
            this.play = false
            return true
        } else {
            return false
        }
    }

    isLose():boolean{
        var lose:boolean=false
        for (var ligne of this.tab) {
            for (var caseG of ligne) {
                if (caseG.visible == true && caseG.bomb == true) {
                    lose=true
                }
            }
        }
        return lose
    }
}
