var breite = 16;
var hoehe = 16;
var gameOver = false;
var verschieben = false;
var xOffset = 0;
var yOffset = 0;
var drehIndex = 0;
var abwaertsIntervall = 500;
var abwaertsIntervallPuffer = abwaertsIntervall;
var abwaertsTimer = new Date().getTime() + abwaertsIntervall;
var punkte = 0;
var punkteintervall = 10;

var alleFiguren = [ //Definieren der Standardfiguren
    [
        //Der T-Block    
        //x
        //xx
        //x
        [{x: 8, y:0}, {x:8, y:1}, {x:8, y:2}, {x:9, y:1}],
        //xxx
        // x
        [{x: 7, y:1}, {x:8, y:1}, {x:9, y:1}, {x:8, y:2}],
        // x
        //xxx
        [{x: 8, y:0}, {x:8, y:1}, {x:8, y:2}, {x:7, y:1}],
        // x
        //xx
        // x
        [{x: 7, y:1}, {x:8, y:1}, {x:9, y:1}, {x:8, y:0}],
    ],
    [
        //Der Z-Block    
        //xx
        // x
        // xx
        [{x: 8, y:0}, {x:8, y:1}, {x:9, y:1}, {x:9, y:2}],
        //xxx
        // x
        [{x: 8, y:2}, {x:9, y:2}, {x:9, y:1}, {x:10, y:1}],
        // x
        //xxx
        [{x: 8, y:0}, {x:8, y:1}, {x:9, y:1}, {x:9, y:2}],
        // x
        //xx
        // x
        [{x: 8, y:2}, {x:9, y:2}, {x:9, y:1}, {x:10, y:1}],
    ],
    [
        //Der Z-Block    
        //xx
        // x
        // xx
        [{x: 8, y:0}, {x:9, y:0}, {x:10, y:0}, {x:11, y:0}],
        //xxx
        // x
        [{x: 8, y:0}, {x:8, y:1}, {x:8, y:2}, {x:8, y:3}],        
    ]
];

//init
var spielfeld = spielfeldAufbauen();
var spielFiguren = erzeugeSpielFigur();
var spielFigur = spielFiguren[drehIndex];

function leereZeile() {
    var leereZeile = [];

    for(b = 0; b < breite; b++) {
        leereZeile.push(false);
    }
    return leereZeile;
}

function spielfeldAufbauen() {
    var array = new Array(hoehe);
    for(y = 0; y < hoehe; y++) {
        array[y] = leereZeile();
    }

    return array;
}

function erzeugeSpielFigur() {
    xOffset = 0;
    yOffset = 0;
    drehIndex = 0;

    var zufallFiguren =
    alleFiguren[Math.floor(Math.random() * alleFiguren.length)];

    var kollision = kollisionUeberpruefen(zufallFiguren[drehIndex], 0, 0);

    if(kollision) {
        gameOver = true;
    }

    return zufallFiguren;
}

function kollisionUeberpruefen(pruefeFigur, xSchritt, ySchritt) {
    kollision = false;

    //statt p < pl => p < pruefeFigur.length
    for(var p=0, pl = pruefeFigur.length; p < pl; p++) {
        if(!spielfeld[pruefeFigur[p].y + yOffset + 1] && yOffset > 0) {
            //unten angekommen
            kollision = true;
        }
        else if(spielfeld[pruefeFigur[p].y + yOffset + 
                ySchritt][pruefeFigur[p].x + xOffset +
                xSchritt] != false) {
                    //Kollision mit vorhandenem Feld
                    kollision = true;
                }
    }

    return kollision;
}

function naechstenSchrittPruefen() {
    var weitermachen = true;
    var aktuelleZeit = new Date().getTime();

    if(aktuelleZeit > abwaertsTimer) {
        abwaertsTimer = new Date().getTime() + abwaertsIntervall;
        //Spielstein einen Schritt weiter prüfen
        var kollisionVert = kollisionUeberpruefen(spielFigur, 0, 1);
        if(!kollisionVert) {
            nachUntenBewegen();
        }
        else {
            weitermachen = false;
        }
    }

    if(weitermachen) {
        var kollisionHori = kollisionUeberpruefen(spielFigur, verschieben, 0);

        if(!kollisionHori) {
            spielFigurVerschieben();
        }
    }
    else {
        spielFigurAbsetzen(); //Spielstein auf Spielfeld absetzen
        volleZeilenEntfernen();
        spielFiguren = erzeugeSpielFigur();
        spielFigur = spielFiguren[drehIndex];
    }
}

function nachUntenBewegen() {
    yOffset += 1;
}

//Spielfigur auf das Spielfeld ablegen
function spielFigurAbsetzen() {
    for(a = 0, la = spielFigur.length; a < la; a++) {
        spielfeld[spielFigur[a].y + yOffset][spielFigur[a].x + xOffset] =
            'ff0000';
    }
}

function volleZeilenEntfernen() {
    var zuLoeschen = [];
    for(z = 0, lz = spielfeld.length; z < lz; z++) {
        var anzahlVolleFelder = 0;
        for(i = 0, li = spielfeld[z].length; i < li; i++) {
            if(spielfeld[z][i] != false) {
                anzahlVolleFelder += 1;
            }
        }
        if(anzahlVolleFelder == breite) {
            zuLoeschen.push(z);
            punkte += punkteintervall;
        }
    }
    
    var anzahlLoeschen = zuLoeschen.length;

    if(anzahlLoeschen > 0) {
        for(var w = 0, wl = anzahlLoeschen; w < wl; w++) {
            //löschen
            spielfeld.splice(zuLoeschen[w], 1);
            //'oben' auffüllen und Gesamtzahl der Zeilen
            //für nächsten Schritt erhalten
            spielfeld.splice(0, 0, leereZeile());
        }
        document.getElementById('status').innerHTML = 'Punkte: ' + punkte;
    }
}

function spielFigurVerschieben() {
    var verschMoegl = true;

    for (i = 0, l = spielFigur.length; i < l; i++) {
        //checken, ob Spielfigur am Rand oder Treffer mit vorhandenem Stein
        if(spielFigur[i].x + xOffset + verschieben >= breite ||
            spielFigur[i].x + xOffset + verschieben < 0) {
                verschMoegl = false;
            }
    }
    if(verschMoegl) {
        xOffset += verschieben;
    }
}

function drehen() {
    var alterDrehIndex = drehIndex;

    if(drehIndex < 3) {
        drehIndex += 1;
    }
    else {
        drehIndex = 0;
    }
    testSpielfigur = spielFiguren[drehIndex];

    var kollisionsDreh = kollisionUeberpruefen(testSpielfigur, 0, 0);

    if(!kollisionsDreh) {
        spielFigur = testSpielfigur;
    }
    else {
        drehIndex = alterDrehIndex;
    }    
}

function ausgabeSpielfeldErzeugen() {
    //spielfeld-Klon für die Ausgabe erzeugen
    tempArray = new Array(hoehe);

    for(a = 0, la = spielfeld.length; a < la; a++) {
        tempArray[a] = new Array(breite);
        for(b = 0, lb = spielfeld[a].length; b < lb; b++) {
            tempArray[a][b] = spielfeld[a][b];
        }                
    }

    for(i = 0, l = spielFigur.length; i < l; i++) {
        tempArray[spielFigur[i].y + yOffset][spielFigur[i].x + xOffset] =
            'aaaafe'; //Zum Zeichnen 'übergeben'
    }
    return tempArray;
}

function spielfeldZeichen(zFeld) {
    var textFeld = '';

    for(a = 0, la = zFeld.length; a < la; a++) {
        for(b = 0, lb = zFeld[a].length; b < lb; b++) {
            if(zFeld[a][b]) {
                textFeld += '<span style="color:#' +
                //Sonderzeichen für gefülltes Quadrat
                zFeld[a][b] + '">&#9632;</span>';
            }
            else {
                //Sonderzeichen für nicht gefülltes Quadrat
                textFeld += '&#9633;';
            }
        }
        textFeld += '<br>';
    }
    return textFeld;
}

//Schleife
ONE_FRAME_TIME = 100;

var hauptschleife = function() {    
    if(!gameOver) {
        naechstenSchrittPruefen();
        zeichnenFeld = ausgabeSpielfeldErzeugen();
        textFeld = spielfeldZeichen(zeichnenFeld);
        document.getElementById('spielfeld').innerHTML = textFeld;
    }
    else {
        document.getElementById('spielfeld').innerHTML =
        'Game Over. <br><br>Punkte: ' + punkte;
        zeichnenFeld = ausgabeSpielfeldErzeugen();
        textFeld = spielfeldZeichen(zeichnenFeld);
    }
}

setInterval(hauptschleife, ONE_FRAME_TIME);

document.onkeydown = function (event) {
    if(event.keyCode == 37) {
        verschieben = -1;
    }
    if(event.keyCode == 39) {
        verschieben = 1;
    }
    if(event.keyCode == 38) {
        drehen();
    }
    if(event.keyCode == 40) {
        abwaertsIntervall = 75;
    }
}

document.onkeyup = function (event) {
    verschieben = false;

    if(event.keyCode == 40) {
        abwaertsIntervall = abwaertsIntervallPuffer;
    }
}