import { WebSocket } from "@fastify/websocket";
import { Versus } from "../func/versus";
import { ConnectionRepository } from "./repositories/ConnectionRepository";
import { Entry } from "../func/demineur";

export function publishBlankVersus(versus:Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of versus.getJoueurs()) {
        const grid = versus.getGridById(player.id)
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"blank", ...versus.getAllInfos(grid)}))
        }
    }
}

export function publishCreateVS(versus:Versus, connections:ConnectionRepository, gameId:string) {
    for (const player of versus.getJoueurs()) {
        const grid = versus.getGridById(player.id)
        const visible = grid?.getVisible()
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"create",visible:visible,...versus.getAllInfos(grid)}))
        }
    }
}

export function publishClearVS(connection:WebSocket,liste:Entry[]) {
    connection.send(JSON.stringify({type:"clear",liste:liste}))
}

export function publishFlagVS(connection:WebSocket,isflag:boolean,color:string,x:number,y:number) {
    connection.send(JSON.stringify({type:"flag",isflag:isflag,color:color,x:x,y:y}))
}

export function publishMessageVS(connection:WebSocket,mess:string) {
    connection.send(JSON.stringify({type:"message",mess:mess}))
}
