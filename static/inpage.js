"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket = null;
var time = null;
var lead = false;
var notif = 0;
// Création d'une websocket pour une partie classique
function createSocket(gameid) {
    // 
    const session = getSession();
    const searchParams = new URLSearchParams({ ...session, gameid });
    socket = new WebSocket(`${window.location.protocol.replace("http", "ws")}//${window.location.host}/ws?${searchParams.toString()}`);
    socket.addEventListener('message', function (event) {
        let data = JSON.parse(event.data);
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
            setWait(data, false);
            setStart(data);
            setCreate(data);
        }
        else if (data.type == "reload") {
            reload();
        }
        else if (data.type == "join") {
            setJoin(data);
            announceJoin(data);
        }
        else if (data.type == "leave") {
            setLeave(data, false);
            announceLeave(data);
        }
        else if (data.type == "allplayers") {
            setAllPlayers(data, session.id);
        }
        else if (data.type == "waiting" || data.type == "values") {
            setWait(data, false);
        }
        else if (data.type == "message") {
            setMessage(data);
        }
        else if (data.type == "closed") {
            announceError("Après trop de temps inactif, votre session a été deconnectée.");
        }
        else if (data.type == "err") {
            announceError(data.mess);
        }
    });
    setInterval(function () {
        socket.send(JSON.stringify({ type: "ping" }));
    }, 30000);
}
function createSocketVersus(gameid) {
    const session = getSession();
    const searchParams = new URLSearchParams({ ...session, gameid });
    socket = new WebSocket(`${window.location.protocol.replace("http", "ws")}//${window.location.host}/wsversus?${searchParams.toString()}`);
    socket.addEventListener('message', function (event) {
        let data = JSON.parse(event.data);
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
            announceJoin(data);
        }
        else if (data.type == "leave") {
            setLeave(data, true);
            announceLeave(data);
        }
        else if (data.type == "allplayers") {
            setAllPlayers(data, session.id);
        }
        else if (data.type == "waiting" || data.type == "values") {
            setWait(data, true);
        }
        else if (data.type == "message") {
            setMessage(data);
        }
    });
}
function setWait(data, versus) {
    let leader = data["leader"];
    let long = data["long"];
    let larg = data["larg"];
    let bombs = data["bombs"];
    let max = Math.floor(data["larg"] * data["long"] * 0.7);
    if (leader == localStorage.getItem("playerId")) {
        lead = true;
        $("#inputs").empty();
        $("#inputs").append(`
            <div class="sliders">
                <div class="span-input">Lignes : <span id="sp-rows">${long}</span><br><input type="range" value="${long}" min="5" max="40" id="rows"></div>
                <div class="span-input">Colonnes : <span id="sp-cols">${larg}</span><br><input type="range" value="${larg}" min="5" max="40" id="cols"></div>
                <div class="span-input">Bombes : <span id="sp-bombs">${bombs}</span><br><input type="range" value="${bombs}" min="5" max="${max}" id="bombs"></div>
            </div>
        `);
        $("#container-inputs").append(`
            <div class="container-buttons">
                <img src="/static/save.svg" onclick="addPreset()" id="container-save" class="img-button" alt="">
                <input type="button" onclick="callStart()" value="Jouer !">
            </div>
        `);
        $("#inputs").append(`<div class="presets" id="presets"></div>`);
        for (let i = 0; i < Number(localStorage.getItem("nbPresets")); i++) {
            let preset = localStorage.getItem("preset" + i);
            if (preset) {
                let params = preset.split(";");
                $("#presets").append(`<div class="infos infos-preset" id="preset-${i}" onclick="playPreset(${i})"><p>Taille - ${params[0]} x ${params[1]}</p><p>Bombes - ${params[2]}</p><img src="/static/remove.svg" class="trash" alt="" onclick="delPreset(${i})"></div>`);
            }
        }
        $("input[type=range]").on("input", function () {
            let a = $(this).val();
            if (typeof a === "string") {
                $("#sp-" + this.id).html(a);
            }
            if (this.id == "cols" || this.id == "rows") {
                let a = $("#cols").val();
                let b = $("#rows").val();
                if (typeof a === "string" && typeof b === "string") {
                    let max = Math.floor(Number.parseInt(a) * Number.parseInt(b) * 0.7);
                    $("#bombs").attr({ max: max });
                    let c = $("#bombs").val();
                    if (typeof c === "string") {
                        $("#bombs").val(Number.parseInt(c) > max ? max : c);
                        $("#sp-bombs").html((Number.parseInt(c) > max ? max : c).toString());
                    }
                }
            }
        });
        $("input[type=range]").on("change", function () {
            callValues();
        });
    }
    else {
        $("#inputs").html(`
            <span class="span-input">Lignes - ${long}</span>
            <span class="span-input">Colonnes - ${larg}</span>
            <span class="span-input">Bombes - ${bombs}</span>`);
        if (versus) {
            $("#inputs").append(`<input type="button" onclick="callReady()" value="Prêt !">`);
        }
    }
    $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.svg'> <span id="counting" data-count="0" data-total="0">0</span>`);
    $("#bo").html(`0`);
    $("#timer").html(`00 : 00`);
}
function callValues() {
    let long = Number($("#rows").val());
    let larg = Number($("#cols").val());
    let bombs = Number($("#bombs").val());
    socket.send(JSON.stringify({ type: "values", long: long, larg: larg, bombs: bombs }));
}
function callStart() {
    socket.send(JSON.stringify({ type: "start" }));
}
function callReady() {
    socket.send(JSON.stringify({ type: "ready" }));
}
function setStart(data) {
    let long = data["long"];
    let larg = data["larg"];
    let bombs = data["bombs"];
    let flags = data["flags"];
    if (long < 5 || larg < 5 || bombs < 5 || long > 100 || larg > 100 || bombs > 3000 || long * larg < bombs) {
        return false;
    }
    else {
        $("#container-inputs").css("display", "none");
        $("#container-count").css("display", "flex");
        $("#container-board").css("display", "flex");
        $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.svg'> <span id="counting" data-count="${flags}" data-total="${bombs}">${flags}</span>`);
        $("#bo").html(bombs.toString());
        for (let i = 0; i < long; i++) {
            let tr = $("<tr></tr>");
            for (let j = 0; j < larg; j++) {
                $(tr).append(`<td id="${i}_${j}" data-row='${i}' data-col='${j}' onclick="callCreate(${i},${j})"></td>`);
            }
            $("#board").append(tr);
        }
        return true;
    }
}
function callCreate(i, j) {
    socket.send(JSON.stringify({ type: "create", xstart: i, ystart: j }));
    let td = $(`#${i}_${j}`);
    td.addClass("revealed");
    td.addClass("c0");
}
function setCreate(data) {
    let visible = data["visible"];
    let long = data["long"];
    let larg = data["larg"];
    for (let x = 0; x < long; x++) {
        for (let y = 0; y < larg; y++) {
            let td = $(`#${x}_${y}`);
            td.attr("onclick", `callClear(this,${x},${y})`);
            if (visible[x][y] >= 0) {
                td.addClass("revealed");
                td.addClass(`c${visible[x][y]}`);
                if (visible[x][y] != 0) {
                    td.append(`${visible[x][y]}`);
                }
            }
            else {
                if (visible[x][y] == -1) {
                    $(td).append(`<img src='/static/flag${localStorage.getItem("color")}.svg' class='flag'>`);
                }
                $(td).attr(`oncontextmenu`, `callFlag(this,${x},${y})`);
            }
        }
    }
    startTimer(data["timer"]);
}
function setJoin(data) {
    let joueur = data["joueur"];
    if (joueur.id == data["leader"]) {
        $("#container-joueurs").append(`<div class="infos" id=${joueur.id}><img src='/static/flag${joueur.color}.svg' class='flag count'> <img src='/static/crown.svg' class='flag count'>${joueur.nom}</div>`);
    }
    else {
        $("#container-joueurs").append(`<div class="infos" id=${joueur.id}><img src='/static/flag${joueur.color}.svg' class='flag count'>${joueur.nom}</div>`);
    }
}
function announceJoin(data) {
    let joueur = data["joueur"];
    if (joueur.id != localStorage.getItem("playerId")) {
        $("#container-messages").append(`
            <div class="joined">
                <p><strong>${joueur.nom}</strong> a rejoint la partie !</p>
                <img src="/static/cross.svg" alt="" class="closeNotif">
            </div>
        `);
        $(".closeNotif").on("click", function () {
            $(this).parent().remove();
        });
    }
}
function setLeave(data, versus) {
    let joueur = data["joueur"];
    $(`#${joueur.id}`).remove();
    if (data["leader"] == localStorage.getItem("playerId") && !lead) {
        setWait(data, versus);
    }
}
function announceLeave(data) {
    let joueur = data["joueur"];
    if (joueur.id != localStorage.getItem("playerId")) {
        $("#container-messages").append(`
            <div class="left">
                <p><strong>${joueur.nom}</strong> a quitté la partie.</p>
                <img src="/static/cross.svg" alt="" class="closeNotif">
            </div>
        `);
        $(".closeNotif").on("click", function () {
            $(this).parent().remove();
        });
    }
}
function announceError(message) {
    $("#container-messages").append(`
        <div class="left">
            <p>${message}</p>
            <img src="/static/cross.svg" alt="" class="closeNotif">
        </div>
    `);
    $(".closeNotif").on("click", function () {
        $(this).parent().remove();
    });
}
function setAllPlayers(data, id) {
    for (let joueur of data["joueurs"]) {
        if (joueur.id != id) {
            setJoin({ joueur: joueur, leader: data["leader"] });
        }
    }
}
function callClear(caseG, i, j) {
    if ($(caseG).hasClass("revealed")) {
        socket.send(JSON.stringify({ type: "cleararound", x: i, y: j }));
    }
    else {
        socket.send(JSON.stringify({ type: "clear", x: i, y: j }));
    }
}
function setClear(data) {
    let clear = data["liste"];
    for (let coord of clear) {
        $(`#${coord.x}_${coord.y}`).addClass("revealed");
        $(`#${coord.x}_${coord.y}`).addClass(`c${coord.around}`);
        if (coord.isbomb) {
            $(`#${coord.x}_${coord.y}`).html("<img src='/static/bomb.svg' class='bomb'>");
        }
        else if (coord.around != 0) {
            $(`#${coord.x}_${coord.y}`).html(`${coord.around}`);
        }
    }
}
function setMessage(data) {
    let mess = data["mess"];
    for (let td of document.getElementsByTagName("td")) {
        td.setAttribute("onclick", "");
        td.setAttribute("oncontextmenu", "");
    }
    $("#allover").width("100%");
    $(".overlay-content").empty();
    $(".overlay-content").append(`<span>${mess}</span><a onclick='callReload()'>Rejouer</a><a href='/'>Retour à l'accueil</a>`);
    stopTimer();
}
function callFlag(caseG, i, j) {
    if (!$(caseG).hasClass("revealed")) {
        socket.send(JSON.stringify({ type: "flag", x: i, y: j }));
    }
}
function setFlag(data) {
    let isflag = data["isflag"];
    let x = data["x"];
    let y = data["y"];
    let color = data["color"];
    if (!color) {
        color = localStorage.getItem("color");
    }
    $(`#${x}_${y}`).empty();
    let count = document.getElementById("counting");
    let add;
    if (isflag) {
        $(`#${x}_${y}`).append(`<img src='/static/flag${color}.svg' class='flag'>`);
        add = 1;
    }
    else if (!isflag) {
        add = -1;
    }
    else {
        add = 0;
    }
    if (count != null) {
        count.dataset.count = String(Number(count.dataset.count) + add);
        $(count).html(count.dataset.count);
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
    $("#container-inputs").css("display", "flex");
    $("#container-board").css("display", "none");
    $("#container-count").css("display", "none");
    $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.svg' class='flag count'> <span id="counting" data-count="0" data-total="0">0</span>`);
    $("#bo").html("0");
    stopTimer();
    closeNav();
}
function userIndex() {
    const user = getSession();
    $("#name").val(user.name);
    $("#" + user.color).addClass("active");
    $("#name").on("input", function () {
        let name = $(this).val();
        if (typeof (name) === "string") {
            if (name.length == 0) {
                name = "Joueur sans nom";
            }
            setItem("name", name);
        }
    });
    $(".flag").on("click", function () {
        $(".active").removeClass("active");
        $(this).addClass("active");
        setItem("color", this.id);
    });
}
function startTimer(start) {
    time = setInterval(function () {
        let delta = Date.now() - start;
        $("#timer").html(`${String(Math.floor(delta / 60000)).padStart(2, '0')} : ${String(Math.floor(delta / 1000 % 60)).padStart(2, '0')}`);
    }, 1000);
}
function stopTimer() {
    if (time) {
        clearInterval(time);
        $("#timer").html(`00 : 00`);
    }
}
function setItem(item, value) {
    localStorage.setItem(item, value);
}
function saveSession(session) {
    localStorage.clear();
    setItem("playerId", session.id);
    setItem("name", session.name);
    setItem("signature", session.signature);
    setItem("color", session.color);
    setItem("nbPresets", "0");
    return session;
}
function getSession() {
    const playerId = localStorage.getItem("playerId");
    const name = localStorage.getItem("name");
    const signature = localStorage.getItem("signature");
    const color = localStorage.getItem("color");
    if (!signature || !name || !playerId || !color) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open("POST", `/api/players`, false);
        httpRequest.send();
        const response = JSON.parse(httpRequest.response);
        const session = { ...response, name: "Joueur sans nom", color: "Rouge" };
        saveSession(session);
        return session;
    }
    else {
        return { id: playerId, name: name, signature: signature, color: color };
    }
}
function addPreset() {
    let long = Number($("#rows").val());
    let larg = Number($("#cols").val());
    let bombs = Number($("#bombs").val());
    let nbPresets = Number(localStorage.getItem("nbPresets"));
    $("#presets").append(`<div class="infos infos-preset" id="preset-${nbPresets}" onclick="playPreset(${nbPresets})"><p>Taille - ${long} x ${larg}</p><p>Bombes - ${bombs}</p><img src="/static/remove.svg" class="trash" alt="" onclick="delPreset(${nbPresets})"></div>`);
    setItem("preset" + nbPresets++, `${long};${larg};${bombs}`);
    setItem("nbPresets", nbPresets.toString());
}
function delPreset(idPreset) {
    localStorage.removeItem("preset" + idPreset);
    $("#preset-" + idPreset).remove();
}
function playPreset(idPreset) {
    let preset = localStorage.getItem("preset" + idPreset);
    if (preset) {
        let params = preset.split(";");
        $("#rows").val(params[0]);
        $("#sp-rows").html(params[0]);
        $("#cols").val(params[1]);
        $("#sp-cols").html(params[1]);
        $("#bombs").attr("max", Number(params[0]) * Number(params[1]) * 0.7);
        $("#bombs").val(params[2]);
        $("#sp-bombs").html(params[2]);
        callValues();
    }
}
