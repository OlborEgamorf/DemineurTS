
import { dirname } from "path/posix";
import { Request, Response, response } from "express";
import { createGrid, Demineur } from "./demineur.js";

var express = require("express");
var fs = require('fs');
let session = require("express-session");

var app = express();

// let PI = JSON.parse(fs.readFileSync('ObjetDescription.json', 'utf8'));


app.listen(8888);

app.set('view engine', 'ejs')

app.use(session({
    secret: 'lol',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

app.use(express.static('static'))
app.use(express.static('dist'))

var dictJeux:Demineur[] = []

app.get('/', function (req:Request, res:Response) {
    res.render('demineur.ejs', {long:20,larg:20,bombs:100});
});

app.get("/game/create", function (req:Request, res:Response) {
    var long = req.query["long"]
    var larg = req.query["larg"]
    var bombs = req.query["bombs"]
    var xstart = req.query["xstart"]
    var ystart = req.query["ystart"]
    console.log(long,larg,bombs,xstart,ystart)
    var grid = createGrid(Number(long),Number(larg),Number(bombs),Number(xstart),Number(ystart))
    
    if (grid == undefined) {
        res.send("ERROR")
    } else {
        dictJeux.push(grid)
        res.send({"visible":grid.getVisible(),"around":grid.getAround()})
    }
});

app.get("/game/clearcase")

// e