/* ============================================================
   Materialidad · Overrides para el modo AUTO (estética curso 1)
   Carga DESPUÉS de overrides.js: reemplaza SLIDE_OVERRIDES para
   que las defs AUTO (slidedefs_auto.json) manden en el contenido.
   Ajustes a mano: js/overrides_extra.js (SLIDE_OVERRIDES_EXTRA).
   ============================================================ */
(function () {
  'use strict';
  const esc = window.__esc;
  const V = window.__V;

  // ---- cierre del curso (estilo curso 1) ----
  V.mthanks = function (s, d) {
    const msg = 'Has completado la tutoría de Materialidad de impacto.';
    return '<div style="position:absolute;inset:0;background:linear-gradient(135deg,#173A6F 0%,#22549E 60%,#2E67BC 100%)"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center" data-step="always">' +
      '<div style="width:96px;height:96px;border-radius:50%;background:#fff;color:#22549E;font-weight:bold;font-size:30px;display:flex;align-items:center;justify-content:center;margin-bottom:26px">GRI</div>' +
      '<h1 style="font-size:44px">¡Gracias por acompañarnos!</h1>' +
      '<p style="font-size:19px;color:#C9DAF4;margin-top:14px;max-width:720px">' + esc(msg) + '</p>' +
      '<button class="big-btn" style="margin-top:30px" onclick="location.reload()">Volver al inicio</button>' +
      '</div>';
  };

  // Las definiciones por diapositiva viven en data/slidedefs_auto.json.
  // Aquí solo quedan ajustes que las defs no cubren.
  window.SLIDE_OVERRIDES = {};

  // mezcla de ajustes a mano (si existen)
  if (window.SLIDE_OVERRIDES_EXTRA) {
    Object.keys(window.SLIDE_OVERRIDES_EXTRA).forEach(function (k) {
      window.SLIDE_OVERRIDES[k] = Object.assign({}, window.SLIDE_OVERRIDES[k] || {}, window.SLIDE_OVERRIDES_EXTRA[k]);
    });
  }
})();
