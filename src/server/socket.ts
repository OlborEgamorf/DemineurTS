import { WebSocket } from "@fastify/websocket";
import { Game, Infos, Joueur } from "../func/game";
import { ConnectionRepository } from "./repositories/ConnectionRepository";
import { Entry } from "../func/demineur";

export function publishBlank(game:Game, infos:Infos, connections:ConnectionRepository, gameId:string) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            publishBlankSingle(infos, connection)
        }
    }
}

export function publishBlankSingle(infos:Infos,connection:WebSocket){
    connection.send(JSON.stringify({type:"blank", ...infos}))
}

export function publishValues(game:Game, infos:Infos, connections:ConnectionRepository,gameId:string) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection && player.id != game.getLeader()) {
            connection.send(JSON.stringify({type:"values", ...infos}))
        }
    }
}

export function publishCreate(game:Game, visible:Number[][], infos:Infos, connections:ConnectionRepository,gameId:string) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"create", visible:visible, ...infos}))
        }
    }
}

export function publishCreateSingle(visible:Number[][], infos:Infos, connection:WebSocket){
    connection.send(JSON.stringify({type:"createall", visible:visible, ...infos}))
}

export function publishClear(game:Game, connections:ConnectionRepository, gameId:string, liste:Entry[]) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"clear",liste:liste}))
        }
    }
}

export function publishFlag(game:Game, connections:ConnectionRepository, gameId:string, isflag:boolean, color:string, x:number, y:number) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"flag",isflag:isflag,color:color,x:x,y:y}))
        }
    }
}

export function publishReload(game:Game, connections:ConnectionRepository, gameId:string) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"reload"}))
        }
    }
}

export function publishMessage(game:Game, connections:ConnectionRepository, gameId:string, mess:string) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"message",mess:mess}))
        }
    }
}

export function publishPlayerJoin(game:Game, connections:ConnectionRepository, gameId:string, joueur:Joueur) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"join",joueur:joueur}))
        }
    }
}

export function publishPlayerLeave(game:Game, connections:ConnectionRepository, gameId:string, joueur:Joueur) {
    for (const player of game.getJoueurs()) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"leave",joueur:joueur,leader:game.getLeader()}))
        }
    }
}

export function publishPlayersIn(game:Game, infos:Infos, connection:WebSocket) {
    connection.send(JSON.stringify({type:"allplayers",joueurs:game.getJoueurs(),leader:game.getLeader()}))
    if (!game.isPlay()) {
        connection.send(JSON.stringify({type:"waiting", ...infos}))
    }
}