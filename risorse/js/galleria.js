/* Pagina dei progetti: i filtri e la finestra che mostra le immagini in grande.
   Senza JavaScript restano i collegamenti: ogni immagine si apre da sola. */
(function () {
  "use strict";
  var muro = document.querySelector("[data-muro]");
  if (!muro) { return; }
  var tavole = Array.prototype.slice.call(muro.querySelectorAll(".tavola"));
  var filtri = Array.prototype.slice.call(document.querySelectorAll("[data-filtro]"));
  var conta = document.querySelector("[data-conta]");

  function visibili() { return tavole.filter(function (t) { return !t.hidden; }); }

  function filtra(gruppo, annuncia) {
    filtri.forEach(function (f) { f.setAttribute("aria-pressed", f.getAttribute("data-filtro") === gruppo ? "true" : "false"); });
    tavole.forEach(function (t) { t.hidden = gruppo !== "tutti" && t.getAttribute("data-gruppo") !== gruppo; });
    if (annuncia && conta) { conta.textContent = visibili().length + " immagini"; }
  }
  filtri.forEach(function (f) {
    f.addEventListener("click", function () { filtra(f.getAttribute("data-filtro"), true); });
  });
  /* dalla pagina iniziale si arriva già con un filtro scelto: portfolio/#filtro-soggiorno */
  function dalIndirizzo() {
    var chiesto = window.location.hash.replace("#filtro-", "");
    if (window.location.hash.indexOf("#filtro-") === 0 && filtri.some(function (f) { return f.getAttribute("data-filtro") === chiesto; })) { filtra(chiesto, false); }
  }
  dalIndirizzo();
  window.addEventListener("hashchange", dalIndirizzo);

  /* la finestra */
  var finestra = document.querySelector("[data-finestra]");
  if (!finestra || typeof finestra.showModal !== "function") { return; }
  var scena = finestra.querySelector("[data-finestra-scena]");
  var titolo = finestra.querySelector("[data-finestra-titolo]");
  var numero = finestra.querySelector("[data-finestra-conta]");
  var elenco = [], indice = 0, chiHaAperto = null;

  function mostra(i) {
    indice = (i + elenco.length) % elenco.length;
    var t = elenco[indice];
    var quadro = document.createElement("picture");
    var leggero = document.createElement("source");
    leggero.type = "image/avif";
    leggero.srcset = t.getAttribute("data-avif");
    var img = document.createElement("img");
    img.src = t.getAttribute("href");
    img.alt = t.querySelector("img").alt;
    img.width = Number(t.getAttribute("data-w"));
    img.height = Number(t.getAttribute("data-h"));
    quadro.appendChild(leggero);
    quadro.appendChild(img);
    scena.replaceChildren(quadro);
    titolo.textContent = t.getAttribute("data-titolo");
    numero.textContent = (indice + 1) + " di " + elenco.length;
    var prossima = elenco[(indice + 1) % elenco.length];   // la prossima si prepara in silenzio
    if (prossima && prossima !== t) { new Image().src = prossima.getAttribute("href"); }
  }
  function apri(t) {
    elenco = visibili();
    chiHaAperto = t;
    document.documentElement.classList.add("finestra-aperta");
    finestra.showModal();
    mostra(elenco.indexOf(t));
    finestra.querySelector("[data-finestra-chiudi]").focus();
  }
  muro.addEventListener("click", function (evento) {
    var t = evento.target.closest(".tavola");
    if (!t || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button) { return; }
    evento.preventDefault();
    apri(t);
  });
  finestra.querySelector("[data-finestra-chiudi]").addEventListener("click", function () { finestra.close(); });
  finestra.querySelector("[data-finestra-prima]").addEventListener("click", function () { mostra(indice - 1); });
  finestra.querySelector("[data-finestra-dopo]").addEventListener("click", function () { mostra(indice + 1); });
  finestra.addEventListener("keydown", function (evento) {
    if (evento.key === "ArrowLeft") { mostra(indice - 1); }
    if (evento.key === "ArrowRight") { mostra(indice + 1); }
  });
  finestra.addEventListener("click", function (evento) {      // un tocco sul fondo scuro chiude
    if (evento.target === finestra || evento.target === scena) { finestra.close(); }
  });
  finestra.addEventListener("close", function () {            // vale anche per il tasto Esc
    document.documentElement.classList.remove("finestra-aperta");
    scena.replaceChildren();
    if (chiHaAperto) { chiHaAperto.focus(); }
  });
  var partenza = null;                                        // sul telefono si scorre con il dito
  scena.addEventListener("pointerdown", function (evento) { partenza = evento.clientX; });
  scena.addEventListener("pointerup", function (evento) {
    if (partenza === null) { return; }
    var spostamento = evento.clientX - partenza;
    partenza = null;
    if (Math.abs(spostamento) > 50) { mostra(indice + (spostamento < 0 ? 1 : -1)); }
  });
})();
