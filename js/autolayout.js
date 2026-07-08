/* ============================================================
   Tutorías GRI · Cadena de valor — Arquetipo AUTO
   Renderiza las diapositivas con la geometría de la PPT (1280x720)
   y el sistema de diseño GRI (recreación nativa, no imágenes).
   ============================================================ */
(function () {
  'use strict';
  const esc = window.__esc;
  const V = window.__V;
  const gri = () => '<div class="gri-badge">GRI</div>';

  // paleta real del tema del PPT (theme1.xml)
  const THEME = {
    accent1: '23559F', accent2: '22A39E', accent3: 'EF9228',
    accent4: '8D3589', accent5: '3EAE4E', accent6: '0067B3',
    dk1: '000000', dk2: '000000', tx1: '000000', tx2: '000000',
  };

  function hexOf(fill) {
    if (!fill) return null;
    const f = String(fill).toLowerCase();
    if (f.startsWith('scheme:')) {
      const name = f.slice(7);
      if (THEME[name]) return THEME[name];
      return null;                        // bg1/lt1/lt2 → sin fondo/carta
    }
    const hex = f.replace('#', '').toUpperCase();
    return /^[0-9A-F]{6}$/.test(hex) ? hex : null;
  }
  function lumOf(hex) {
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // colores del template PPT → tratamiento visual
  // devuelve {cls, bg, dark} — bg exacto del tema cuando existe
  function fillInfo(fill) {
    const f = String(fill || '').toLowerCase();
    const hex = hexOf(fill);
    if (hex) {
      const lum = lumOf(hex);
      if (lum >= 225) return { cls: ' card light', bg: null, dark: false };
      return { cls: lum < 165 ? ' blue' : ' card', bg: hex, dark: lum < 165 };
    }
    if (!fill) return { cls: '', bg: null, dark: false };
    if (f.startsWith('scheme:')) {
      // bg1/lt1/lt2 = tarjeta clara
      return f.includes('bg') || f.includes('lt')
        ? { cls: ' card light', bg: null, dark: false }
        : { cls: ' blue', bg: null, dark: true };
    }
    return { cls: '', bg: null, dark: false };
  }

  function paraHtml(p, onBlue) {
    const sz = p.sz ? Math.max(13, Math.min(38, Math.round(p.sz * 1.28))) : null;
    let st = (sz ? 'font-size:' + sz + 'px;' : '') + (p.b ? 'font-weight:700;' : '');
    if (p.color && /^[0-9A-Fa-f]{6}$/.test(p.color) && !onBlue) st += 'color:#' + p.color + ';';
    const ind = p.lvl ? 'margin-left:' + (p.lvl * 18) + 'px;' : '';
    const cls = 'al-p' + (p.bullet ? ' li' : '') + (onBlue ? ' inv' : '');
    return '<div class="' + cls + '" style="' + st + ind + '">' +
      (p.bullet ? '<span class="mk"></span>' : '') + esc(p.t) + '</div>';
  }

  function blockHtml(b, i) {
    const box = b.box || [80, 140, 1120, 480];
    const pos = 'left:' + box[0] + 'px;top:' + box[1] + 'px;width:' + box[2] + 'px;' +
      (b.type === 'pic' ? 'height:' + box[3] + 'px;' : 'min-height:' + Math.min(box[3], 560) + 'px;');
    const step = ' data-step="' + b.step + '"';
    if (b.type === 'pic') {
      if (b.crop) {
        // recorte srcRect de la PPT: [l,t,r,b] fracciones del original
        const l = b.crop[0], t = b.crop[1], r = b.crop[2], bt = b.crop[3];
        const wf = Math.max(0.0001, 1 - l - r), hf = Math.max(0.0001, 1 - t - bt);
        const iw = 100 / wf, ih = 100 / hf;
        const ix = -(l / wf) * 100, iy = -(t / hf) * 100;
        return '<div class="al-imgcrop"' + step + ' style="' + pos + '">' +
          '<img src="' + b.src + '" alt="" style="position:absolute;left:' + ix.toFixed(2) + '%;top:' + iy.toFixed(2) + '%;width:' + iw.toFixed(2) + '%;height:' + ih.toFixed(2) + '%;">' +
          '</div>';
      }
      const fit = b.contain ? 'object-fit:contain;border-radius:0;box-shadow:none;' : '';
      return '<img class="al-img"' + step + ' src="' + b.src + '" alt="" style="' + pos + fit + '">';
    }
    if (b.type === 'table') {
      const rows = (b.rows || []).map((r, ri) => {
        const head = ri === 0 && !b.noHead;
        return '<tr>' + r.map(c => (head ? '<th>' : '<td>') + esc(c) + (head ? '</th>' : '</td>')).join('') + '</tr>';
      }).join('');
      const tfs = b.fs ? ' style="font-size:' + b.fs + 'px"' : '';
      return '<div class="al-tblwrap"' + step + ' style="' + pos + '"><table class="al-tbl' + (b.compact ? ' sm' : '') + '"' + tfs + '>' + rows + '</table></div>';
    }
    if (b.type === 'group') {
      // normaliza a la esquina mínima de los hijos
      const kids = b.kids || [];
      const xs = kids.map(k => (k.box || [0, 0])[0]), ys = kids.map(k => (k.box || [0, 0])[1]);
      const mx = Math.min.apply(null, xs.concat([0])), my = Math.min.apply(null, ys.concat([0]));
      const inner = kids.map(k => {
        const kb = (k.box || [0, 0, 100, 40]).slice();
        kb[0] -= mx; kb[1] -= my;
        return blockHtml(Object.assign({}, k, { box: kb, step: b.step }), 0);
      }).join('');
      return '<div class="al-group"' + step + ' style="' + pos + 'height:' + box[3] + 'px">' + inner + '</div>';
    }
    // texto
    const fi = fillInfo(b.fill);
    const cls = fi.cls;
    const onBlue = fi.dark;
    const bgSt = fi.bg ? 'background:#' + fi.bg + ';' : '';
    const paras = (b.paras || []).map(p => paraHtml(p, onBlue)).join('');
    if (b.vertical) {
      // etiqueta lateral rotada (barra vertical estilo PPT)
      const vpos = 'left:' + box[0] + 'px;top:' + box[1] + 'px;width:' + box[2] + 'px;height:' + box[3] + 'px;';
      return '<div class="al-box al-vert' + cls + '"' + step + ' style="' + vpos + bgSt + '">' + paras + '</div>';
    }
    return '<div class="al-box' + cls + '"' + step + ' style="' + pos + bgSt + '">' + paras + '</div>';
  }

  V.auto = function (s, d) {
    const blocks = (d.blocks || []).map(blockHtml).join('');
    const title = d.title
      ? '<div class="sl-title auto' + (d.title.length > 46 ? ' sm' : '') + '" data-step="always">' + esc(d.title) + '</div>'
      : '';
    return gri() + title + '<div class="al-stage">' + blocks + '</div>';
  };
})();
