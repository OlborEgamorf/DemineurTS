class Case {
    constructor (public bomb:boolean, public flag:boolean, public visible:boolean, public around:number, public start:boolean) {}
}

export class Demineur {
    public tab:Case[][] = []
    public rightflags = 0
    public totalflags = 0

    constructor (public long:number, public larg:number,public bombs:number,public user:string) {}

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
}

var allGrids:any = {}

export function createGrid(long:number,larg:number,bombs:number,xstart:number,ystart:number) : Demineur|undefined {
    var grid = new Demineur(long,larg,bombs,"Olbor")

    if (long*larg <= bombs) {
        return undefined 
    }

    for (let i=0;i<long;i++) {
        grid.tab.push([])
        for (let j=0;j<larg;j++) {
            var newCase = new Case(false,false,false,0,false)
            grid.tab[i].push(newCase)
        }
    }

    grid.tab[xstart][ystart].start = true
    grid.tab[xstart-1][ystart-1].start = true
    grid.tab[xstart-1][ystart].start = true
    grid.tab[xstart-1][ystart+1].start = true
    grid.tab[xstart][ystart-1].start = true
    grid.tab[xstart][ystart+1].start = true
    grid.tab[xstart+1][ystart-1].start = true
    grid.tab[xstart+1][ystart].start = true
    grid.tab[xstart+1][ystart+1].start = true

    for (let k=0;k<bombs;k++) {
        var newX:number = Math.floor(Math.random()*long)
        var newY:number = Math.floor(Math.random()*long)
        if (grid.tab[newX][newY].bomb || grid.tab[newX][newY].start) {
            k--
        } else {
            grid.tab[newX][newY].bomb = true
            for (let x=newX-1;x<newX+2;x++) {
                for (let y=newY-1;y<newY+2;y++) {
                    if (x>=0 && y>=0 && x < long && y < larg) {
                        grid.tab[x][y].around ++
                    }
                }
            }            
        }
    }
    
    defVisible(grid,xstart,ystart,[])
    return grid 
}


function setFlag(grid:Demineur,xcase:number,ycase:number):number {
    if (grid.tab[xcase][ycase].flag) {
        grid.tab[xcase][ycase].flag = false
        if (grid.tab[xcase][ycase].bomb) {
            grid.rightflags --
        }
    } else {
        grid.tab[xcase][ycase].flag = true
        if (grid.tab[xcase][ycase].bomb) {
            grid.rightflags ++
        }
    }
    if (grid.rightflags == grid.bombs && grid.rightflags == grid.totalflags) {
        return 2
    } else {
        return 1
    }
}


function clearCase(grid:Demineur,xcase:number,ycase:number):number {
    if (grid.tab[xcase][ycase].bomb) {
        grid.tab[xcase][ycase].visible = true
        return 0
    } else {
        var liste=defVisible(grid,xcase,ycase,[])
        return checkAll(grid)
    }
}


function clearAroundCase(grid:Demineur,xcase:number,ycase:number):number {
    var nbFlags:number = 0
    var nbRightFlags:number = 0
    var listeAround:Case[] = []

    var checkLong = xcase
    for (checkLong-1;checkLong++;checkLong+2) {
        var checkLarg = ycase
        for (checkLarg-1;checkLarg++;checkLarg+2) {
            if (checkLong>=0 && checkLarg>=0 && checkLong < grid.long && checkLarg < grid.larg) {
                listeAround.push(grid.tab[checkLong][checkLarg])
                if (grid.tab[checkLong][checkLarg].flag) {
                    nbFlags ++
                    if (grid.tab[checkLong][checkLarg].bomb) {
                        nbRightFlags ++
                    }
                }
            }
        }
    } 

    if (nbFlags == grid.tab[xcase][ycase].around) {
        var i:number = 0
        for (i;i++;i<listeAround.length) {
            defVisible(grid,xcase,ycase,[])
        }
        if (nbFlags == nbRightFlags) {
            return checkAll(grid)
        } else {
            return 0
        }
    } else {
        return 1
    }
}


function checkAll(grid:Demineur):number {
    var i:number = grid.long
    var countNV:number = 0
    for (i;i++;i<grid.long) {
        var notVisible:Case[] = grid.tab[i].filter(function (tabCase:Case) {return tabCase.visible == false})
        countNV+=notVisible.length
    }

    if (countNV == grid.bombs) {
        return 2
    } else {
        return 1
    }
}

function defVisible(grid:Demineur,xcase:number,ycase:number,liste:[number,number,number,boolean][]):[number,number,number,boolean][] {
    if (grid.tab[xcase][ycase].visible == false) {
        grid.tab[xcase][ycase].visible = true
        if (grid.tab[xcase][ycase].around == 0) {
            for (let x=xcase-1;x<xcase+2;x++) {
                for (let y=ycase-1;y<ycase+2;y++) {
                    if (x>=0 && y>=0 && x < grid.long && y < grid.larg) {
                        liste.push([x,y,grid.tab[xcase][ycase].around,grid.tab[xcase][ycase].bomb])
                        liste=defVisible(grid,x,y,liste)
                    }
                }
            } 
        }
    }
    return liste
}

function gridToArray(jeu:Demineur):{} {
    var grid = jeu.tab
    var array:[boolean, boolean, boolean, number][][] = []
    for (let i=0;i<grid.length;i++){
        var a:[boolean, boolean, boolean, number][] = grid[i].map(function (tabCase:Case) {return [tabCase.bomb,tabCase.flag,tabCase.visible,tabCase.around]})
        array.push(a)
    }
    
    return {"tab":array,"long":jeu.long,"larg":jeu.larg,"bombs":jeu.bombs,"rightflags":jeu.rightflags,"totalflags":jeu.totalflags}

}


function arrayToGrid(array:[boolean, boolean, boolean, number][][]):Case[][] {
    var grid:Case[][] = []
    for (let i=0;i<array.length;i++) {
        grid.push([])
        for (let j=0;array[i].length;j++) {
            var tabCase:[boolean, boolean, boolean, number] = array[i][j]
            grid[i].push(new Case(tabCase[0],tabCase[1],tabCase[2],tabCase[3],false))
        }
    }
    return grid
}

var grid = createGrid(10,10,40,5,5)
if (grid instanceof Demineur) {
    var array = gridToArray(grid)
}


function printGrid (grid:Case[][]) : void {
    for (var i of grid) {
        var ligne = ""
        for (var caseG of i) {
            if (caseG.bomb == true) {
                ligne += "B "
            } else {
                ligne += caseG.around.toString()+" "
            }
        }
        console.log(ligne)
        
    }
    
    console.log("\n\n")
    for (var i of grid) {
        var ligne = ""
        for (var caseG of i) {
            if (caseG.visible == true) {
                ligne += "V "
            } else {
                ligne += "0 "
            }
        }
        console.log(ligne)
        
    }
    console.log("\n\n")
}


// e