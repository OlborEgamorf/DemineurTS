export type Joueur = {
    id:string,
    nom:string,
    color:string
}

class Case {
    constructor (public bomb:boolean, public flag:boolean, public visible:boolean, public around:number, public start:boolean) {}
}

export class Demineur {
    public tab:Case[][] = []
    public rightflags:number = 0
    public totalflags:number = 0
    public play:boolean = false
    public joueurs:Joueur[] = []
    public long:number = 0
    public larg:number = 0
    public bombs:number = 0

    reset(){
        this.tab = []
        this.rightflags = 0
        this.totalflags = 0
        this.play = false
        this.long = 0
        this.larg = 0
        this.bombs = 0 
    }

    getVisible():Boolean[][] {
        var visible:Boolean[][] = []
        for (var i=0;i<this.long;i++) {
            visible.push([])
            for (var j=0;j<this.larg;j++) {
                visible[i].push(this.tab[i][j].visible)
            }
        }
        return visible
    }

    getAround():Number[][] {
        var around:Number[][] = []
        for (var i=0;i<this.long;i++) {
            around.push([])
            for (var j=0;j<this.larg;j++) {
                around[i].push(this.tab[i][j].around)
            }
        }
        return around
    }

    getFlags():Boolean[][] {
        var flags:Boolean[][] = []
        for (var i=0;i<this.long;i++) {
            flags.push([])
            for (var j=0;j<this.larg;j++) {
                flags[i].push(this.tab[i][j].flag)
            }
        }
        return flags
    }

    join(id:string,nom:string,color:string){
        this.joueurs.push({id:id,nom:nom,color:color})
    }

    leave(id:string) {
        this.joueurs = this.joueurs.filter((val,i,joueur) => {val.id != id})
    }
    

    setValues(long:number,larg:number,bombs:number){
        if (this.long == 0 && this.larg == 0 && this.bombs == 0) {
            this.long=long
            this.larg=larg
            this.bombs=bombs
        }
    }

    createGrid(xstart:number,ystart:number) {
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
    
        for (let x=xstart-1;x<xstart+2;x++) {
            for (let y=ystart-1;y<ystart+2;y++) {
                if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                    this.tab[x][y].start = true
                }
            }
        }
    
        for (let k=0;k<this.bombs;k++) {
            var newX:number = Math.floor(Math.random()*this.long)
            var newY:number = Math.floor(Math.random()*this.larg)
            if (this.tab[newX][newY].bomb || this.tab[newX][newY].start) {
                k--
            } else {
                this.tab[newX][newY].bomb = true
                for (let x=newX-1;x<newX+2;x++) {
                    for (let y=newY-1;y<newY+2;y++) {
                        if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                            this.tab[x][y].around ++
                        }
                    }
                }            
            }
        }
        
        this.defVisible(xstart,ystart,[])
        this.play = true
        return this 
    }

    setFlag(xcase:number,ycase:number):boolean{
        if (this.tab[xcase][ycase].flag) {
            this.tab[xcase][ycase].flag = false
            this.totalflags --
            if (this.tab[xcase][ycase].bomb) {
                this.rightflags --
            }
            return false
        } else {
            this.tab[xcase][ycase].flag = true
            this.totalflags ++
            if (this.tab[xcase][ycase].bomb) {
                this.rightflags ++
            }
            return true
        }
    }

    clearCase(xcase:number,ycase:number):[number,number,number,boolean][] {
        if (this.tab[xcase][ycase].flag == true) {
            return []
        } else if (this.tab[xcase][ycase].bomb == true) {
            this.tab[xcase][ycase].visible = true
            this.play = false
            return [[xcase,ycase,8,true]]
        } else {
            return this.defVisible(xcase,ycase,[])
        }
    }

    clearAroundCase(xcase:number,ycase:number):[number,number,number,boolean][] {
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
    
        console.log(nbFlags,this.tab[xcase][ycase].around )
        if (nbFlags == this.tab[xcase][ycase].around) {
            var i:number = 0
            var liste:[number,number,number,boolean][] = []
            for (var i=0;i<listeAround.length;i++) {
                if (listeAround[i][2].bomb == true && listeAround[i][2].flag == true) {} else {
                    liste=this.defVisible(listeAround[i][0],listeAround[i][1],liste)
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
            liste.push([xcase,ycase,this.tab[xcase][ycase].around,this.tab[xcase][ycase].bomb])
            if (this.tab[xcase][ycase].around == 0) {
                for (let x=xcase-1;x<xcase+2;x++) {
                    for (let y=ycase-1;y<ycase+2;y++) {
                        if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                            liste.push([x,y,this.tab[x][y].around,this.tab[x][y].bomb])
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

}
