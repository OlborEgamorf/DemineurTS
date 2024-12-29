import { Entry } from "./demineur"

type AroundCase = {
    flags:number[][]
    nonvisible:number[][]
}

function solve(visible:Entry[]):boolean {

    function signature(visible:Entry[]):number {
        let sign:number = 0
        visible.forEach((val, index) => {
            sign += val.x + val.y
        })
        return sign
    }

    function getAround(xstart:number, ystart:number):AroundCase {
        let flags:number[][] = []
        let nonvisible:number[][] = []

        for (let x=xstart-1; x<xstart+2; x++) {
            for (let y=ystart-1; y<ystart+2; y++) {
                if (x>=0 && y>=0 && x < this.long && y < this.larg) {
                    let coords:number[] = [x,y]
                    if (this.grid!.getCase(x,y).flag) {flags.push(coords)}
                    if (!this.grid!.getCase(x,y).visible) {nonvisible.push(coords)}
                }
            }
        }

        return {flags:flags, nonvisible:nonvisible}
    }


    let locked:boolean = false
    let solved:boolean = false
    let sign:number = signature(visible)

    while (!locked && !solved) {
        for (let i=0; i<visible.length; i++) {
            let element:Entry = visible[i]
            let around = getAround(element.x, element.y)
            let nonvisible = around.nonvisible
            let flags = around.flags

            if (element.around == nonvisible.length) {
                nonvisible.forEach((val, index) => {
                    if (!flags.includes(val)) {
                        this.grid!.setFlag(val[0], val[1])
                    }
                })
            }

            else if (element.around == flags.length) {
                nonvisible.filter((val, index) => {return !flags.includes(val)}).forEach((val, index) => {
                    visible = this.grid!.defVisible(val[0], val[1], visible)
                })
            }

            else {
                continue
            }

            visible.splice(i, 1)
            i--
        }

        if (this.grid!.getTotalFlags() == this.bombs) {
            solved = true
        } else {
            let newSign = signature(visible)
            if (sign == newSign) {
                locked = true
            } else {
                sign = newSign
            }
        }
    }

    console.log("solved", solved)
    console.log("locked", locked)

    return solved || !locked
}