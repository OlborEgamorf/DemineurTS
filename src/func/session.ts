export type PlayerSession = {
    id:string,
    name:string,
    signature:string,
}

export function saveSession (session:PlayerSession):PlayerSession {
    localStorage.setItem("playerId",session.id)
    localStorage.setItem("name",session.name)
    localStorage.setItem("signature",session.signature)
    return session
}

export function getSession ():PlayerSession|null {
    const playerId = localStorage.getItem("playerId")
    const name = localStorage.getItem("name")
    const signature = localStorage.getItem("signature")
    
    if (!signature || !name || !playerId) {
        return null
    } else {
        return {id:playerId,name:name,signature:signature}
    }
}