import { sign, verify } from '../func/crypto'
import Fastify, { RequestGenericInterface } from 'fastify'
import {v4} from "uuid"
import FastifyStatic from '@fastify/static'
import FastifyWebsocket from '@fastify/websocket'
import FastifyView from "@fastify/view"
import { resolve } from 'path'
import { Demineur } from '../func/demineur'
import { ConnectionRepository } from './repositories/ConnectionRepository'
import { GameRepository } from './repositories/GameRepository'
import { publishBlank, publishClear, publishCreate, publishCreateSingle, publishFlag, publishPlayerJoin, publishPlayerLeave, publishPlayersIn, publishReload } from './socket'

interface IQuerystring {
    username: string;
    password: string;
  }

interface requestGeneric extends RequestGenericInterface {
    Params: {
        gameid:string
    }
}

const connections = new ConnectionRepository()
const games = new GameRepository(connections)

const fastify = Fastify({logger:true})

fastify.register(FastifyStatic,{root:resolve("./static")})
fastify.register(FastifyView, {
    engine: {
      ejs: require("ejs"),
    },
  });


fastify.register(FastifyWebsocket)
fastify.register(async (f) => {
    f.get("/ws", {websocket:true}, (connection,req) => {
        const query = req.query as Record<string,string>
        const playerId = query.id
        const signature = query.signature
        const playerName = query.name || "Invité"
        const color = query.color
        const gameId = query.gameid

        console.log("JE SUIS CONNECTE EHOH")

        if (!gameId) {
            connection.end()
            f.log.error("GAMEID")
            return
        }

        if (!verify(playerId,signature)) {
            f.log.error("SIGNATURE")
            connection.socket.send(JSON.stringify({type:"error",code:"KEK"}))
            return
        }

        const game = games.find(gameId) ?? games.create(gameId)
        connections.persist(playerId,gameId,connection)
        game.join(playerId,playerName,color)
        publishPlayerJoin(game,connections,gameId,{id:playerId,nom:playerName,color:color})
        publishPlayersIn(game,connection)
        if (game.play == true) {
            publishCreateSingle(game,connection)
        }

        connection.socket.on("message", (rawMessage) => {
            console.log("RECU")
            const message = JSON.parse(rawMessage.toLocaleString())
            if (message.type == "values") {
                game.setValues(Number(message.long),Number(message.larg),Number(message.bombs))
                publishBlank(game,connections,gameId)
            } else if (message.type == "create") {
                game.createGrid(Number(message.xstart),Number(message.ystart))
                publishCreate(game,connections,gameId)
            } else if (message.type == "flag") {
                var isflag = game.setFlag(Number(message.x),Number(message.y))
                var isdone:boolean = game.bombs==game.rightflags
                publishFlag(game,connections,gameId,isflag,isdone,color,Number(message.x),Number(message.y))
            } else if (message.type == "clear") {
                var liste = game.clearCase(Number(message.x),Number(message.y))
                publishClear(game,connections,gameId,liste,message.nom)
            } else if (message.type == "cleararound") {
                var liste = game.clearAroundCase(Number(message.x),Number(message.y))
                publishClear(game,connections,gameId,liste,message.nom)
            } else if (message.type == "reload") {
                game.reset()
                publishReload(game,connections,gameId)
            }
            console.log(message)
        })

        connection.socket.on("close", () => {
            publishPlayerLeave(game,connections,gameId,{id:playerId,nom:playerName,color:color})
            connections.remove(playerId,gameId)
            game.leave(playerId)

        })

    })
})

fastify.listen({port:8000}).catch((err) => {
    fastify.log.error(err)
    process.exit(1)
}).then( () => {
    fastify.log.info("Port 8000 activé")
})

fastify.get("/", (req,reply) => {
    reply.view("/templates/home.ejs")
})

fastify.get("/login", (req,reply) => {
    reply.view("/templates/login.ejs")
})

fastify.get<requestGeneric>("/classique/:gameid", (req,reply) => {
    console.log(req.params["gameid"],"\n")
    if (req.params["gameid"] == "") {
        var gameid = String(Math.floor(Math.random() * 10000))
        reply.redirect(`/classique/${gameid}`)
    } else if (isNaN(Number(req.params["gameid"])) == true) {
        console.log("OUI")
        reply.sendFile(req.params["gameid"])
    } else {
        var gameid = req.params["gameid"]
        reply.view("/templates/classique.ejs",{gameid:gameid})
    }
})

fastify.get("/classique", (req,reply) => {
    reply.redirect(`/classique/`)
})



fastify.post<{Querystring: IQuerystring}>("/api/players",(req,reply) => {
    const playerID = v4()
    const signature = sign(playerID)
    reply.send({
        id:playerID, 
        signature:signature,
        pass:verify(playerID,signature)
    })
})


/** 
 * Pour plus tard
fastify.addHook("preHandler", function (request, reply, done) {
    reply.locals = {
      text: getTextFromRequest(request), // it will be available in all views
    };
  
    done();
  });
*/