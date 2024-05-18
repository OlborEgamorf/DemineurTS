import { Demineur, Joueur, Versus } from "../func/demineur";
import { WebSocket } from "@fastify/websocket";
import { ConnectionRepository } from "./repositories/ConnectionRepository";

export function publishBlank(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"blank",long:grid.long,larg:grid.larg,bombs:grid.bombs,flags:0}))
        }
    }
}

export function publishBlankSingle(grid:Demineur,connection:WebSocket){
    connection.send(JSON.stringify({type:"blank",long:grid.long,larg:grid.larg,bombs:grid.bombs,flags:grid.totalflags}))
}

export function publishValues(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection && player.id != grid.leader) {
            connection.send(JSON.stringify({type:"values",long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
        }
    }
}

export function publishCreate(grid:Demineur,connections:ConnectionRepository,gameId:string) {
    const visible = grid.getVisible()
    const around = grid.getAround()
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"create",visible:visible,around:around,long:grid.long,larg:grid.larg,flags:grid.totalflags}))
        }
    }
}

export function publishCreateSingle(grid:Demineur,connection:WebSocket){
    const visible = grid.getVisible()
    const around = grid.getAround()
    const flags = grid.getFlags()
    connection.send(JSON.stringify({type:"createall",visible:visible,around:around,long:grid.long,larg:grid.larg,flags:grid.totalflags,bombs:grid.bombs,allflags:flags}))
}

export function publishClear(grid:Demineur,connections:ConnectionRepository,gameId:string,liste:[number,number,number,boolean][]) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"clear",liste:liste}))
        }
    }
}

export function publishFlag(grid:Demineur,connections:ConnectionRepository,gameId:string,isflag:boolean,isdone:boolean,color:string,x:number,y:number) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"flag",isflag:isflag,isdone:isdone,color:color,x:x,y:y}))
        }
    }
}

export function publishReload(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"reload"}))
        }
    }
}

export function publishMessage(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string,mess:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"message",mess:mess}))
        }
    }
}

export function publishPlayerJoin(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string,joueur:Joueur) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"join",joueur:joueur}))
        }
    }
}

export function publishPlayerLeave(grid:Demineur|Versus,connections:ConnectionRepository,gameId:string,joueur:Joueur) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.send(JSON.stringify({type:"leave",joueur:joueur,long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
        }
    }
}

export function publishPlayersIn(grid:Demineur|Versus,connection:WebSocket) {
    connection.send(JSON.stringify({type:"allplayers",joueurs:grid.joueurs,leader:grid.leader}))
    if (grid.play == false) {
        connection.send(JSON.stringify({type:"waiting",long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
    }
}