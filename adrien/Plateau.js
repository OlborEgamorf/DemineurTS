
var InvAff = false
var Tour = 0
var plageItem = { "Caillou": 2, "Coquillage": 2, "Crabe": 4, "FeuillePalmier": 4, "NoixDeCoco": 3 }
var foretItem = { "Caillou": 2, "Mangue": 6, "Branche": 2, "Liane": 4, "FeuillePalmier": 5 }
var PointEauItem = {"Liane" : 3, "Branche" : 5, "Poisson" : 5}
var Inventaire = ["Liane","BatonPointu","Crabe"]
var ObjetDescription = []
var tableauPlage = []
var dropZonePoubelle = document.getElementById("poubelle")
var dropZoneFabrication = document.getElementById("Fabric1")
var dropZoneUtiliser = document.getElementById("Utiliser")
var TabFabrication = []
var ListObjet = ["Poisson","Caillou", "Coquillage", "Crabe", "FeuillePalmier", "FeuillePalmier", "Liane", "Branche", "Mangue", "Silex", "NoixDeCoco", "NoixDeCocoOuverte", "CouteauDeFortune","BatonPointu","CanneAPeche"]
var NonCassable = ["CouteauDeFortune"]
var UtilisableObjet = ["NoixDeCocoOuverte","BatonPointu","Mangue","Crabe","Poisson","CanneAPeche"]
var MaxInv = 8
var Life=100
var Food=100
var DansMain = null
var Saturation=5

$().ready(function () {
    $.getJSON("http://localhost:8888/Nom", function (data) {
        ObjetDescription = data
    })
})

function recupParNom(nom) { //Recupre les descritions des objets dans la DB
    for (element of ObjetDescription) {
        if (element["Nom"] == nom) {
            return element["Description"]
        }
    }
}

function recupNomImg(lien) {
    endroit = lien.split('/')
    nom = endroit[endroit.length - 1].split(".")[0]
    return nom
}

function getRandomInt(max) { //Renvoie un entier aléatoire entre 0 et max
    return Math.floor(Math.random() * max);
}

function revoieInv(img) {
    let nom = recupNomImg(img.src)
    let myIndex = TabFabrication.indexOf(nom);
    if (myIndex !== -1) {
        TabFabrication.splice(myIndex, 1);
    }
    Inventaire.push(nom)
    actualiseFabrication()
    afficheTabInventaire()
}

function actualiseFabrication() { //Actualise l'affichage de l'onglet fabrication de l'inventaire
    HTML = ""
    for (element of TabFabrication) {
        HTML += "<img src=\"fichier/" + element + ".png\" class=\"TabImgTab\" onclick=\"revoieInv(this)\">"
    }
    document.getElementById("FabTab").innerHTML = HTML
}

function compareTabInv(tab1, tab2) {
    if (tab1 == null || tab2 == null) {
        return false
    }
    t1 = Object.values(tab1)
    t2 = Object.values(tab2)
    if (t1.length != t2.length) {
        return false
    }
    for (nom of t2) {
        let myIndex = t1.indexOf(nom);
        if (myIndex !== -1) {
            t1.splice(myIndex, 1);
        }
    }
    if (t1.length == 0) {
        console.log("eh")
        return true
    }
    return false
}

function videTabFabrication(tab) {
    console.log("oh", tab)
    for (outil of tab) {
        console.log("outil : ", outil)
        let appartien = NonCassable.indexOf(outil);
        if (appartien != -1) {
            Inventaire.push(outil)
        }
    }
}


function fabirquer(img) {
    for (element of ObjetDescription) {
        if (compareTabInv(TabFabrication, element["Recette"])) {
            if (element["Nom"]=="SacDeFortune") {
                MaxInv=12
                videTabFabrication(TabFabrication)
                TabFabrication = []
                console.log(Inventaire)
                actualiseFabrication()
                afficheTabInventaire()
                return
            }
            Inventaire.push(element["Nom"])
            videTabFabrication(TabFabrication)
            TabFabrication = []
            console.log(Inventaire)
            actualiseFabrication()
            afficheTabInventaire()
            return
        }
    }
}

function afficheTabInventaire() { //Actualise l'affichage des objets de l'inventaire
    HTML = ""
    for (element of Inventaire) {
        HTML += "<img src=\"fichier/" + element + ".png\" class=\"TabImgTab\" title=\"" + recupParNom(element) + "\">"
    }
    document.getElementById("TabInv").innerHTML = HTML
}

dropZonePoubelle.addEventListener('dragover', function (evnt) { //Gère la zone de dépot de la poubelle
    if (evnt.preventDefault) evnt.preventDefault();
    return false;
}, false);
dropZonePoubelle.addEventListener('drop', function (evnt) {
    if (evnt.stopPropagation) evnt.stopPropagation();
    var nom = evnt.dataTransfer.getData('text');
    tabNom = nom.split("/")
    nom = tabNom[tabNom.length - 1]
    nom = nom.split('.')[0]
    if (ListObjet.indexOf(nom) !== -1) {
        let myIndex = Inventaire.indexOf(nom);
        if (myIndex !== -1) {
            Inventaire.splice(myIndex, 1);
        }
        ecritMessage("Tu jète : " + nom)
        afficheTabInventaire()
    }
    evnt.preventDefault();
    return false;
}, false);


dropZoneFabrication.addEventListener('dragover', function (evnt) { //Gère la zone de dépot de l'onglet fabrication
    if (evnt.preventDefault) evnt.preventDefault();
    return false;
}, false);
dropZoneFabrication.addEventListener('drop', function (evnt) {
    if (evnt.stopPropagation) evnt.stopPropagation();
    var nom = evnt.dataTransfer.getData('text');
    tabNom = nom.split("/")
    nom = tabNom[tabNom.length - 1]
    nom = nom.split('.')[0]
    if (ListObjet.indexOf(nom) !== -1) {
        let myIndex = Inventaire.indexOf(nom);
        if (myIndex !== -1) {
            Inventaire.splice(myIndex, 1);
        }
        ecritMessage("Tu jète : " + nom)
        afficheTabInventaire()
        TabFabrication.push(nom)
        actualiseFabrication()
    }
    evnt.preventDefault();
    return false;
}, false);

dropZoneUtiliser.addEventListener('dragover', function (evnt) { //Gère la zone de dépot de l'onglet utiliser
    if (evnt.preventDefault) evnt.preventDefault();
    return false;
}, false);
dropZoneUtiliser.addEventListener('drop', function (evnt) {
    if (evnt.stopPropagation) evnt.stopPropagation();
    var nom = evnt.dataTransfer.getData('text');
    tabNom = nom.split("/")
    nom = tabNom[tabNom.length - 1]
    nom = nom.split('.')[0]
    if (UtilisableObjet.indexOf(nom) !== -1) {
        let myIndex = Inventaire.indexOf(nom);
        if (myIndex !== -1) {
            Inventaire.splice(myIndex, 1);
        }
        if (nom=="Crabe") {
            Food+=50
        }
        if (nom=="Mangue") {
            Food+=30
        }
        if (nom=="NoixDeCocoOuverte") {
            Food+=50
        }
        if (nom=="BatonPointu") {
            DansMain=nom
            actualiseMain(nom)
        }
        if (nom=="CanneAPeche") {
            console.log("OH")
            DansMain=nom
            actualiseMain(nom)
        }
        if (nom=="Poisson") {
            Food+=75
        }
        ecritMessage("Tu utilise : " + nom)
        actualiseSatsJeu()
        afficheTabInventaire()
    }
    evnt.preventDefault();
    return false;
}, false);

function videMain (imgMain) {
    DansMain=null                                                                                                                                                                                                                                                                                                                
    tabNom = imgMain.src.split("/")
    nom = tabNom[tabNom.length - 1]
    nom = nom.split('.')[0]
    Inventaire.push(nom)
    imgMain.src="fichier/DansMain.png"
    imgMain.style.width=0+"px"
    afficheTabInventaire()
}

function actualiseMain (nom) {
    imgMain=document.getElementById("DansMain")
    imgMain.src="fichier/"+nom+".png"
    imgMain.style.width=100+"px"
    return
}

function ouvreInventaire() { //Gère l'ouverture de l'inventaire
    var img = document.getElementById("invIm")
    var tab = document.getElementById("TabInv")
    var poubelle = document.getElementById("poubelle")
    var fabrication1 = document.getElementById("Fabric1")
    var fabricationList = document.getElementById("FabTab")
    var fabirquer = document.getElementById("Fabriquer")
    var utiliser = document.getElementById("Utiliser")
    var main = document.getElementById("DansMain")
    afficheTabInventaire()
    if (InvAff == false) {
        img.style.display = "grid"
        tab.style.display = "grid"
        poubelle.style.display = "grid"
        fabrication1.style.display = "grid"
        fabricationList.style.display = "grid"
        fabirquer.style.display = "grid"
        utiliser.style.display = "grid"
        main.style.display = "grid"
        InvAff = true
    }
    else {
        for (element of TabFabrication) {
            Inventaire.push(element)
        }
        TabFabrication=[]
        actualiseFabrication()
        img.style.display = "none"
        tab.style.display = "none"
        poubelle.style.display = "none"
        fabrication1.style.display = "none"
        fabricationList.style.display = "none"
        fabirquer.style.display = "none"
        utiliser.style.display = "none"
        main.style.display = "none"
        InvAff = false
    }
}

function MenuJeu() { //Gère l'ouverture du menu de jeu
    fond = document.getElementById("FondMenu")
    tab = document.getElementById("TabMenu");
    if (fond.style.display == "grid") {
        fond.style.display = "none"
        tab.style.display = "none"
    }
    else {
        fond.style.display = "grid"
        tab.style.display = "grid"
    }
}

function lancement() { //Fonction appelé au chargement du body
    var curseur = document.getElementById("CurseurImg")
    var topIm = document.getElementById("0/0")
    curseur.style.left = topIm.offsetLeft + "px"
    curseur.style.top = topIm.offsetTop + "px"
}

function actualiseSatsJeu() { //Actualise le compteur de tours
    document.getElementById("TourCompteur").innerHTML = "<span>Tour : " + Tour + "</span>";
    if (Food>100) {
        Food=100
    }
    if (Food==100) {
        Saturation=5
    }
    document.getElementById("Food").innerHTML = "<span>Nouriture : " + Food + " %</span>";
    document.getElementById("Life").innerHTML = "<span>Vie : " + Life + " pv</span>";
}

function AvanceTourStat() { //Actualise le compteur de tours
    Tour++
    document.getElementById("TourCompteur").innerHTML = "<span>Tour : " + Tour + "</span>";
    if (Food==100) Saturation--
    if (Food>0 && Saturation==0) {
        Food-=10
    }
    if (Food==0) {
        Life-=10
    }
    document.getElementById("Food").innerHTML = "<span>Nouriture : " + Food + " %</span>";
    document.getElementById("Life").innerHTML = "<span>Vie : " + Life + " pv</span>";
}

function ecritMessage(message) { //Ecrit un message dans l'onglet de communication
    document.getElementById("Text1").innerHTML = message
}

function mooveCurseur(img) { //Gère le deplacement du curseur sur l'image cliqué "img"
    //console.log(img.offsetLeft, img.offsetTop)
    let curseur = document.getElementById("CurseurImg")
    x1 = img.offsetLeft
    x2 = curseur.offsetLeft
    y1 = img.offsetTop
    y2 = curseur.offsetTop
    if (((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5 <= 75) {
        AvanceTourStat()
        curseur.style.left = img.offsetLeft + "px"
        curseur.style.top = img.offsetTop + "px"
        ecritMessage("<span>Tu te deplace</span>");
        return true
    }
    else {
        ecritMessage("<span>Oh ! Tu ne peux pas marcher jusque là !</span>");
        return false
    }
}

function creerItems(endroit) { //Créer le tableau aléatoire des objet trouvé
    tableau = []
    if (endroit == "CarteSable.png") {
        for (cle in plageItem) {
            alea = getRandomInt(plageItem[cle])
            if (alea == 0) {
                tableau.push(cle)
            }
        }
    }
    if (endroit == "CarteForet.png") {
        for (cle in foretItem) {
            alea = getRandomInt(foretItem[cle])
            if (alea == 0) {
                tableau.push(cle)
            }
        }
    }
    if (endroit == "PointEau.png") {
        for (cle in PointEauItem) {
            alea = getRandomInt(PointEauItem[cle])
            if (alea == 0) {
                tableau.push(cle)
            }
        }
    }
    return tableau
}

function attraper(obj) { //Gère les objet à recuperer
    console.log(Inventaire.length,MaxInv)
    if (Inventaire.length+1 <= MaxInv) {
        ok=true
        nom = obj.src
        tabNom = nom.split("/")
        nom = tabNom[tabNom.length - 1]
        nom = nom.split('.')[0]
        if (nom=="Crabe" && DansMain!="BatonPointu") {
            ok=false
            Life-=10
            actualiseSatsJeu()
            ecritMessage("<span> Aie ça pince ! -10pv") 
        }
        if (nom=="Poisson" && DansMain!="CanneAPeche") {
            ok=false
            actualiseSatsJeu()
            ecritMessage("<span>Difficile de l'attraper à la main...")
        }
        if (ok) {
            Inventaire.push(nom)
            let myIndex = tableauPlage.indexOf(nom);
            if (myIndex !== -1) {
                tableauPlage.splice(myIndex, 1);
            }
            afficheMenu(tableauPlage)
            ecritMessage("<span> Tu prends l'objet : " + nom)
    }
    }
    else {
        ecritMessage("<span> Tu n'a plus de place !") 
    }
}

function afficheMenu(tableau) { //Affiche les élements trouvé sur la carte
    HTML = ""
    for (element of tableau) {
        HTML += "<img src=\"fichier/" + element + ".png\" class=\"TabImgTab\" onclick=\"attraper(this)\">"
    }
    document.getElementById("TabMenu").innerHTML = HTML
}

function clicImage(img) { //Gère le clic sur une image
    var affiche = mooveCurseur(img)
    if (affiche == true) {
        endroit = img.src.split('/')
        tableauPlage = creerItems(endroit[endroit.length - 1])
        afficheMenu(tableauPlage)
    }
}

function creerImage(id, imageNom, x, y) {
    var img = document.createElement("img");
    img.src = "fichier/" + imageNom;
    img.className = 'imageCarte'
    let ident = x.toString() + y.toString()
    img.id = ident
    var div = document.getElementById(id);
    div.appendChild(img);
}


