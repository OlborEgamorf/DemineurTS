import { WebSocket } from "@fastify/websocket";
import { Player } from "../../types";

export class ConnectionRepository {
    constructor (
        private connections = new Map<Player["id"], Map<string, WebSocket>>
    ) {

    }

    persist (playerId:Player["id"],gameId:string,connection:WebSocket) {
        if (!this.connections.has(playerId)) {
            this.connections.set(playerId,new Map<string,WebSocket>())
        }

        this.connections.get(playerId)!.set(gameId,connection)
    }

    remove (playerId:Player["id"],gameId:string) {
        this.connections.get(playerId)?.delete(gameId)
        if (this.connections.get(playerId)?.size == 0) {
            this.connections.delete(playerId)
        }
    }

    find (playerId:Player["id"],gameId:string):WebSocket|undefined {
        return this.connections.get(playerId)?.get(gameId)
    }

    has (playerId:Player["id"],gameId:string):boolean {
        return !!this.connections.get(playerId)?.has(gameId)
    }
}