"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.saveSession = void 0;
function saveSession(session) {
    localStorage.setItem("playerId", session.id);
    localStorage.setItem("name", session.name);
    localStorage.setItem("signature", session.signature);
    return session;
}
exports.saveSession = saveSession;
function getSession() {
    const playerId = localStorage.getItem("playerId");
    const name = localStorage.getItem("name");
    const signature = localStorage.getItem("signature");
    if (!signature || !name || !playerId) {
        return null;
    }
    else {
        return { id: playerId, name: name, signature: signature };
    }
}
exports.getSession = getSession;
