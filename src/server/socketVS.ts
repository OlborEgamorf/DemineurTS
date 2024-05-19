import { WebSocket } from "@fastify/websocket";
import { Versus } from "../func/versus";
import { ConnectionRepository } from "./repositories/ConnectionRepository";
import { Entry } from "../func/demineur";

export function publishBlankVersus(versus:Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of versus.joueurs) {
        const grid = versus.grilles[player.id]
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"blank",long:grid.long,larg:grid.larg,bombs:grid.bombs,flags:grid.totalflags}))
        }
    }
}

export function publishCreateVS(versus:Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of versus.joueurs) {
        const grid = versus.grilles[player.id]
        const connection = connections.find(player.id,gameId)
        const visible = grid.getVisible()
        const around = grid.getAround()
        if (connection) {
            connection.send(JSON.stringify({type:"create",visible:visible,around:around,long:grid.long,larg:grid.larg,flags:grid.totalflags}))
        }
    }
}

export function publishClearVS(connection:WebSocket,liste:Entry[]) {
    connection.send(JSON.stringify({type:"clear",liste:liste}))
}

export function publishFlagVS(connection:WebSocket,isflag:boolean,isdone:boolean,color:string,x:number,y:number) {
    connection.send(JSON.stringify({type:"flag",isflag:isflag,isdone:isdone,color:color,x:x,y:y}))
}

export function publishMessageVS(connection:WebSocket,mess:string) {
    connection.send(JSON.stringify({type:"message",mess:mess}))
}
