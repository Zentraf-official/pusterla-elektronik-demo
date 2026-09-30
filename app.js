/* ============================================================================
   Pusterla Elektronik AG — Vorschau von Zentraf
   Eigenes JavaScript. Keine Bibliothek, kein CDN, keine Messdaten, keine Cookies.

   Grundregel: Wenn dieses Skript nicht lädt oder einen Fehler macht, muss die
   Seite vollständig und lesbar bleiben. Deshalb steht am Anfang jeder Aufgabe
   eine Prüfung, und am Ende wird window.__pusterlaListo gesetzt — nur dann
   behält <html> die Klasse .js (siehe <head> von index.html).
   ========================================================================= */
(function () {
  'use strict';

  var raiz = document.documentElement;

  /* Ist Bewegung ausdrücklich nicht gewünscht? Dann passiert hier gar nichts. */
  function movimientoReducido() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------------------------ 1.
     Blöcke erscheinen, wenn sie ins Bild kommen. Ohne JavaScript bleibt alles
     von Anfang an sichtbar (die Klasse .js fehlt dann). */
  function revelar() {
    var elementos = document.querySelectorAll('.revelar');
    if (!elementos.length) { return; }

    if (movimientoReducido() || !('IntersectionObserver' in window)) {
      for (var i = 0; i < elementos.length; i++) {
        elementos[i].classList.add('esta-visible');
      }
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('esta-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var j = 0; j < elementos.length; j++) {
      // Was beim Laden schon im Bild ist, wird sofort gezeigt und nicht animiert.
      var caja = elementos[j].getBoundingClientRect();
      if (caja.top < window.innerHeight * 0.9) {
        elementos[j].classList.add('esta-visible');
      } else {
        observador.observe(elementos[j]);
      }
    }
  }

  /* ------------------------------------------------------------------ 2.
     Das Formular ist ein Entwurf: es sendet nichts. Wir sagen das deutlich,
     statt eine Nachricht vorzutäuschen. */
  function formulario() {
    var form = document.getElementById('anfrage');
    var respuesta = document.getElementById('respuestaFormulario');
    if (!form || !respuesta) { return; }

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var nombre = (form.elements.nombre && form.elements.nombre.value || '').trim();
      var email = (form.elements.email && form.elements.email.value || '').trim();
      var texto = (form.elements.mensaje && form.elements.mensaje.value || '').trim();
      var ok = form.elements.einverstanden && form.elements.einverstanden.checked;

      // Anti-Spam-Falle: ein Mensch sieht dieses Feld nicht, ein Bot füllt es aus.
      // Dann tun wir so, als wäre alles gut — und senden nichts.
      if (form.elements._trampa && form.elements._trampa.value) {
        respuesta.hidden = false;
        respuesta.textContent = 'Danke.';
        form.reset();
        return;
      }

      respuesta.hidden = false;

      if (!nombre || !email || !texto || !ok) {
        respuesta.textContent = 'Bitte füllen Sie Name, E-Mail und Nachricht aus und setzen Sie '
          + 'das Häkchen beim Datenschutz. (Es wird trotzdem nichts versendet — dies ist ein Entwurf.)';
        return;
      }

      respuesta.innerHTML = 'Danke, ' + escapar(nombre) + '. <strong>Dies ist ein Entwurf: '
        + 'Ihre Nachricht wurde nicht versendet und nichts gespeichert.</strong> '
        + 'Bitte rufen Sie uns an unter <a href="tel:+41442415677">044 241 56 77</a> '
        + 'oder schreiben Sie an <a href="mailto:info@pusterla.ch">info@pusterla.ch</a>.';
      form.reset();
    });
  }

  /* Verhindert, dass eingetippter Text als HTML interpretiert wird. */
  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------ 3.
     Der Menüpunkt der gerade sichtbaren Sektion wird hervorgehoben. Reine
     Orientierungshilfe — ohne JavaScript bleibt die Navigation unverändert. */
  function menuActivo() {
    var enlaces = document.querySelectorAll('.nav__enlace');
    if (!enlaces.length || !('IntersectionObserver' in window)) { return; }

    var secciones = [];
    for (var i = 0; i < enlaces.length; i++) {
      var destino = enlaces[i].getAttribute('href') || '';
      if (destino.charAt(0) !== '#') { continue; }
      var sec = document.querySelector(destino);
      if (sec) { secciones.push({ enlace: enlaces[i], sec: sec }); }
    }
    if (!secciones.length) { return; }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        for (var k = 0; k < secciones.length; k++) {
          var activo = secciones[k].sec === entrada.target;
          secciones[k].enlace.style.background = activo ? 'var(--fondo-suave)' : '';
          secciones[k].enlace.style.color = activo ? 'var(--azul)' : '';
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secciones.forEach(function (s) { observador.observe(s.sec); });
  }

  /* ------------------------------------------------------------------ 4. */
  function iniciar() {
    try { revelar(); } catch (e) { console.warn('Pusterla: revelar', e); }
    try { formulario(); } catch (e) { console.warn('Pusterla: Formular', e); }
    try { menuActivo(); } catch (e) { console.warn('Pusterla: Menü', e); }
    window.__pusterlaListo = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  /* Falls doch etwas schiefgeht: die Seite sichtbar machen, egal was passiert. */
  window.addEventListener('error', function () {
    raiz.classList.remove('js');
    var ocultos = document.querySelectorAll('.revelar');
    for (var i = 0; i < ocultos.length; i++) { ocultos[i].classList.add('esta-visible'); }
  });
})();
