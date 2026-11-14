/* «La stanza che cambia»: si dipingono soffitto e pareti e si legge l'effetto, come nello schema del libro (p. 104).
   S = soffitto, L = parete sinistra, R = parete destra, F = parete di fondo. */
(function () {
  "use strict";
  var scatola = document.querySelector("[data-stanza]");
  if (!scatola) { return; }
  var EFFETTI = {
    "": "Amplia e illumina lo spazio",
    "FLRS": "Compatta l'ambiente: è una scatola cromatica",
    "LRS": "Incornicia la stanza e mette in risalto la parete di fondo",
    "LR": "Stringe l'ambiente e alza il soffitto",
    "FS": "Abbassa e allarga la stanza",
    "LS": "Abbassa il soffitto e circoscrive un'area o una funzione",
    "RS": "Abbassa il soffitto e circoscrive un'area o una funzione",
    "F": "Accorcia la profondità della stanza",
    "FLR": "Allunga lo spazio: effetto cannocchiale",
    "S": "Abbassa il soffitto e rende l'ambiente più intimo"
  };
  var MISSIONI = [
    { testo: "La stanza è un lungo corridoio. Accorciala.", giuste: ["F"] },
    { testo: "Soffitti da castello, ma tu vuoi intimità.", giuste: ["S"] },
    { testo: "La stanza è piccola e poco luminosa. Falla respirare.", giuste: [""] },
    { testo: "Il soffitto è basso e sembra di toccarlo. Alzalo, a colpi di colore.", giuste: ["LR"] },
    { testo: "In fondo c'è la parete più bella della casa. Mettila in cornice.", giuste: ["LRS"] },
    { testo: "La stanza è alta e stretta come un ascensore. Abbassala e allargala.", giuste: ["FS"] },
    { testo: "Open space: l'angolo del pranzo si perde. Circoscrivilo.", giuste: ["LS", "RS"] },
    { testo: "Vuoi un cannocchiale puntato verso il fondo della stanza.", giuste: ["FLR"] },
    { testo: "Vuoi un nido: una stanza che ti abbraccia.", giuste: ["FLRS"] }
  ];
  var dipinte = { S: false, L: false, R: false, F: false };
  var effetto = scatola.querySelector("[data-effetto]"), fonte = scatola.querySelector("[data-effetto-fonte]");
  var numero = scatola.querySelector("[data-missione-numero]"), testo = scatola.querySelector("[data-missione-testo]");
  var esito = scatola.querySelector("[data-missione-esito]");
  var missione = 0;

  function icona(nome) { return document.querySelector('template[data-icona="' + nome + '"]').content.firstElementChild.cloneNode(true); }
  function chiave() { return ["F", "L", "R", "S"].filter(function (k) { return dipinte[k]; }).join(""); }

  function aggiorna() {
    Array.prototype.forEach.call(scatola.querySelectorAll("[data-superficie]"), function (p) {
      p.classList.toggle("dipinta", dipinte[p.getAttribute("data-superficie")]);
    });
    Array.prototype.forEach.call(scatola.querySelectorAll("[data-interruttore]"), function (b) {
      b.setAttribute("aria-pressed", dipinte[b.getAttribute("data-interruttore")] ? "true" : "false");
    });
    var k = chiave();
    if (Object.prototype.hasOwnProperty.call(EFFETTI, k)) {
      effetto.textContent = EFFETTI[k];
      fonte.textContent = "Dal libro, p. 104";
    } else {
      effetto.textContent = "Territorio inesplorato";
      fonte.textContent = "Questa combinazione nello schema del libro non c'è: qui il colore si prova dal vero, sulla parete.";
    }
    esito.hidden = true;
  }
  function cambia(superficie) { dipinte[superficie] = !dipinte[superficie]; aggiorna(); }

  scatola.addEventListener("click", function (evento) {
    var bersaglio = evento.target.closest("[data-superficie], [data-interruttore]");
    if (bersaglio) { cambia(bersaglio.getAttribute("data-superficie") || bersaglio.getAttribute("data-interruttore")); }
  });
  scatola.addEventListener("change", function (evento) {
    if (evento.target.name === "tinta") { scatola.setAttribute("data-tinta", evento.target.value); }
  });

  function proponi(n) {
    missione = n % MISSIONI.length;
    numero.textContent = missione + 1;
    testo.textContent = MISSIONI[missione].testo;
    /* si parte da una stanza che non è già la risposta */
    var partenza = MISSIONI[missione].giuste.indexOf("") >= 0 ? { S: true, L: false, R: false, F: true } : { S: false, L: false, R: false, F: false };
    dipinte = partenza;
    aggiorna();
  }
  scatola.querySelector("[data-verifica]").addEventListener("click", function () {
    var k = chiave(), giusta = MISSIONI[missione].giuste.indexOf(k) >= 0;
    esito.className = "esito-missione " + (giusta ? "bene" : "male");
    var frase = giusta ? "Missione compiuta. " + EFFETTI[k] + "."
      : "Non ancora. Così la stanza: " + (EFFETTI[k] ? EFFETTI[k].charAt(0).toLowerCase() + EFFETTI[k].slice(1) : "finisce in territorio inesplorato") + ".";
    esito.replaceChildren(icona(giusta ? "spunta" : "attenzione"), document.createTextNode(frase));
    esito.hidden = false;
  });
  scatola.querySelector("[data-altra]").addEventListener("click", function () { proponi(missione + 1); });

  proponi(0);
})();
