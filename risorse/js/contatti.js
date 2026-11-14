/* Il modulo dei contatti non manda niente a nessun server: compone il testo di una email e apre il programma di
   posta di chi scrive. Chi non ha un programma di posta può copiare il testo. */
(function () {
  "use strict";
  var modulo = document.querySelector("[data-modulo]");
  if (!modulo) { return; }
  var anteprima = modulo.querySelector("[data-anteprima]");
  var invia = modulo.querySelector("[data-invia]");
  var copia = modulo.querySelector("[data-copia]");
  var copiato = modulo.querySelector("[data-copiato]");
  var indirizzo = invia.getAttribute("href").replace("mailto:", "").split("?")[0];

  function valore(nome) {
    var campo = modulo.elements[nome];
    return campo && campo.value ? String(campo.value).trim() : "";
  }
  function componi() {
    var righe = ["Ciao Melania,", "", "ti scrivo per " + valore("spazio") + (valore("dove") ? " a " + valore("dove") : "") +
      (valore("metri") ? ", di circa " + valore("metri") + " m²" : "") + "."];
    if (valore("idea")) { righe.push("", valore("idea")); }
    righe.push("", "Planimetria: " + valore("planimetria") + ".");
    righe.push("", "Grazie," + (valore("nome") ? "\n" + valore("nome") : ""));
    var testo = righe.join("\n");
    var oggetto = "Un progetto per " + valore("spazio") + (valore("dove") ? " a " + valore("dove") : "");
    anteprima.textContent = testo;
    invia.setAttribute("href", "mailto:" + indirizzo + "?subject=" + encodeURIComponent(oggetto) + "&body=" + encodeURIComponent(testo));
    copiato.hidden = true;
    return testo;
  }
  modulo.addEventListener("input", componi);
  modulo.addEventListener("change", componi);
  modulo.addEventListener("submit", function (evento) { evento.preventDefault(); });
  copia.addEventListener("click", function () {
    var testo = componi();
    function fatto() { copiato.hidden = false; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(testo).then(fatto, seleziona);
    } else { seleziona(); }
    function seleziona() {          // se il browser non lascia copiare, il testo resta selezionato: basta Copia
      var zona = document.createRange();
      zona.selectNodeContents(anteprima);
      var scelta = window.getSelection();
      scelta.removeAllRanges();
      scelta.addRange(zona);
    }
  });
  componi();
})();
