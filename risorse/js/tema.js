/* Sceglie il tema prima che la pagina si disegni (niente lampo bianco): quello scelto dalla persona, altrimenti
   quello del suo computer. Sta in un file a parte, caricato per primo, così il sito non ha bisogno di script scritti
   dentro la pagina. */
(function () {
  var radice = document.documentElement;
  radice.classList.remove("no-js");
  radice.classList.add("js");
  var scelto = null;
  try { scelto = window.localStorage.getItem("mdb-tema"); } catch (errore) { /* memoria del browser non disponibile */ }
  if (scelto !== "chiaro" && scelto !== "scuro") {
    var gia = radice.getAttribute("data-theme");      // un'anteprima ospitata altrove può avere già scelto il tema
    if (gia === "dark" || gia === "light") { return; }
    scelto = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "scuro" : "chiaro";
  }
  radice.setAttribute("data-theme", scelto === "scuro" ? "dark" : "light");
})();
