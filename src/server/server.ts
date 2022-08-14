import { sign, verify } from '../func/crypto'
import Fastify, { RequestGenericInterface } from 'fastify'
import {v4} from "uuid"
import FastifyStatic from '@fastify/static'
import FastifyWebsocket from '@fastify/websocket'
import FastifyView from "@fastify/view"
import { resolve } from 'path'
import { Demineur, Versus } from '../func/demineur'
import { ConnectionRepository } from './repositories/ConnectionRepository'
import { GameRepository } from './repositories/GameRepository'
import { publishBlank, publishBlankSingle, publishClear, publishCreate, publishCreateSingle, publishFlag, publishMessage, publishPlayerJoin, publishPlayerLeave, publishPlayersIn, publishReload, publishValues } from './socket'
import { publishClearVS, publishCreateVS, publishFlagVS, publishMessageVS } from './socketVS'

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

        const game = games.find(gameId) as Demineur ?? games.create(gameId,playerId)
        connections.persist(playerId,gameId,connection)
        game.join(playerId,playerName,color)
        publishPlayerJoin(game,connections,gameId,{id:playerId,nom:playerName,color:color})
        publishPlayersIn(game,connection)
        if (game.play == true) {
            publishCreateSingle(game,connection)
        } else if (game.blank == true) {
            publishBlankSingle(game,connection)
        }

        connection.socket.on("message", (rawMessage) => {
            const message = JSON.parse(rawMessage.toLocaleString())
            if (message.type == "values") {
                game.setValues(Number(message.long),Number(message.larg),Number(message.bombs))
                publishValues(game,connections,gameId)
            } else if (message.type == "create") {
                game.createGrid(Number(message.xstart),Number(message.ystart))
                publishCreate(game,connections,gameId)
            } else if (message.type == "flag") {
                var isflag = game.setFlag(Number(message.x),Number(message.y))
                publishFlag(game,connections,gameId,isflag,game.isDone(),color,Number(message.x),Number(message.y))
            } else if (message.type == "clear") {
                var liste = game.clearCase(Number(message.x),Number(message.y))
                publishClear(game,connections,gameId,liste)
                if (game.isDone() == true) {
                    publishMessage(game,connections,gameId,"Victoire ! La grille est nettoyée !")
                } else if (game.isLose() == true) {
                    publishMessage(game,connections,gameId,`Perdu ! ${playerName} a fait exploser une bombe !`)
                }
            } else if (message.type == "cleararound") {
                var liste = game.clearAroundCase(Number(message.x),Number(message.y))
                publishClear(game,connections,gameId,liste)
                if (game.isDone() == true) {
                    publishMessage(game,connections,gameId,"Victoire ! La grille est nettoyée !")
                } else if (game.isLose() == true) {
                    publishMessage(game,connections,gameId,`Perdu ! ${playerName} a fait exploser une bombe !`)
                }
            } else if (message.type == "reload") {
                game.reset()
                publishReload(game,connections,gameId)
            } else if (message.type == "start") {
                game.blank = true
                publishBlank(game,connections,gameId)
            }
            console.log(message)
        })

        connection.socket.on("close", () => {
            game.leave(playerId)
            publishPlayerLeave(game,connections,gameId,{id:playerId,nom:playerName,color:color})
            games.clean(gameId)
            connections.remove(playerId,gameId)
        })

    })
})


fastify.register(async (f) => {
    f.get("/wsversus", {websocket:true}, (connection,req) => {
        const query = req.query as Record<string,string>
        const playerId = query.id
        const signature = query.signature
        const playerName = query.name || "Invité"
        const color = query.color
        const gameId = query.gameid

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

        const game = games.find(gameId) as Versus ?? games.createVersus(gameId,playerId)
        if (game.play == true && game.joueurs.filter((around,i,joueur) => {return around.id == playerId}).length != 0) {
            publishCreateSingle(game.grilles[playerId],connection)
        } else if (game.play == true || game.blank == true) {
            connection.socket.send(JSON.stringify({type:"error",code:"KEK"}))
            return
        } else {
            
        }
        connections.persist(playerId,gameId,connection)
        game.join(playerId,playerName,color)
        publishPlayerJoin(game,connections,gameId,{id:playerId,nom:playerName,color:color})
        publishPlayersIn(game,connection)
        var grid = game.grilles[playerId]
        
        connection.socket.on("message", (rawMessage) => {
            const message = JSON.parse(rawMessage.toLocaleString())
            if (message.type == "values") {
                game.setValues(Number(message.long),Number(message.larg),Number(message.bombs))
                publishValues(game,connections,gameId)
            } else if (message.type == "create") {
                game.addStart(playerId,Number(message.xstart),Number(message.ystart))
                if (game.isStart() == true) {
                    game.createGrid()
                    publishCreateVS(game,connections,gameId)
                }
            } else if (message.type == "flag") {
                var isflag = grid.setFlag(Number(message.x),Number(message.y))
                publishFlagVS(connection,isflag,grid.isDone(),color,Number(message.x),Number(message.y))
            } else if (message.type == "clear") {
                var liste = grid.clearCase(Number(message.x),Number(message.y))
                publishClearVS(connection,liste)
                if (grid.isDone() == true) {
                    publishMessage(game,connections,gameId,`${playerName} a gagné ! Il a nettoyé sa grille plus vite que tout le monde !`)
                } else if (grid.isLose() == true) {
                    var still:string[] = game.getStill()
                    if (still.length == 1) {
                        publishMessage(game,connections,gameId,`${still[0]} a gagné ! C'est le dernier en vie !`)
                    } else {
                        publishMessageVS(connection,`Vous avez fait exploser une bombe ! Vous êtes éliminé, mais la partie est toujours en cours.`)
                    }
                }
            } else if (message.type == "cleararound") {
                var liste = grid.clearAroundCase(Number(message.x),Number(message.y))
                publishClearVS(connection,liste)
                if (grid.isDone() == true) {
                    publishMessage(game,connections,gameId,`${playerName} a gagné ! Il a nettoyé sa grille plus vite que tout le monde !`)
                } else if (grid.isLose() == true) {
                    var still:string[] = game.getStill()
                    if (still.length == 1) {
                        publishMessage(game,connections,gameId,`${still[0]} a gagné ! C'est le dernier en vie !`)
                    } else {
                        publishMessageVS(connection,`Vous avez fait exploser une bombe ! Vous êtes éliminé, mais la partie est toujours en cours.`)
                    }
                }
            } else if (message.type == "reload") {
                game.reset()
                publishReload(game,connections,gameId)
            } else if (message.type == "ready" || message.type == "start") {
                game.setReady(playerId)
                if (game.isReady() == true && game.joueurs.length > 1) {
                    game.blank = true
                    publishBlank(game,connections,gameId)
                }
            }
            console.log(message)
        })

        connection.socket.on("close", () => {
            game.leave(playerId)
            publishPlayerLeave(game,connections,gameId,{id:playerId,nom:playerName,color:color})
            games.clean(gameId)
            connections.remove(playerId,gameId)
        })

    })
})

fastify.listen({port:8888,}).catch((err) => { // host:"45.32.147.186"
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
    if (req.params["gameid"] == "") {
        var gameid = String(Math.floor(Math.random() * 10000))
        reply.redirect(`/classique/${gameid}`)
    } else if (isNaN(Number(req.params["gameid"])) == true) {
        reply.sendFile(req.params["gameid"])
    } else {
        var gameid = req.params["gameid"]
        reply.view("/templates/classique.ejs",{gameid:gameid})
    }
})

fastify.get("/classique", (req,reply) => {
    reply.redirect(`/classique/`)
})

fastify.get<requestGeneric>("/versus/:gameid", (req,reply) => {
    if (req.params["gameid"] == "") {
        var gameid = String(Math.floor(Math.random() * 10000))
        reply.redirect(`/versus/${gameid}`)
    } else if (isNaN(Number(req.params["gameid"])) == true) {
        reply.sendFile(req.params["gameid"])
    } else {
        var gameid = req.params["gameid"]
        reply.view("/templates/versus.ejs",{gameid:gameid})
    }
})

fastify.get("/versus", (req,reply) => {
    reply.redirect(`/versus/`)
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