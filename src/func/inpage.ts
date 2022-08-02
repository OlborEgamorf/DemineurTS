function createBlank():boolean {
    var long:number = Number($("#rows").val())
    var larg:number = Number($("#cols").val())
    var bombs:number = Number($("#bombs").val())
    
    if (long == NaN || larg == NaN || bombs == NaN || long<5 || larg<5 || bombs<5 || long>100 || larg>100 || bombs>3000 || long*larg<bombs) {
        return false
    } else {
        $("#inputs").css("display","none")
        $("#confirm").css("display","none")
        $("#container-count").css("display","flex")
        $("#container-reload").css("display","flex")
        $("#counting").empty()
        $("#counting").append(`0/${bombs}`)
        $("#counting").attr("data-total",String(bombs))
        for (var i=0;i<long;i++) {
            var tr = $("<tr></tr>")
            for (var j=0;j<larg;j++) {
                $(tr).append(`<td id="${i}_${j}" class="game-cell" data-row='${i}' data-col='${j}' onclick="callCreate(${long},${larg},${bombs},${i},${j})"></td>`)
            }
            $("#board").append(tr)
        }
        return true
    }
    
}


function callCreate(long:number,larg:number,bombs:number,i:number,j:number):void {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            var data=JSON.parse(httpRequest.response)
            var visible:boolean[][]=data["visible"]
            var around:number[][]=data["around"]

            for (var x=0;x<long;x++) {
                for (var y=0;y<larg;y++) {

                    var td = $(`#${x}_${y}`)
                    console.log(td)
                    td.attr("onclick",`callClear(this,${x},${y})`)

                    if (visible[x][y] == true) {
                        td.removeClass("game-cell")
                        td.addClass("revealed")
                        td.addClass(`c${around[x][y]}`)
                        if (around[x][y] != 0) {
                            td.append(`${around[x][y]}`) 
                        }                       
                    } else {
                        $(td).attr(`oncontextmenu`,`callFlag(this,${x},${y})`)
                    }
                }
            }
        }    
    }
    httpRequest.open("GET",`/game/create?long=${long}&larg=${larg}&bombs=${bombs}&xstart=${i}&ystart=${j}`,true)
    httpRequest.send()
}

function callClear(caseG:HTMLElement,x:number,y:number):void {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            var data=JSON.parse(httpRequest.response)
            var clear:[number, number, number, boolean][]=data["clear"]
            var defeat:boolean=false
            for (var coord of clear) {
                $(`#${coord[0]}_${coord[1]}`).addClass("revealed")
                $(`#${coord[0]}_${coord[1]}`).addClass(`c${coord[2]}`)
                $(`#${coord[0]}_${coord[1]}`).removeClass(`game-cell`)
                $(`#${coord[0]}_${coord[1]}`).empty()
                if (coord[3] == true) {
                    $(`#${coord[0]}_${coord[1]}`).append("<img src='bomb.png' class='bomb'>")
                    defeat=true
                } else if (coord[2]!= 0) {
                    $(`#${coord[0]}_${coord[1]}`).append(`${coord[2]}`)
                }
            }
            if (defeat == true) {
                for (var td of document.getElementsByTagName("td")) {
                    td.setAttribute("onclick","")
                    td.setAttribute("oncontextmenu","")
                }
                $("#allover").width("100%")
                $(".overlay-content").empty()
                $(".overlay-content").append("<span>Vous avez perdu !</span><a onclick='reload()'>Rejouer</a><a>Retour à l'accueil</a>")
            }
        }    
    }
    if ($(caseG).hasClass("revealed") == true) {
        httpRequest.open("GET",`/game/cleararound?x=${x}&y=${y}`,true)
    } else {
        httpRequest.open("GET",`/game/clear?x=${x}&y=${y}`,true)
    }
    httpRequest.send()
}

function callFlag(caseG:HTMLElement,x:number,y:number):boolean {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            var data=JSON.parse(httpRequest.response)
            var isflag:boolean=data["isflag"]
            var isdone:boolean=data["isdone"]

            $(`#${x}_${y}`).empty()
            var count = document.getElementById("counting")
            if (isflag == true) {
                $(`#${x}_${y}`).append("<img src='flag.png' class='flag'>")
                var add:number = 1
            } else if (isflag == false) {
                var add:number = -1 
            } else {
                var add:number = 0
            }

            if (count != null) {
                count.dataset.count = String(Number(count.dataset.count) + add)
                $(count).empty()
                $(count).append(`${count.dataset.count}/${count.dataset.total}`)
            }

            if (isdone == true) {
                $("#allover").width("100%")
                $(".overlay-content").empty()
                $(".overlay-content").append("<span>Grille nettoyée ! Bravo !</span><a onclick='reload()'>Rejouer</a><a>Retour à l'accueil</a>")
            }
        }
    }

    if ($(caseG).hasClass("revealed") == false) {
        httpRequest.open("GET",`/game/flag?x=${x}&y=${y}`,true)
        httpRequest.send()
    }  
    return false
}

function closeNav(){
    $("#allover").width("0%")
}

function reload(long:number,larg:number,bombs:number){
    $("#board").empty()
    $("#inputs").css("display","flex")
    $("#confirm").css("display","flex")
    $("#container-count").css("display","none")
    $("#container-reload").css("display","none")
    closeNav()
}