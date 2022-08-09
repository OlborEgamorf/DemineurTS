import { SocketStream } from "@fastify/websocket";
import { Demineur, Joueur } from "../func/demineur";
import { ConnectionRepository } from "./repositories/ConnectionRepository";

export function publishBlank(grid:Demineur,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"blank",long:grid.long,larg:grid.larg,bombs:grid.bombs,flags:grid.totalflags}))
        }
    }
}

export function publishBlankSingle(grid:Demineur,connection:SocketStream){
    connection.socket.send(JSON.stringify({type:"blank",long:grid.long,larg:grid.larg,bombs:grid.bombs,flags:grid.totalflags}))
}

export function publishValues(grid:Demineur,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection && player.id != grid.leader) {
            connection.socket.send(JSON.stringify({type:"values",long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
        }
    }
}

export function publishCreate(grid:Demineur,connections:ConnectionRepository,gameId:string) {
    const visible = grid.getVisible()
    const around = grid.getAround()
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"create",visible:visible,around:around,long:grid.long,larg:grid.larg,flags:grid.totalflags}))
        }
    }
}

export function publishCreateSingle(grid:Demineur,connection:SocketStream){
    const visible = grid.getVisible()
    const around = grid.getAround()
    const flags = grid.getFlags()
    connection.socket.send(JSON.stringify({type:"createall",visible:visible,around:around,long:grid.long,larg:grid.larg,flags:grid.totalflags,bombs:grid.bombs,allflags:flags}))
}

export function publishClear(grid:Demineur,connections:ConnectionRepository,gameId:string,liste:[number,number,number,boolean][],nom:string,isdone:boolean) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"clear",liste:liste,nom:nom,isdone:isdone}))
        }
    }
}

export function publishFlag(grid:Demineur,connections:ConnectionRepository,gameId:string,isflag:boolean,isdone:boolean,color:string,x:number,y:number) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"flag",isflag:isflag,isdone:isdone,color:color,x:x,y:y}))
        }
    }
}

export function publishReload(grid:Demineur,connections:ConnectionRepository,gameId:string) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"reload"}))
        }
    }
}

export function publishPlayerJoin(grid:Demineur,connections:ConnectionRepository,gameId:string,joueur:Joueur) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"join",joueur:joueur}))
        }
    }
}

export function publishPlayerLeave(grid:Demineur,connections:ConnectionRepository,gameId:string,joueur:Joueur) {
    for (const player of grid.joueurs) {
        const connection = connections.find(player.id,gameId)
        if (connection) {
            connection.socket.send(JSON.stringify({type:"leave",joueur:joueur,long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
        }
    }
}

export function publishPlayersIn(grid:Demineur,connection:SocketStream) {
    connection.socket.send(JSON.stringify({type:"allplayers",joueurs:grid.joueurs,leader:grid.leader}))
    if (grid.play == false) {
        connection.socket.send(JSON.stringify({type:"waiting",long:grid.long,larg:grid.larg,bombs:grid.bombs,leader:grid.leader}))
    }
}