
function callCreate(long:number,larg:number,bombs:number,i:number,j:number):void {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            var data=JSON.parse(httpRequest.response)
            var visible:boolean[][]=data["visible"]
            var around:number[][]=data["around"]

            $("#board").empty()

            for (var x=0;x<long;x++) {
                var tr = $("<tr></tr>")
                for (var y=0;y<larg;y++) {
                    if (visible[x][y] == true) {
                        if (around[x][y] == 0) {
                            $(tr).append(`<td class='revealed' data-row='${x}' data-col='${y}'></td>`)
                        } else {
                            $(tr).append(`<td class='revealed' data-row='${x}' data-col='${y}'>${around[x][y]}</td>`)
                        }
                        
                    } else {
                        $(tr).append(`<td class='game-cell' data-row='${x}' data-col='${y}'></td>`)
                    }
                }
                $("#board").append(tr)
            }
        }    
    }
    httpRequest.open("GET",`/game/create?long=${long}&larg=${larg}&bombs=${bombs}&xstart=${i}&ystart=${j}`,true)
    httpRequest.send()
}