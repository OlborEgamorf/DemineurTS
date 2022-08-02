import { sign, verify } from '../func/crypto'
import Fastify from 'fastify'
import {v4} from "uuid"
import FastifyStatic from '@fastify/static'
import { resolve } from 'path'
import { createGrid, Demineur, clearCase, setFlag, clearAroundCase } from '../func/demineur'

interface IQuerystring {
    username: string;
    password: string;
  }
  

const fastify = Fastify({logger:true})
fastify.register(FastifyStatic,{root:resolve("./static")})

var dictJeux:{[key:number]:Demineur} = {}

fastify.listen({port:8000}).catch((err) => {
    fastify.log.error(err)
    process.exit(1)
}).then( () => {
    fastify.log.info("Port 8000 activé")
})

fastify.post("/api/players",(req,res) => {
    const playerID = v4()
    const signature = sign(playerID)
    res.send({
        id:playerID, 
        signature:signature,
        pass:verify(playerID,signature)
    })
    console.log({})
})

fastify.get<{Querystring: IQuerystring}>("/game/create", (req, res) => {
    const long = req.query["long"]
    const larg = req.query["larg"]
    const bombs = req.query["bombs"]
    const xstart = req.query["xstart"]
    const ystart = req.query["ystart"]
    console.log(long,larg,bombs,xstart,ystart)
    var grid = createGrid(Number(long),Number(larg),Number(bombs),Number(xstart),Number(ystart))
    
    if (grid == undefined) {
        res.send("ERROR")
    } else {
        dictJeux[0]=grid
        res.send({"visible":grid.getVisible(),"around":grid.getAround()})
    }
});

fastify.get<{Querystring: IQuerystring}>("/game/clear", (req, res) => {
    const x = req.query["x"]
    const y = req.query["y"]
    var grid:Demineur=dictJeux[0]
   
    if (grid.play == true) {
        var liste = clearCase(grid,Number(x),Number(y))
    } else {
        var liste:[number,number,number,boolean][] = []
    }
    
    res.send({"clear":liste})
});

fastify.get<{Querystring: IQuerystring}>("/game/flag", (req, res) => {
    const x = req.query["x"]
    const y = req.query["y"]
    var grid:Demineur=dictJeux[0]

    if (grid.play == true) {
        var isflag:boolean|null = setFlag(grid,Number(x),Number(y)) 
        var isdone:boolean = grid.bombs==grid.rightflags
    } else {
        var isflag:boolean|null = null
        var isdone:boolean = false
    }
    
    res.send({"isflag":isflag,"isdone":isdone})
});

fastify.get<{Querystring: IQuerystring}>("/game/cleararound", (req, res) => {
    const x = req.query["x"]
    const y = req.query["y"]
    var grid:Demineur=dictJeux[0]
    
    if (grid.play == true) {
        var liste = clearAroundCase(grid,Number(x),Number(y))
    } else {
        var liste:[number,number,number,boolean][] = []
    }
    
    res.send({"clear":liste})
});