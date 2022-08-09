"use strict";
//import ReconnectingWebSocket from "reconnecting-websocket"
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.saveSession = void 0;
var socket = null;
function createSocket(gameid) {
    const session = getSession();
    const searchParams = new URLSearchParams({ ...session, gameid });
    socket = new WebSocket(`${window.location.protocol.replace("http", "ws")}//${window.location.host}/ws?${searchParams.toString()}`);
    socket.addEventListener('message', function (event) {
        var data = JSON.parse(event.data);
        console.log(data, data["type"]);
        if (data["type"] == "blank") {
            setStart(data);
        }
        else if (data.type == "create") {
            setCreate(data);
        }
        else if (data.type == "flag") {
            setFlag(data);
        }
        else if (data.type == "clear") {
            setClear(data);
        }
        else if (data.type == "createall") {
            setStart(data);
            setCreate(data);
        }
        else if (data.type == "reload") {
            reload();
        }
        else if (data.type == "join") {
            setJoin(data);
        }
        else if (data.type == "leave") {
            setLeave(data);
        }
        else if (data.type == "allplayers") {
            setAllPlayers(data, session.id);
        }
        else if (data.type == "waiting" || data.type == "values") {
            setWait(data);
        }
    });
}
function setWait(data) {
    var leader = data["leader"];
    var long = data["long"];
    var larg = data["larg"];
    var bombs = data["bombs"];
    if (leader == localStorage.getItem("playerId")) {
        $("#inputs").empty();
        $("#inputs").append(`<span class="span-input">Lignes<br><input type="number" value="${long}" min="5" max="100" id="rows" onfocusout="callValues()"></span>
        <span class="span-input">Colonnes<br><input type="number" value="${larg}" min="5" max="100" id="cols" onfocusout="callValues()"></span>
        <span class="span-input">Bombes<br><input type="number" value="${bombs}" min="5" max="3000" id="bombs" onfocusout="callValues()"></span>
        <input type="button" onclick="callStart()" value="Jouer !">`);
    }
    else {
        $("#inputs").empty();
        $("#inputs").append(`<span class="span-input">Lignes<br>${long}</span>
        <span class="span-input">Colonnes<br>${larg}</span>
        <span class="span-input">Bombes<br>${bombs}</span>`);
    }
}
function callValues() {
    var long = Number($("#rows").val());
    var larg = Number($("#cols").val());
    var bombs = Number($("#bombs").val());
    socket.send(JSON.stringify({ type: "values", long: long, larg: larg, bombs: bombs }));
}
function callStart() {
    socket.send(JSON.stringify({ type: "start" }));
}
function setStart(data) {
    var long = data["long"];
    var larg = data["larg"];
    var bombs = data["bombs"];
    var flags = data["flags"];
    if (long == NaN || larg == NaN || bombs == NaN || long < 5 || larg < 5 || bombs < 5 || long > 100 || larg > 100 || bombs > 3000 || long * larg < bombs) {
        return false;
    }
    else {
        $("#inputs").css("display", "none");
        $("#container-count").css("display", "flex");
        $("#container-count").empty();
        $("#container-count").append(`<img src='flag${localStorage.getItem("color")}.png' class='flag count'> <span id="counting" data-count="${flags}" data-total="${bombs}">${flags}/${bombs}</span>`);
        $("#container-reload").css("display", "flex");
        for (var i = 0; i < long; i++) {
            var tr = $("<tr></tr>");
            for (var j = 0; j < larg; j++) {
                $(tr).append(`<td id="${i}_${j}" class="game-cell" data-row='${i}' data-col='${j}' onclick="callCreate(${i},${j})"></td>`);
            }
            $("#board").append(tr);
        }
        return true;
    }
}
function callCreate(i, j) {
    socket.send(JSON.stringify({ type: "create", xstart: i, ystart: j }));
}
function setCreate(data) {
    var visible = data["visible"];
    var around = data["around"];
    var flags = data["allflags"];
    var long = data["long"];
    var larg = data["larg"];
    for (var x = 0; x < long; x++) {
        for (var y = 0; y < larg; y++) {
            var td = $(`#${x}_${y}`);
            td.attr("onclick", `callClear(this,${x},${y})`);
            if (visible[x][y] == true) {
                td.removeClass("game-cell");
                td.addClass("revealed");
                td.addClass(`c${around[x][y]}`);
                if (around[x][y] != 0) {
                    td.append(`${around[x][y]}`);
                }
            }
            else {
                if (!!flags && flags[x][y] == true) {
                    $(td).append(`<img src='flag${localStorage.getItem("color")}.png' class='flag'>`);
                }
                $(td).attr(`oncontextmenu`, `callFlag(this,${x},${y})`);
            }
        }
    }
}
function setJoin(data) {
    var joueur = data["joueur"];
    $("#container-joueurs").append(`<span style="margin-right:10px" id=${joueur.id}><img src='flag${joueur.color}.png' class='flag count'>${joueur.nom}</span>`);
}
function setLeave(data) {
    var joueur = data["joueur"];
    $(`#${joueur.id}`).remove();
    console.log(data["leader"] == localStorage.getItem("playerId"), $("#inputs").css("display") == "flex");
    if (data["leader"] == localStorage.getItem("playerId") == true) {
        setWait(data);
    }
}
function setAllPlayers(data, id) {
    for (var joueur of data["joueurs"]) {
        if (joueur.id != id) {
            $("#container-joueurs").append(`<span style="margin-right:10px" id=${joueur.id}><img src='flag${joueur.color}.png' class='flag count'>${joueur.nom}</span>`);
        }
    }
}
function callClear(caseG, i, j) {
    if ($(caseG).hasClass("revealed") == true) {
        socket.send(JSON.stringify({ type: "cleararound", x: i, y: j, nom: localStorage.getItem("name") }));
    }
    else {
        socket.send(JSON.stringify({ type: "clear", x: i, y: j, nom: localStorage.getItem("name") }));
    }
}
function setClear(data) {
    var clear = data["liste"];
    var nom = data["nom"];
    var isdone = data["isdone"];
    var defeat = false;
    for (var coord of clear) {
        $(`#${coord[0]}_${coord[1]}`).addClass("revealed");
        $(`#${coord[0]}_${coord[1]}`).addClass(`c${coord[2]}`);
        $(`#${coord[0]}_${coord[1]}`).removeClass(`game-cell`);
        $(`#${coord[0]}_${coord[1]}`).empty();
        if (coord[3] == true) {
            $(`#${coord[0]}_${coord[1]}`).append("<img src='bomb.png' class='bomb'>");
            defeat = true;
        }
        else if (coord[2] != 0) {
            $(`#${coord[0]}_${coord[1]}`).append(`${coord[2]}`);
        }
    }
    if (defeat == true) {
        for (var td of document.getElementsByTagName("td")) {
            td.setAttribute("onclick", "");
            td.setAttribute("oncontextmenu", "");
        }
        $("#allover").width("100%");
        $(".overlay-content").empty();
        $(".overlay-content").append(`<span>${nom} a fait exploser une bombe !</span><a onclick='callReload()'>Rejouer</a><a href='/'>Retour à l'accueil</a>`);
    }
    else if (isdone == true) {
        $("#allover").width("100%");
        $(".overlay-content").empty();
        $(".overlay-content").append("<span>Grille nettoyée ! Bravo !</span><a onclick='callReload()'>Rejouer</a><a href='/'>Retour à l'accueil</a>");
    }
}
function callFlag(caseG, i, j) {
    if ($(caseG).hasClass("revealed") == false) {
        socket.send(JSON.stringify({ type: "flag", x: i, y: j }));
    }
}
function setFlag(data) {
    var isflag = data["isflag"];
    var isdone = data["isdone"];
    var x = data["x"];
    var y = data["y"];
    var color = data["color"];
    if (!color) {
        color = localStorage.getItem("color");
    }
    $(`#${x}_${y}`).empty();
    var count = document.getElementById("counting");
    if (isflag == true) {
        $(`#${x}_${y}`).append(`<img src='flag${color}.png' class='flag'>`);
        var add = 1;
    }
    else if (isflag == false) {
        var add = -1;
    }
    else {
        var add = 0;
    }
    if (count != null) {
        count.dataset.count = String(Number(count.dataset.count) + add);
        $(count).empty();
        $(count).append(`${count.dataset.count}/${count.dataset.total}`);
    }
    if (isdone == true) {
        $("#allover").width("100%");
        $(".overlay-content").empty();
        $(".overlay-content").append("<span>Grille nettoyée ! Bravo !</span><a onclick='callReload()'>Rejouer</a><a href='/'>Retour à l'accueil</a>");
    }
    return false;
}
function closeNav() {
    $("#allover").width("0%");
}
function callReload() {
    socket.send(JSON.stringify({ type: "reload" }));
}
function reload() {
    $("#board").empty();
    $("#inputs").css("display", "flex");
    $("#container-count").css("display", "none");
    $("#container-reload").css("display", "none");
    closeNav();
}
function saveUser() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            const response = JSON.parse(httpRequest.response);
            const name = $("#name").val();
            const color = $("select").val();
            const player = saveSession({ ...response, name, color });
            window.location.replace("/");
        }
    };
    httpRequest.open("POST", `/api/players`, true);
    httpRequest.send();
}
function getName() {
    const user = getSession();
    if (!user) {
        window.location.replace("/login");
        return null;
    }
    else {
        return user.name;
    }
}
function saveSession(session) {
    localStorage.setItem("playerId", session.id);
    localStorage.setItem("name", session.name);
    localStorage.setItem("signature", session.signature);
    localStorage.setItem("color", session.color);
    return session;
}
exports.saveSession = saveSession;
function getSession() {
    const playerId = localStorage.getItem("playerId");
    const name = localStorage.getItem("name");
    const signature = localStorage.getItem("signature");
    const color = localStorage.getItem("color");
    if (!signature || !name || !playerId || !color) {
        return null;
    }
    else {
        return { id: playerId, name: name, signature: signature, color: color };
    }
}
exports.getSession = getSession;
