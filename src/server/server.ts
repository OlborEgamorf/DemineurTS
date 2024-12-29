import FastifyStatic from '@fastify/static'
import FastifyView from "@fastify/view"
import FastifyWebsocket from '@fastify/websocket'
import Fastify from 'fastify'
import { resolve } from 'path'
import { v4 } from "uuid"
import { Coop } from '../func/coop'
import { sign, verify } from '../func/crypto'
import { Demineur } from '../func/demineur'
import { randomID } from '../func/functions'
import { Versus } from '../func/versus'
import { ConnectionRepository } from './repositories/ConnectionRepository'
import { GameRepository } from './repositories/GameRepository'
import { publishBlank, publishBlankSingle, publishClear, publishConnectionClosed, publishCreate, publishCreateSingle, publishErrorSingle, publishFlag, publishMessage, publishPlayerJoin, publishPlayerLeave, publishPlayersIn, publishReload, publishValues } from './socket'
import { publishClearVS, publishCreateVS, publishFlagVS, publishMessageVS } from './socketVS'
import { IQuerystring, requestGeneric, requestStatic } from '../types'



const connections = new ConnectionRepository()
const games = new GameRepository(connections)

const fastify = Fastify({
    logger: {
        level: 'error',
        file: 'logs.txt' // Will use pino.destination()
    }
})

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
        const playerName = query.name
        const color = query.color
        const gameId = query.gameid

        if (!gameId || !playerId || !signature || !playerName || !color) {
            publishErrorSingle("Un élément à la création de la partie est manquant.", "MISSING PARAMETER", connection, f)

        } else if (!verify(playerId,signature)) {
            publishErrorSingle("Connexion interdite.", "SIGNATURE", connection, f)   

        } else {
            try {
                const game = games.find(gameId) as Coop
                let grid = game.getGrid() as Demineur
                let pings:number = 0

                connections.persist(playerId,gameId,connection)

                if (game.isPlay()) {
                    publishCreateSingle(grid.getVisible(), game.getAllInfos(grid), connection)
                } else if (game.isBlank()) {
                    publishBlankSingle(game.getAllInfos(grid),connection)
                }

                game.join(playerId,playerName,color)
                publishPlayerJoin(game,connections,gameId,{id:playerId,nom:playerName,color:color})
                publishPlayersIn(game, game.getAllInfos(grid), connection)
                
                connection.on("message", (rawMessage) => {
                    const message = JSON.parse(rawMessage.toLocaleString())
                    if (!grid) {
                        grid = game.getGrid() as Demineur
                    }

                    if (message.type != "ping") {
                        pings = 0
                    }

                    switch (message.type) {
                        case "ping":
                            if (++pings == 10) {
                                publishConnectionClosed(connection)
                                connection.close()
                            }
                            break

                        case "values":
                            game.setValues(Number(message.long),Number(message.larg),Number(message.bombs))
                            publishValues(game, game.getAllInfos(grid), connections,gameId)
                            break

                        case "create":
                            game.createGrid(Number(message.xstart),Number(message.ystart))
                            grid = game.getGrid() as Demineur
                            publishCreate(game,grid.getVisible(),game.getAllInfos(grid),connections,gameId)
                            break

                        case "flag":
                            let isflag = grid.setFlag(Number(message.x),Number(message.y))
                            publishFlag(game,connections,gameId,isflag,color,Number(message.x),Number(message.y))
                            break

                        case "clear":
                        case "cleararound":                    
                            let liste = message.type == "clear" ? grid.clearCase(Number(message.x),Number(message.y)) : grid.clearAroundCase(Number(message.x),Number(message.y))
                            publishClear(game,connections,gameId,liste)
                            if (game.isDone()) {
                                publishMessage(game,connections,gameId,"Victoire ! La grille est nettoyée !")
                            } else if (game.isLose()) {
                                publishMessage(game,connections,gameId,`Perdu ! ${playerName} a fait exploser une bombe !`)
                            }
                            break

                        case "reload":
                            game.reset()
                            publishReload(game,connections,gameId)
                            break

                        case "start":
                            game.setBlank(true)
                            publishBlank(game,game.getAllInfos(grid),connections,gameId)
                            break
                    }

                    console.log("GET MESSAGE ", message)
                })

                connection.on("close", () => {
                    console.log("CLOSED");
                    game.leave(playerId)
                    connections.remove(playerId,gameId)
                    publishPlayerLeave(game, game.getAllInfos(grid), connections, gameId, {id:playerId, nom:playerName, color:color})
                    games.clean(gameId)
                })

            } catch (err) {
                publishErrorSingle("Une erreur s'est produite, votre connexion a été rompue.", err, connection, f)
            }
        }
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
            connection.close()
            f.log.error("GAMEID")
            return
        }

        if (!verify(playerId,signature)) {
            f.log.error("SIGNATURE")
            connection.send(JSON.stringify({type:"error",code:"KEK"}))
            return
        }

        const game = games.find(gameId) as Versus
        let grid = game.getGridById(playerId)
        if (game.isPlay() && grid) {
            if (grid) {
                publishCreateSingle(grid.getVisible(), game.getAllInfos(grid), connection)
            } else {
                connection.send(JSON.stringify({type:"error",code:"KEK"}))
                return
            }
            
        } else if (game.isBlank()) {
            publishBlankSingle(game.getAllInfos(grid), connection)
        }

        connections.persist(playerId,gameId,connection)
        game.join(playerId,playerName,color)
        publishPlayerJoin(game, connections, gameId, {id:playerId,nom:playerName,color:color})
        publishPlayersIn(game, game.getAllInfos(grid), connection)
        
        connection.on("message", (rawMessage) => {
            const message = JSON.parse(rawMessage.toLocaleString())
            if (!grid) {
                grid = game.getGridById(playerId) as Demineur
            }
            switch (message.type) {
                case "values":
                    game.setValues(Number(message.long),Number(message.larg),Number(message.bombs))
                    publishValues(game, game.getAllInfos(grid), connections, gameId)
                    break
                case "create":
                    game.addStart(playerId,Number(message.xstart),Number(message.ystart))
                    if (game.isStart()) {
                        game.createGrid()
                        publishCreateVS(game,connections,gameId)
                    }
                    break
                case "flag":
                    let isflag = grid.setFlag(Number(message.x),Number(message.y))
                    publishFlagVS(connection, isflag, color, Number(message.x), Number(message.y))
                    break
                case "clear":
                case "cleararound":
                    let liste = message.type == "clear" ? grid.clearCase(Number(message.x),Number(message.y)) : grid.clearAroundCase(Number(message.x),Number(message.y))
    
                    publishClearVS(connection,liste)
    
                    if (game.isWin(playerId)) {
                        publishMessage(game,connections,gameId,`${playerName} a gagné ! Il a nettoyé sa grille plus vite que tout le monde !`)
                    } else if (game.isLose(playerId)) {
                        let winner = game.getWinner()
                        if (game.getCount() == 0) {
                            publishMessage(game,connections,gameId,`${winner.nom} a gagné ! Sa grille a été la mieux nettoyée !`)
                        } else if (game.getCount() == 1 && game.getPlaying(winner.id)) {
                            publishMessage(game,connections,gameId,`${winner.nom} a gagné ! C'est le dernier en vie, et sa grille est mieux nettoyée !`)
                        } else if (winner.id == playerId) {
                            publishMessageVS(connection,`Vous avez fait exploser une bombe ! Vous êtes éliminé, mais vous pouvez toujours gagner si votre grille est mieux nettoyée.`)
                        } else {
                            publishMessageVS(connection,`Vous avez fait exploser une bombe ! Vous êtes éliminé, et vous ne pourrez pas gagner.`)
                        }
                    }
                    break
                case "reload":
                    game.reset()
                    publishReload(game,connections,gameId)
                    break
                case "ready":
                case "start":
                    game.setReady(playerId)
                    if (game.isReady() && game.getJoueurs().length > 1) {
                        game.setBlank(true)
                        publishBlank(game, game.getAllInfos(grid), connections, gameId)
                    }
                    break
                }
            console.log(message)
        })

        connection.on("close", () => {
            game.leave(playerId)
            publishPlayerLeave(game, game.getAllInfos(grid), connections, gameId, {id:playerId,nom:playerName,color:color})
            games.clean(gameId)
            connections.remove(playerId,gameId)
        })

    })
})




fastify.get<requestStatic>("/static/:file", (req,reply) => {
    reply.sendFile(req.params["file"])
})

fastify.get<requestGeneric>("/", (req,reply) => {
    reply.view("/templates/index.ejs")
})

fastify.get<requestGeneric>("/play/:gameid", (req, reply) => {

    let gameid = req.params["gameid"].toUpperCase()     // On récupère l'ID de la partie
    
    if (gameid) {                                       // Si l'ID est donné, on essaie de rejoindre la partie (elle doit exister)        
        let game = games.find(gameid)
        if (game) {
            if (game.getJoueurs().length >= 8) {             // Maximum 8 joueurs
                reply.view("/templates/errors/error.ejs",{mess:"Maximum de joueurs atteint !"})
            } else {
                reply.view("/templates/classique.ejs",{gameid:gameid})
            }
        } else {
            reply.view("/templates/errors/error.ejs",{mess:"Cette partie n'existe pas..."})
        }

    } else {                                            // Sinon, on crée la partie
        do {
            gameid = randomID(4)                       
        } while (games.find(gameid) != undefined)
        games.create(gameid, false)
        reply.redirect(`/play/${gameid}`)
    }
})

fastify.get<requestGeneric>("/play", {schema: {querystring: { gameid: { type: 'string' } } } }, (req,reply) => {
    if (req.query.gameid) {
        reply.redirect(`/play/${req.query.gameid}`)
    } else {
        reply.redirect(`/play/`)
    }
})

fastify.get<requestGeneric>("/versus/:gameid", (req, reply) => {

    let gameid = req.params["gameid"].toUpperCase()     // On récupère l'ID de la partie
    
    if (gameid) {                                       // Si l'ID est donné, on essaie de rejoindre la partie (elle doit exister)
        let game = games.find(gameid)
        if (game) {
            if (game.getJoueurs().length >= 8) {             // Maximum 8 joueurs
                reply.view("/templates/errors/error.ejs",{mess:"Maximum de joueurs atteint !"})
            } else {
                reply.view("/templates/versus.ejs",{gameid:gameid})
            }
        } else {
            reply.view("/templates/errors/error.ejs",{mess:"Cette partie n'existe pas..."})
        }

    } else {                                            // Sinon, on crée la partie
        do {
            gameid = randomID(4)                       
        } while (games.find(gameid) != undefined)
        games.create(gameid, true)
        reply.redirect(`/versus/${gameid}`)
    }
})

fastify.get<requestGeneric>("/versus", {schema: {querystring: { gameid: { type: 'string' } } } }, (req,reply) => {
    if (req.query.gameid) {
        reply.redirect(`/versus/${req.query.gameid}`)
    } else {
        reply.redirect(`/versus/`)
    }
})

fastify.get<requestGeneric>("/search", {schema: {querystring: { gameid: { type: 'string' } } } }, (req,reply) => {
    if (req.query.gameid) {
        let gameid = req.query.gameid.toUpperCase()     // On récupère l'ID de la partie
        let game = games.find(gameid)

        if (game instanceof Coop) {
            reply.redirect(`/play/${req.query.gameid}`)
        } else if (game instanceof Versus) {
            reply.redirect(`/versus/${req.query.gameid}`)
        } else {
            reply.redirect(`/`)
        }
        
    } else {
        reply.redirect(`/`)
    }
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



fastify.listen({port:8889, host:"localhost"}).catch((err) => { // 
    fastify.log.error(err)
    process.exit(1)
}).then( () => {
    fastify.log.info("Port 8888 activé")
})


fastify.setNotFoundHandler({}, function (request, reply) {
    reply.view("/templates/errors/error404.ejs",{mess:"404"})
})

fastify.setErrorHandler(function (error, request, reply) {
    this.log.error(error)
    reply.view("/templates/errors/errorFatal.ejs",{mess:"Une erreur serveur s'est produite."})
  })