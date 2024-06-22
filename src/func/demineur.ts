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
    private tab:Case[][] = []
    private totalflags:number = 0
    private lose:boolean = false
    private notvisible:number
    private long:number
    private larg:number
    private bombs:number

    constructor (long:number, larg:number, bombs:number) {
        this.long = long
        this.larg = larg
        this.bombs = bombs
        this.notvisible = long * larg
    }

    reset():void{
        this.tab = []
        this.totalflags = 0
    }

    getVisible():Number[][] {
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

    around(xstart:number, ystart:number, func:FuncCase):void {
        for (let x=xstart-1;x<xstart+2;x++) {
            for (let y=ystart-1;y<ystart+2;y++) {
                if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                    func(this.tab[x][y])
                }
            }
        }
    }

    createGrid(start:[number, number][]):Case[][] {

        for (let i=0;i<this.long;i++) {
            this.tab.push([])
            for (let j=0;j<this.larg;j++) {
                var newCase = new Case(false,false,false,0,false)
                this.tab[i].push(newCase)
            }
        }

        start.forEach(element => {
            this.around(element[0], element[1], (c:Case) => {c.start = true})
        });
    
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
        
        return this.tab 
    }

    setFlag(xcase:number,ycase:number):boolean{
        if (this.tab[xcase][ycase].flag) {
            this.tab[xcase][ycase].flag = false
            this.totalflags --
            return false
        } else {
            this.tab[xcase][ycase].flag = true
            this.totalflags ++
            return true
        }
    }

    clearCase(xcase:number,ycase:number):Entry[] {
        if (this.tab[xcase][ycase].flag || this.tab[xcase][ycase].visible) {
            return []
        }
        return this.defVisible(xcase,ycase,[])
    }

    clearAroundCase(xcase:number,ycase:number):Entry[] {
        var nbFlags:number = 0
        var listeAround:[number,number,Case][] = []
    
        for (var checkLong=xcase-1;checkLong<xcase+2;checkLong++) {
            for (var checkLarg=ycase-1;checkLarg<ycase+2;checkLarg++) {
                if (checkLong>=0 && checkLarg>=0 && checkLong < this.long && checkLarg < this.larg) {
                    listeAround.push([checkLong,checkLarg,this.tab[checkLong][checkLarg]])
                    if (this.tab[checkLong][checkLarg].flag) {
                        nbFlags ++
                    }
                }
            }
        } 
    
        if (nbFlags == this.tab[xcase][ycase].around) {            
            var i:number = 0
            var liste:Entry[] = []
            for (var i=0;i<listeAround.length;i++) {
                if (listeAround[i][2].bomb && listeAround[i][2].flag) {} else {
                    liste = this.defVisible(listeAround[i][0],listeAround[i][1],liste)
                }
            }
            return liste
        } else {
            return []
        }
    }

    defVisible(xcase:number,ycase:number,liste:Entry[]):Entry[] {
        if (!this.tab[xcase][ycase].visible) {
            this.tab[xcase][ycase].visible = true
            this.notvisible --
            if (this.tab[xcase][ycase].bomb) {
                this.lose = true
            }
            liste.push({x:xcase, y:ycase, around:this.tab[xcase][ycase].around, isbomb:this.tab[xcase][ycase].bomb})
            if (this.tab[xcase][ycase].around == 0) {
                for (let x=xcase-1;x<xcase+2;x++) {
                    for (let y=ycase-1;y<ycase+2;y++) {
                        if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                            liste = this.defVisible(x,y,liste)
                        }
                    }
                } 
            }
        }
        return liste
    }

    isDone():boolean{
        return this.notvisible == this.bombs
    }

    isLose():boolean{
        return this.lose
    }

    getTotalFlags():number {
        return this.totalflags
    }

    getNotVisible():number {
        return this.notvisible
    }
}
