import {Entry} from "../func/demineur";

var socket:null|WebSocket = null
var time:null|NodeJS.Timeout = null

// Création d'une websocket pour une partie classique
function createSocket(gameid:string):void {
    // 
    const session = getSession()
    const searchParams = new URLSearchParams({...session,gameid})

    socket = new WebSocket(`${window.location.protocol.replace("http","ws")}//${window.location.host}/ws?${searchParams.toString()}`)
    socket.addEventListener('message', function (event) {
        var data = JSON.parse(event.data)
        console.log(data,data["type"])
        if (data["type"] == "blank") {
            setStart(data)
        } else if (data.type == "create") {
            setCreate(data)
        } else if (data.type == "flag") {
            setFlag(data)
        } else if (data.type == "clear") {
            setClear(data)
        } else if (data.type == "createall") {
            setStart(data)
            setCreate(data)
        } else if (data.type == "reload") {
            reload()
        } else if (data.type == "join") {
            setJoin(data)
        } else if (data.type == "leave") {
            setLeave(data,false)
        } else if (data.type == "allplayers") {
            setAllPlayers(data,session!.id)
        } else if (data.type == "waiting" || data.type == "values") {
            setWait(data,false)
        } else if (data.type == "message") {
            setMessage(data)
        }
    })
    setInterval(function () {
        socket!.send(JSON.stringify({type:"ping"}))
    }, 30000)
}

function createSocketVersus(gameid:string):void {
    const session = getSession()

    const searchParams = new URLSearchParams({...session,gameid})

    socket = new WebSocket(`${window.location.protocol.replace("http","ws")}//${window.location.host}/wsversus?${searchParams.toString()}`)
    socket.addEventListener('message', function (event) {
        var data = JSON.parse(event.data)
        console.log(data,data["type"])
        if (data["type"] == "blank") {
            setStart(data)
        } else if (data.type == "create") {
            setCreate(data)
        } else if (data.type == "flag") {
            setFlag(data)
        } else if (data.type == "clear") {
            setClear(data)
        } else if (data.type == "createall") {
            setStart(data)
            setCreate(data)
        } else if (data.type == "reload") {
            reload()
        } else if (data.type == "join") {
            setJoin(data)
        } else if (data.type == "leave") {
            setLeave(data,true)
        } else if (data.type == "allplayers") {
            setAllPlayers(data,session!.id)
        } else if (data.type == "waiting" || data.type == "values") {
            setWait(data,true)
        } else if (data.type == "message") {
            setMessage(data)
        }
    })
}


function setWait(data:any,versus:boolean):void {
    var leader:string = data["leader"]
    var long:number = data["long"]
    var larg:number = data["larg"]
    var bombs:number = data["bombs"]
    var max:number = Math.floor(data["larg"]*data["long"]*0.7)
    console.log(leader, localStorage.getItem("playerId"));
    
    if (leader == localStorage.getItem("playerId")) {
        $("#inputs").html(`
            <div class="title-infos">Paramètres</div>
            <div class="trait"></div>
            <div class="infos">30 / 24 / 156</div>
            <div class="infos">15 / 15 / 40</div>
            <div class="infos">25 / 15 / 85</div>
            <div class="span-input">Lignes : <span id="sp-rows">${long}</span><br><input type="range" value="${long}" min="5" max="30" id="rows"></div>
            <div class="span-input">Colonnes : <span id="sp-cols">${larg}</span><br><input type="range" value="${larg}" min="5" max="30" id="cols"></div>
            <div class="span-input">Bombes : <span id="sp-bombs">${bombs}</span><br><input type="range" value="${bombs}" min="5" max="${max}" id="bombs"></div>
            <input type="button" onclick="callStart()" value="Jouer !">
        `)

        $("input[type=range]").on("input", function() {
            var a = $(this).val()
            if (typeof a === "string") {
                $("#sp-"+this.id).html(a)
            }

            if (this.id == "cols" || this.id == "rows") {
                var a = $("#cols").val()
                var b = $("#rows").val()
                if (typeof a === "string" && typeof b === "string") {
                    var max:number = Math.floor(Number.parseInt(a)*Number.parseInt(b)*0.7)
                    $("#bombs").attr({max:max})
                    var c = $("#bombs").val()
                    if (typeof c === "string") {
                        $("#bombs").val(Number.parseInt(c) > max ? max : c)
                        $("#sp-bombs").html((Number.parseInt(c) > max ? max : c).toString())
                    }   
                }
            }
        })

        $("input[type=range]").on("focusout", function() {
            callValues()
        })

    } else {
        $("#inputs").html(`
        <div class="title-infos">Paramètres</div>
        <div class="trait"></div>
        <span class="span-input">Lignes<br>${long}</span>
        <span class="span-input">Colonnes<br>${larg}</span>
        <span class="span-input">Bombes<br>${bombs}</span>`)
        if (versus) {
            $("#inputs").append(`<input type="button" onclick="callReady()" value="Prêt !">`)
        }
    }

    $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.png' class='flag count'> <span id="counting" data-count="0" data-total="0">0</span>`)
    $("#bo").html(`<img src='/static/bomb.png' class='flag count'>0`)
}

function callValues():void {
    var long:number = Number($("#rows").val())
    var larg:number = Number($("#cols").val())
    var bombs:number = Number($("#bombs").val())
    socket!.send(JSON.stringify({type:"values",long:long,larg:larg,bombs:bombs}))
}

function callStart():void {
    socket!.send(JSON.stringify({type:"start"}))
}

function callReady():void {
    socket!.send(JSON.stringify({type:"ready"}))
}

function setStart(data:any):boolean {
    var long:number = data["long"]
    var larg:number = data["larg"]
    var bombs:number = data["bombs"]
    var flags:number = data["flags"]
      
    if (long<5 || larg<5 || bombs<5 || long>100 || larg>100 || bombs>3000 || long*larg<bombs) {
        return false
    } else {
        $("#inputs").css("display","none")
        $("#container-board").css("display","flex")
        $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.png' class='flag count'> <span id="counting" data-count="${flags}" data-total="${bombs}">${flags}</span>`)
        $("#bo").html(`<img src='/static/bomb.png' class='flag count'>${bombs}`)
        
        for (var i=0;i<long;i++) {
            var tr = $("<tr></tr>")
            for (var j=0;j<larg;j++) {
                $(tr).append(`<td id="${i}_${j}" data-row='${i}' data-col='${j}' onclick="callCreate(${i},${j})"></td>`)
            }
            $("#board").append(tr)
        }

        return true
    }
}


function callCreate(i:number,j:number):void {
    socket!.send(JSON.stringify({type:"create",xstart:i,ystart:j}))
    var td = $(`#${i}_${j}`)
    td.addClass("revealed")
    td.addClass("c0")
}

function setCreate(data:any):void {
    var visible:number[][]=data["visible"]
    var long:number = data["long"]
    var larg:number = data["larg"]

    for (var x=0;x<long;x++) {
        for (var y=0;y<larg;y++) {

            var td = $(`#${x}_${y}`)
            td.attr("onclick",`callClear(this,${x},${y})`)

            if (visible[x][y] >= 0) {
                td.addClass("revealed")
                td.addClass(`c${visible[x][y]}`)
                if (visible[x][y] != 0) {
                    td.append(`${visible[x][y]}`) 
                }                       
            } else {
                if (visible[x][y] == -1) {
                    $(td).append(`<img src='/static/flag${localStorage.getItem("color")}.png' class='flag'>`)
                }
                $(td).attr(`oncontextmenu`,`callFlag(this,${x},${y})`)
            }
        }
    }

    startTimer(data["timer"])
}

function setJoin(data:any):void {
    var joueur = data["joueur"]
    $("#container-joueurs").append(`<div class="infos" id=${joueur.id}><img src='/static/flag${joueur.color}.png' class='flag count'>${joueur.nom}</div>`)
}

function setLeave(data:any,versus:boolean):void {
    var joueur = data["joueur"]
    $(`#${joueur.id}`).remove()

    if (data["leader"] == localStorage.getItem("playerId")) {
        setWait(data,versus)
    }
}

function setAllPlayers(data:any,id:string):void {
    for (var joueur of data["joueurs"]) {
        if (joueur.id != id) {
            setJoin({joueur:joueur})
        }
    }
}

function callClear(caseG:HTMLElement,i:number,j:number):void {
    if ($(caseG).hasClass("revealed")) {
        socket!.send(JSON.stringify({type:"cleararound",x:i,y:j}))
    } else {
        socket!.send(JSON.stringify({type:"clear",x:i,y:j}))
    }     
}

function setClear(data:any):void {
    var clear:Entry[]=data["liste"]

    for (var coord of clear) {
        $(`#${coord.x}_${coord.y}`).addClass("revealed")
        $(`#${coord.x}_${coord.y}`).addClass(`c${coord.around}`)
        if (coord.isbomb) {
            $(`#${coord.x}_${coord.y}`).html("<img src='/static/bomb.png' class='bomb'>")
        } else if (coord.around != 0) {
            $(`#${coord.x}_${coord.y}`).html(`${coord.around}`)
        }
    }
}    

function setMessage(data:any):void{
    var mess=data["mess"]
    for (var td of document.getElementsByTagName("td")) {
        td.setAttribute("onclick","")
        td.setAttribute("oncontextmenu","")
    }
    $("#allover").width("100%")
    $(".overlay-content").empty()
    $(".overlay-content").append(`<span>${mess}</span><a onclick='callReload()'>Rejouer</a><a href='/'>Retour à l'accueil</a>`)
    stopTimer()
}

function callFlag(caseG:HTMLElement,i:number,j:number):void {
    if (!$(caseG).hasClass("revealed")) {
        socket!.send(JSON.stringify({type:"flag",x:i,y:j}))
    }  
}

function setFlag(data:any):boolean {
   
    var isflag:boolean=data["isflag"]
    var x:string=data["x"]
    var y:string=data["y"]

    var color:string|null=data["color"]
    if (!color) {
        color=localStorage.getItem("color")
    }

    $(`#${x}_${y}`).empty()
    var count = document.getElementById("counting")
    if (isflag) {
        $(`#${x}_${y}`).append(`<img src='/static/flag${color}.png' class='flag'>`)
        var add:number = 1
    } else if (!isflag) {
        var add:number = -1 
    } else {
        var add:number = 0
    }

    if (count != null) {
        count.dataset.count = String(Number(count.dataset.count) + add)
        $(count).html(count.dataset.count)
    }

    return false
}

function closeNav(){
    $("#allover").width("0%")
}

function callReload():void {
    socket!.send(JSON.stringify({type:"reload"}))
}

function reload(){
    $("#board").empty()
    $("#inputs").css("display","flex")
    $("#container-board").css("display","none")
    $("#fl").html(`<img src='/static/flag${localStorage.getItem("color")}.png' class='flag count'> <span id="counting" data-count="0" data-total="0">0</span>`)
    $("#bo").html(`<img src='/static/bomb.png' class='flag count'>0`)
    stopTimer()
    closeNav()
}

function userIndex() {
    const user = getSession()

    $("#name").val(user.name)
    $("#"+user.color).addClass("active")

    $("#name").on("input", function() {
        var name = $(this).val()
        if (typeof(name) === "string") {
            if (name.length == 0) {
                name = "Joueur sans nom"
            }
            setItem("name", name)
        }
    })

    $(".flag").on("click", function() {
        $(".active").removeClass("active")
        $(this).addClass("active")
        setItem("color", this.id)
    })
}

function startTimer(start:number) {
    time = setInterval(function() {
        var delta = Date.now() - start; 
        $("#timer").html(`${String(Math.floor(delta / 60000)).padStart(2, '0')} : ${String(Math.floor(delta / 1000 % 60)).padStart(2, '0')}`);
    }, 1000);
}

function stopTimer() {
    if (time) {
        clearInterval(time)
        $("#timer").html(`00 : 00`);
    }
}

export type PlayerSession = {
    id:string,
    name:string,
    signature:string,
    color:string,
}

function setItem(item:string, value:string):void {
    localStorage.setItem(item, value)
}

function saveSession (session:PlayerSession):PlayerSession {
    localStorage.clear()
    localStorage.setItem("playerId",session.id)
    localStorage.setItem("name",session.name)
    localStorage.setItem("signature",session.signature)
    localStorage.setItem("color",session.color)
    return session
}

function getSession():PlayerSession {
    const playerId = localStorage.getItem("playerId")
    const name = localStorage.getItem("name")
    const signature = localStorage.getItem("signature")
    const color = localStorage.getItem("color")
    
    if (!signature || !name || !playerId || !color) {
        var httpRequest = new XMLHttpRequest()
        httpRequest.open("POST",`/api/players`,false)
        httpRequest.send()

        const response = JSON.parse(httpRequest.response)
        const session = {...response, name:"Joueur sans nom", color:"Rouge"}
        saveSession(session)
        
        return session
    } else {
        return {id:playerId,name:name,signature:signature,color:color}
    }
}