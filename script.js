"use strict";

var bildElement = document.getElementById("scheibe");
var linksButton = document.getElementById("links");
var rechtsButton = document.getElementById("rechts");
var automatikButton = document.getElementById("automatik");
var glueckButton = document.getElementById("glueck-button");
var statusElement = document.getElementById("status");
var haseElement = document.getElementById("hase");
var haseAuswahlButton = document.getElementById("hase-auswahl");
var scheibenAnzeige = document.getElementById("scheiben-anzeige");
var hasenAnzeige = document.getElementById("hasen-anzeige");
var anzahlBilder = 24;
var gradProBild = 360 / anzahlBilder;
var bilder = [];
var bildIndex = 0;
var geladeneBilder = 0;
var scheibeIstGeladen = false;
var scheibenLadefehler = false;
var timerId = null;

// Erweiterung: Hasenanimation
var anzahlHasenBilder = 6;
var hasenBilder = [];
var hasenBildIndex = 0;
var geladeneHasenBilder = 0;
var haseIstGeladen = false;
var haseIstAusgewaehlt = false;
var hasenLadefehler = false;
var hasenTimerId = null;

// Erweiterung: Glücksdreh
var gluecksdrehLaeuft = false;
var glueckTimerId = null;
var ausgefuehrteSchritte = 0;
var gesamtSchritte = 0;

if (statusElement === null) {
  statusElement = document.createElement("p");
  statusElement.id = "status";
  automatikButton.parentNode.insertAdjacentElement("afterend", statusElement);
}

function bildNummer(index) {
  if (index < 10) {
    return "0" + index;
  }
  return "" + index;
}

function bildPfad(index) {
  return "scheibe/scheibe-" + bildNummer(index) + ".png";
}

function hasenBildPfad(index) {
  return "hase/hase-" + bildNummer(index) + ".png";
}

function aktualisiereButtons() {
  var gesperrt = !scheibeIstGeladen || haseIstAusgewaehlt || gluecksdrehLaeuft;
  linksButton.disabled = gesperrt;
  rechtsButton.disabled = gesperrt;
  automatikButton.disabled = gesperrt;
  glueckButton.disabled = gesperrt;
  haseAuswahlButton.disabled = !scheibeIstGeladen || !haseIstGeladen || gluecksdrehLaeuft;
}

function zeigeBild() {
  if (!scheibeIstGeladen || haseIstAusgewaehlt) {
    return;
  }

  var grad = bildIndex * gradProBild;
  bildElement.src = bilder[bildIndex].src;
  bildElement.alt = "Scheibe im Rotationszustand " + grad + " Grad";

  var text = "Bild " + (bildIndex + 1) + " von " + anzahlBilder + " · " + grad + "°";
  if (gluecksdrehLaeuft) {
    text = text + " · Glücksdreh läuft";
  } else if (timerId !== null) {
    text = text + " · Automatik läuft";
  } else {
    text = text + " · Automatik aus";
  }
  statusElement.textContent = text;
}

function drehe(schritte) {
  bildIndex = (bildIndex + schritte + anzahlBilder) % anzahlBilder;
  zeigeBild();
}

function stoppeAutomatik() {
  clearInterval(timerId);
  timerId = null;
  automatikButton.textContent = "Automatik starten (A)";
  automatikButton.setAttribute("aria-pressed", "false");
}

function einzelSchritt(richtung) {
  if (linksButton.disabled) {
    return;
  }
  stoppeAutomatik();
  drehe(richtung);
}

function schalteAutomatikUm() {
  if (automatikButton.disabled) {
    return;
  }

  if (timerId !== null) {
    stoppeAutomatik();
  } else {
    timerId = setInterval(function () {
      drehe(1);
    }, 1000 / 12);
    automatikButton.textContent = "Automatik stoppen (A)";
    automatikButton.setAttribute("aria-pressed", "true");
  }
  zeigeBild();
}

function zeigeHasenBild() {
  haseElement.src = hasenBilder[hasenBildIndex].src;
  haseElement.alt = "Hüpfender Hase, Bild " + (hasenBildIndex + 1) + " von " + anzahlHasenBilder;
}

function naechstesHasenBild() {
  hasenBildIndex = (hasenBildIndex + 1) % anzahlHasenBilder;
  zeigeHasenBild();
}

function stoppeHasenAnimation() {
  clearInterval(hasenTimerId);
  hasenTimerId = null;
}

function wechsleObjekt() {
  if (haseAuswahlButton.disabled) {
    return;
  }

  stoppeAutomatik();
  stoppeHasenAnimation();
  haseIstAusgewaehlt = !haseIstAusgewaehlt;
  scheibenAnzeige.hidden = haseIstAusgewaehlt;
  hasenAnzeige.hidden = !haseIstAusgewaehlt;

  if (haseIstAusgewaehlt) {
    hasenBildIndex = 0;
    zeigeHasenBild();
    hasenTimerId = setInterval(naechstesHasenBild, 140);
    haseAuswahlButton.textContent = "Scheibe anzeigen";
    statusElement.textContent = "Hase ausgewählt · Animation läuft";
  } else {
    haseAuswahlButton.textContent = "Hasenanimation anzeigen";
    zeigeBild();
  }
  aktualisiereButtons();
}

function starteGluecksdreh() {
  if (glueckButton.disabled) {
    return;
  }

  stoppeAutomatik();
  gluecksdrehLaeuft = true;
  ausgefuehrteSchritte = 0;

  gesamtSchritte = 4 * anzahlBilder + Math.floor(Math.random() * anzahlBilder);
  aktualisiereButtons();
  naechsterGluecksschritt();
}



function naechsterGluecksschritt() {
  drehe(1);
  ausgefuehrteSchritte = ausgefuehrteSchritte + 1;

  if (ausgefuehrteSchritte >= gesamtSchritte) {
    gluecksdrehLaeuft = false;
    glueckTimerId = null;
    aktualisiereButtons();
    statusElement.textContent = "Glücksdreh beendet · Bild " + (bildIndex + 1) +
      " von " + anzahlBilder + " · " + bildIndex * gradProBild + "°";
    return;
  }

  var fortschritt = ausgefuehrteSchritte / gesamtSchritte;
  var pause = 35 + 165 * fortschritt;
  glueckTimerId = setTimeout(naechsterGluecksschritt, pause);
}



function scheibenBildGeladen() {
  geladeneBilder = geladeneBilder + 1;
  if (scheibenLadefehler) {
    return;
  }

  statusElement.textContent = "Scheibenbilder laden: " + geladeneBilder + " / " + anzahlBilder;
  if (geladeneBilder === anzahlBilder) {
    scheibeIstGeladen = true;
    aktualisiereButtons();
    zeigeBild();
  }
}

function ladeBilder() {
  for (var i = 0; i < anzahlBilder; i++) {
    var bild = new Image();
    bild.onload = scheibenBildGeladen;
    bilder[i] = bild;
    bild.src = bildPfad(i);
  }
}

function hasenBildGeladen() {
  geladeneHasenBilder = geladeneHasenBilder + 1;
  if (!hasenLadefehler && geladeneHasenBilder === anzahlHasenBilder) {
    haseIstGeladen = true;
    aktualisiereButtons();
  }
}


function ladeHasenBilder() {
  for (var i = 0; i < anzahlHasenBilder; i++) {
    var bild = new Image();
    bild.onload = hasenBildGeladen;
    hasenBilder[i] = bild;
    bild.src = hasenBildPfad(i);
  }
}




linksButton.onclick = function () {
  einzelSchritt(-1);
};
rechtsButton.onclick = function () {
  einzelSchritt(1);
};
automatikButton.onclick = schalteAutomatikUm;
glueckButton.onclick = starteGluecksdreh;
haseAuswahlButton.onclick = wechsleObjekt;

window.onkeydown = function (event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  var ziel = event.target;
  if (ziel.tagName === "INPUT" || ziel.tagName === "TEXTAREA" ||
      ziel.tagName === "SELECT" || ziel.isContentEditable) {
    return;
  }

  switch (event.key.toLowerCase()) {
    case "l":
      einzelSchritt(-1);
      break;
    case "r":
      einzelSchritt(1);
      break;
    case "a":
      schalteAutomatikUm();
      break;
  }
};



aktualisiereButtons();

statusElement.textContent = "Bilder werden geladen …";
ladeBilder();

ladeHasenBilder();