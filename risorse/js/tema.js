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

/* Quanto spazio c'è sopra il contenuto (fascia della bozza, striscia, testata): l'apertura lo usa per stare tutta nel
   primo schermo, con il titolo e il pulsante visibili senza scorrere. Si misura appena compare il contenuto, prima che
   la pagina si disegni, così niente si sposta dopo. */
(function () {
  var radice = document.documentElement;
  function misura() {
    var contenuto = document.getElementById("contenuto");
    if (contenuto) { radice.style.setProperty("--sopra", Math.round(contenuto.getBoundingClientRect().top + window.pageYOffset) + "px"); }
    return Boolean(contenuto);
  }
  if (!misura() && "MutationObserver" in window) {
    var guardia = new MutationObserver(function () { if (misura()) { guardia.disconnect(); } });
    guardia.observe(radice, { childList: true, subtree: true });
  }
  window.addEventListener("load", misura);
  window.addEventListener("resize", misura);
})();
