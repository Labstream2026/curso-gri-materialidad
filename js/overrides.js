/* ============================================================
   Tutorías GRI — Arquetipos bespoke + overrides por diapositiva
   ============================================================ */
(function () {
  'use strict';
  const A = window.SlideArch;
  const V = window.__V;
  const SVG = A.SVG, IMG = A.IMG, esc = A.esc, gri = A.gri;

  // ---- sistema de estándares (slide 7) ----
  V.stdsystem = function (s, d) {
    const book = (cls, code) => '<div class="std-book"><div class="bk">' + code + '</div>';
    const uni = [
      ['GRI 1', 'Requerimientos y principios para el uso de los Estándares GRI'],
      ['GRI 2', 'Contenidos sobre la organización informante'],
      ['GRI 3', 'Contenidos y orientaciones sobre los temas materiales'],
    ];
    const uniRows = uni.map(u => '<div class="std-book"><div class="bk">' + u[0] + '</div><div>' + esc(u[1]) + '</div></div>').join('');
    const grid = (codes) => '<div class="std-grid">' + codes.map(c => '<div class="bk">' + c + '</div>').join('') + '</div>';
    return gri(false) +
      '<div class="sl-title">Sistema de los Estándares GRI</div>' +
      '<div class="std-wrap">' +
      '<div class="std-top" data-step="0">Estándares GRI</div>' +
      '<div class="std-cols">' +
      '<div class="std-col g" data-step="1"><div class="hd">Estándares Universales</div><div class="bd">' + uniRows + '</div></div>' +
      '<div class="std-col o" data-step="2"><div class="hd">Estándares Sectoriales</div><div class="bd" style="justify-content:center">' + grid(['GRI 11', 'GRI 12', 'GRI 13', 'GRI 14', 'GRI 15', 'GRI 16', 'GRI 17', 'GRI 18', '…']) + '</div></div>' +
      '<div class="std-col p" data-step="3"><div class="hd">Estándares Temáticos</div><div class="bd" style="justify-content:center">' + grid(['GRI 201', 'GRI 403', 'GRI 305', 'GRI 415', 'GRI 303', 'GRI 202', 'GRI 304', 'GRI 205', '…']) + '</div></div>' +
      '</div></div>';
  };

  // ---- conceptos clave 2x2 (slides 8-11) ----
  V.concept = function (s, d) {
    const items = [
      { t: 'Impacto', ic: SVG.globe },
      { t: 'Debida Diligencia', ic: SVG.dd },
      { t: 'Temas materiales', ic: SVG.topic },
      { t: 'Grupos de interés', ic: SVG.people },
    ];
    const active = d.active != null ? d.active : 0;
    const cards = items.map((it, i) =>
      '<div class="concept-card' + (i === active ? ' active' : '') + '" data-step="always">' + it.ic + '<span>' + it.t + '</span></div>'
    ).join('');
    const bullets = (d.bullets || []).map((t, i) => '<div class="vitem" data-step="' + i + '"><div class="bd-ic">' + SVG.check + '</div><div>' + A.fmtBullet(t) + '</div></div>').join('');
    return gri(false) +
      '<div class="sl-panel" style="width:340px"><div class="pt">' + esc(items[active].t) + '</div></div>' +
      '<div class="concept-grid" style="left:390px;right:56px;top:70px;bottom:70px;position:absolute">' + cards + '</div>' +
      (bullets ? '<div class="sl-body" style="left:390px;right:56px;top:auto;bottom:24px;height:auto"><div class="vlist" style="height:auto">' + bullets + '</div></div>' : '');
  };
  // conceptos con narración larga: mostrar definición como callout bajo las tarjetas
  V.conceptDef = function (s, d) {
    const items = ['Impacto', 'Debida Diligencia', 'Temas materiales', 'Grupos de interés'];
    const icons = [SVG.globe, SVG.dd, SVG.topic, SVG.people];
    const active = d.active || 0;
    const cards = items.map((t, i) =>
      '<div class="concept-card' + (i === active ? ' active' : '') + '" data-step="always" style="font-size:15px;gap:8px">' +
      '<div style="width:38px;height:38px">' + icons[i] + '</div><span>' + t + '</span></div>'
    ).join('');
    return gri(false) +
      '<div class="sl-title">Conceptos clave</div>' +
      '<div style="position:absolute;left:112px;top:120px;width:300px;display:grid;grid-template-columns:1fr 1fr;gap:14px">' + cards + '</div>' +
      '<div class="sl-body" style="left:452px;right:56px;top:120px"><div class="callout" data-step="always" style="font-size:15.5px;max-height:440px;overflow-y:auto">' +
      '<b style="color:var(--blue);font-size:18px;display:block;margin-bottom:8px">' + esc(items[active]) + '</b>' + esc(d.def || '') + '</div></div>';
  };

  // ---- lista de conformidad 1-9 (slides 12-16) ----
  V.conform = function (s, d) {
    const reqs = [
      'Aplicar los principios para la elaboración de informes',
      'Presentar los contenidos correspondientes a GRI 2',
      'Determinar los temas materiales',
      'Presentar los contenidos correspondientes a GRI 3',
      'Presentar contenidos de los Estándares Temáticos GRI para cada tema material',
      'Proporcionar los motivos para la omisión relativos al contenido o requisito que no pueda cumplir',
      'Publicar un índice de contenidos GRI',
      'Proporcionar una declaración de uso',
      'Notificar a GRI',
    ];
    const upto = d.active || 1;
    const rows = reqs.map((r, i) => {
      const on = (i + 1) <= upto;
      const hl = (i + 1) === upto;
      return '<div class="row ' + (on ? (hl ? 'hl' : '') : 'muted') + '"><div class="no">' + (i + 1) + '</div><div>' + esc(r) + '</div></div>';
    }).join('');
    return gri(false) +
      '<div class="sl-title sm" style="right:150px">¿Cómo se reporta usando los Estándares GRI?</div>' +
      '<div class="sl-sub" style="top:78px;font-size:16px">Opciones para la preparación del informe</div>' +
      '<div class="conform" style="top:120px;bottom:36px"><div class="rail left">De conformidad</div>' +
      '<div class="items">' + rows + '</div>' +
      '<div class="rail right">En Referencia</div></div>';
  };

  // ---- omisiones (slide 18) ----
  V.omissions = function (s, d) {
    const cards = [
      ['01', 'No procede', 'Explique por qué se considera que el contenido o el requerimiento no procede.'],
      ['02', 'Prohibiciones legales', 'Describa las prohibiciones legales específicas.'],
      ['03', 'Restricciones de confidencialidad', 'Indique los problemas específicos de confidencialidad.'],
      ['04', 'Información no disponible o incompleta', 'Especifique la información que falta, por qué y los pasos para obtenerla.'],
    ];
    const grid = cards.map((c, i) =>
      '<div class="gcard" data-step="' + i + '"><b style="display:flex;align-items:center;gap:10px"><span style="background:var(--orange-strong);color:#fff;border-radius:6px;padding:2px 9px;font-size:15px">' + c[0] + '</span>' + esc(c[1]) + '</b>' + esc(c[2]) + '</div>'
    ).join('');
    return gri(false) +
      '<div class="sl-title">Uso de las omisiones</div>' +
      '<div class="sl-body"><div class="grid2">' + grid + '</div></div>';
  };

  // ---- timeline de proceso (slide 24) ----
  V.timeline4 = function (s, d) {
    const cells = [
      { pos: 'top', ic: '', b: 'Entender el contexto de la organización', t: 'Usar los Estándares Sectoriales para entender el contexto de los sectores', color: 'var(--blue)' },
      { pos: 'bot', ic: SVG.people, b: 'Identificar impactos reales y potenciales', t: 'Considerar los temas descritos en los Estándares Sectoriales', color: 'var(--teal)' },
      { pos: 'top', ic: SVG.people, b: 'Evaluar la importancia de los impactos', t: 'Contar con la participación de grupos de interés y expertos', color: 'var(--orange-strong)' },
      { pos: 'bot', ic: SVG.target, b: 'Determinar los temas materiales', t: 'Analizar los temas con expertos y usuarios de la información', color: 'var(--purple)' },
    ];
    const lefts = ['0%', '25%', '50%', '75%'];
    const html = cells.map((c, i) =>
      '<div class="cell ' + c.pos + '" data-step="' + i + '" style="left:' + lefts[i] + '"><b>' + esc(c.b) + '</b>' +
      (c.ic ? '<div class="ic" style="fill:' + c.color + '">' + c.ic + '</div>' : '<div class="ic" style="height:74px"></div>') +
      '<div style="color:#3a4557;font-size:13px">' + esc(c.t) + '</div></div>'
    ).join('');
    return gri(false) +
      '<div class="sl-title">Proceso para la determinación de los temas materiales</div>' +
      '<div class="tl4"><div class="bar" data-step="always"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>' + html + '</div>';
  };

  // ---- caso: cadena de valor (slide 45) ----
  V.casechain = function (s, d) {
    const stages = [
      { t: 'Abastecimiento', ic: SVG.box, img: 'image109.png' },
      { t: 'Operación', ic: SVG.factory, img: '' },
      { t: 'Distribución y venta', ic: SVG.truck, img: '' },
    ];
    const cols = stages.map((st, i) =>
      '<div style="flex:1;text-align:center" data-step="' + i + '">' +
      '<div style="font-size:22px;font-weight:bold;color:#1D2634;margin-bottom:20px">' + esc(st.t) + '</div>' +
      '<div style="width:150px;height:150px;margin:0 auto;border-radius:16px;background:var(--blue);display:flex;align-items:center;justify-content:center">' +
      '<div style="width:78px;height:78px;fill:#fff">' + st.ic + '</div></div></div>' +
      (i < 2 ? '<div style="align-self:center;color:var(--gray-mid);font-size:44px;font-weight:bold" data-step="' + i + '">»</div>' : '')
    ).join('');
    return caseTag('Caso de estudio') + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:180px;bottom:120px;display:flex;align-items:center;gap:10px">' + cols + '</div>' +
      anexoCTA();
  };

  // ---- caso: detalle de etapa (slides 46,47) ----
  V.casedetail = function (s, d) {
    const stg = { abastecimiento: { t: 'Abastecimiento', ic: SVG.box }, operacion: { t: 'Operación', ic: SVG.factory } }[d.stage] || { t: 'Caso de estudio', ic: SVG.clip };
    return caseTag('Caso de estudio') + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:150px;bottom:110px;display:flex;gap:34px;align-items:center">' +
      '<div style="flex:0 0 230px;text-align:center" data-step="always">' +
      '<div style="width:180px;height:180px;margin:0 auto 16px;border-radius:20px;background:var(--blue);display:flex;align-items:center;justify-content:center"><div style="width:92px;height:92px;fill:#fff">' + stg.ic + '</div></div>' +
      '<div style="font-size:24px;font-weight:bold;color:var(--blue)">' + esc(stg.t) + '</div></div>' +
      '<div class="callout" data-step="always" style="flex:1;font-size:15.5px;line-height:1.6;max-height:420px;overflow-y:auto">' + esc(caseText(d.stage)) + '</div>' +
      '</div>' + anexoCTA();
  };
  function caseText(stage) {
    if (stage === 'abastecimiento') return 'En la etapa de abastecimiento, la compañía enfrenta desafíos relacionados con el impacto ambiental de sus prácticas. Depende de una red diversa de proveedores en distintas regiones del país y del extranjero, lo que genera preocupaciones sobre la sostenibilidad de la producción de materias primas, el uso de agua y tierra, y el uso de agroquímicos. No son claras las condiciones laborales de los proveedores ni el cumplimiento normativo, generando inquietudes sobre derechos humanos. La organización inició un plan para evaluar a sus proveedores y sus prácticas ASG.';
    if (stage === 'operacion') return 'La compañía estableció un sistema de gestión ambiental que reduce el consumo de agua y energía y la generación de residuos, con controles de calidad e inocuidad alimentaria. Persisten presiones por el desperdicio de alimentos, las condiciones laborales y los efectos en comunidades locales por ruido y contaminación de fuentes hídricas. La empresa implementó planes de desarrollo comunitario y un proyecto con la academia para reformular sus productos hacia opciones más saludables.';
    return '';
  }

  // ---- caso: información general + indicadores (slide 49) ----
  V.caseinfo = function (s, d) {
    const info = [
      ['Ubicación', 'Colombia', 'Opera solo en su país, sin filiales en el exterior.'],
      ['Tamaño de operaciones', '3 plantas de producción', 'Este año inauguró una planta de productos bajos en azúcar.'],
      ['Cadena de abastecimiento', 'Proveedores en +10 países', 'Sin procesos de debida diligencia en sus proveedores.'],
      ['Distribución', 'Nivel nacional', 'Explora expandirse a otros países.'],
      ['Empleados', '3.000 empleados', 'Crecimiento del 17 % frente al último año.'],
      ['Participación de mercado', '10 %', 'Sin variaciones significativas en los últimos años.'],
    ];
    const rows = info.map((r, i) => '<tr data-step="' + i + '"><td class="lead">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join('');
    return caseTag('Caso de estudio') + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:120px;bottom:44px">' +
      '<div style="font-size:16px;font-weight:bold;color:var(--blue);margin-bottom:10px" data-step="always">Información general de la organización</div>' +
      '<table class="tbl compact"><thead><tr><th>Característica</th><th>Información</th><th>Otros datos relevantes</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '</div>' + anexoCTA();
  };

  // ---- caso: tabla de impactos por etapa (slides 60-62) ----
  V.impacttable = function (s, d) {
    const rows = (d.rows || []).map((r, i) =>
      '<tr data-step="' + i + '"><td>' + (r[0] ? '<span class="pos">' + esc(r[0]) + '</span>' : '') + '</td><td>' + (r[1] ? '<span class="pos">' + esc(r[1]) + '</span>' : '') + '</td><td>' + (r[2] ? '<span class="neg">' + esc(r[2]) + '</span>' : '') + '</td><td>' + (r[3] ? '<span class="neg">' + esc(r[3]) + '</span>' : '') + '</td></tr>'
    ).join('');
    return caseTag('Impactos: ' + esc(d.stage)) + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:110px;bottom:40px">' +
      '<table class="tbl compact"><thead>' +
      '<tr><th colspan="2" style="background:#2E9E5B">Impactos positivos</th><th colspan="2" style="background:#C0392B">Impactos negativos</th></tr>' +
      '<tr><th>Reales</th><th>Potenciales</th><th>Reales</th><th>Potenciales</th></tr>' +
      '</thead><tbody>' + rows + '</tbody></table></div>';
  };

  // ---- caso: tabla de temas para evaluar (slide 69) ----
  V.evaltable = function (s, d) {
    const themes = [
      ['Cambio climático', 'Contribución significativa a las emisiones de GEI.'],
      ['Gestión de residuos', 'Generación considerable de residuos sólidos y líquidos.'],
      ['Uso del agua', 'Consumo intensivo de agua.'],
      ['Biodiversidad', 'Pérdida de hábitats naturales.'],
      ['Nutrición y salud de los clientes', 'Calidad y seguridad de los alimentos producidos.'],
      ['Desarrollo de las comunidades', 'Impacto en el desarrollo económico y social local.'],
      ['Bienestar de los empleados', 'Condiciones laborales y ambiente de trabajo.'],
      ['Seguridad y salud en el trabajo', 'Prevención de accidentes laborales.'],
      ['Gestión de cadena de abastecimiento', 'Abastecimiento sostenible y DDHH en la cadena.'],
      ['Desempeño económico', 'Rentabilidad y crecimiento financiero.'],
    ];
    const rows = themes.map((t, i) => '<tr data-step="' + i + '"><td class="lead">' + esc(t[0]) + '</td><td>' + esc(t[1]) + '</td></tr>').join('');
    return caseTag('Caso de estudio: temas a evaluar') + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:118px;bottom:36px">' +
      '<table class="tbl compact"><thead><tr><th style="width:38%">Tema</th><th>Descripción del impacto</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  };

  // ---- caso: ficha de evaluación de un impacto (slides 70-72) ----
  V.evalcard = function (s, d) {
    const rowsData = d.rows || [];
    const rows = rowsData.map((r, i) =>
      '<tr data-step="' + i + '"><td class="lead" style="width:26%">' + esc(r[0]) + '</td><td><b style="color:var(--blue)">' + esc(r[1]) + '</b> ' + esc(r[2] || '') + '</td></tr>'
    ).join('');
    return caseTag('Ejemplo de evaluación') + gri(false) +
      '<div style="position:absolute;left:112px;right:64px;top:110px;bottom:40px">' +
      '<div class="tag-step" data-step="always" style="background:' + (d.color || 'var(--blue)') + '">' + esc(d.impact) + '</div>' +
      '<table class="tbl compact"><tbody>' + rows + '</tbody></table></div>';
  };

  // ---- desarrollo sostenible (slide 22) ----
  V.sostenible = function (s, d) {
    return gri(false) +
      '<div class="sl-title">Desarrollo sostenible</div>' +
      '<div class="sl-body"><div class="cols2">' +
      '<div data-step="0"><div style="font-size:19px;color:#2A3240;margin-bottom:22px">¿De dónde nace el concepto de desarrollo sostenible?</div>' +
      '<div class="quote">“Satisfacer las necesidades del presente sin comprometer la habilidad de las futuras generaciones de satisfacer sus necesidades propias.”</div>' +
      '<div style="margin-top:14px;color:#5B6675;font-size:14px">— Comisión Brundtland, Naciones Unidas, 1987</div></div>' +
      '<div class="imgbox" data-step="1"><img src="' + IMG + 'image14.jpeg" style="border-radius:14px;max-height:420px" alt=""></div>' +
      '</div></div>';
  };

  // ---- análisis de materialidad / doble materialidad (slide 23) ----
  V.doublemat = function (s, d) {
    return gri(false) +
      '<div class="sl-title">Análisis de materialidad</div>' +
      '<div class="sl-body"><div class="callout" data-step="0" style="margin-bottom:18px">El análisis de materialidad es un proceso estratégico para <b>identificar y priorizar los temas más relevantes</b> que afectan al negocio y a sus grupos de interés.</div>' +
      '<div class="grid2" style="height:auto">' +
      '<div class="gcard blue" data-step="1"><b>Materialidad de impacto</b>Efectos de la organización sobre la economía, el medio ambiente y las personas. <b style="display:inline">Es el enfoque del GRI.</b></div>' +
      '<div class="gcard" data-step="2"><b>Materialidad financiera</b>Cuestiones ASG que generan riesgos u oportunidades financieras para la organización.</div>' +
      '</div>' +
      '<div class="callout" data-step="3" style="margin-top:18px">Ambos enfoques son <b>complementarios</b>: juntos ofrecen una visión integral de la sostenibilidad (doble materialidad, Comisión Europea, 2019).</div>' +
      '</div></div>';
  };

  // ---- resumen final (slide 97) ----
  V.summary = function (s, d) {
    const items = d.bullets || ['Contexto del análisis de materialidad', 'Proceso para la definición de la materialidad', 'Determinación de la información a reportar'];
    const rows = items.map((t, i) => '<div class="sum-item" data-step="' + i + '"><div class="ck">' + SVG.check + '</div><div>' + esc(t) + '</div></div>').join('');
    return gri(false) +
      '<div class="sl-panel"><div class="pt">Resumen</div></div>' +
      '<div class="sl-body"><div style="font-size:16px;color:#5B6675;margin-bottom:18px" data-step="always">Un recorrido para realizar un análisis de materialidad conforme a los Estándares GRI:</div><div class="sum-list" style="height:auto">' + rows + '</div></div>';
  };

  // ---- contenidos GRI 3-x (slides 91, 92) ----
  V.gri3 = function (s, d) {
    const cards = (d.cards || []).map((c, i) =>
      '<div class="gri3-card" data-step="' + i + '"><div class="gri3-hd">' + esc(c[0]) + '</div><ul class="gri3-list">' +
      c[1].map(li => '<li>' + esc(li) + '</li>').join('') + '</ul></div>'
    ).join('');
    const cols = (d.cards || []).length > 1 ? 'grid-template-columns:1fr 1fr' : 'grid-template-columns:1fr';
    return gri(false) +
      '<div class="sl-title sm">Contenidos sobre los temas materiales</div>' +
      '<div class="sl-body" style="top:104px"><div style="display:grid;' + cols + ';gap:22px;height:100%;align-content:start">' + cards + '</div></div>';
  };

  // helpers compartidos
  function caseTag(t) { return '<div class="case-tag"><div class="ic">' + SVG.clip + '</div>' + esc(t) + '</div>'; }
  function anexoCTA() {
    return '<a class="anexo-cta" href="anexos/Caso-de-estudio-Alimentos-SA.pdf" target="_blank">' + SVG.download + ' Descargar caso de estudio (PDF)</a>';
  }

  // ============================================================
  //  OVERRIDES por número de diapositiva
  // ============================================================
  window.SLIDE_OVERRIDES = {
    1: { kind: 'cover', h1: 'Materialidad de impacto', sub: 'Tutorías GRI', photo: 'image2.jpeg', navTitle: 'Portada' },
    3: { kind: 'toc', moduleLabel: 'Contenido de la tutoría', items: ['Módulo 1: Introducción a los Estándares GRI', 'Módulo 2: Contexto del análisis de materialidad', 'Módulo 3: Proceso para la definición de la materialidad', 'Módulo 4: Determinación de la información a reportar'], numbered: true, navTitle: 'Contenido de la tutoría' },
    6: { kind: 'panelBullets', title: '¿Qué es el GRI?', bullets: ['El GRI (Global Reporting Initiative) es una organización internacional independiente que ayuda a las organizaciones a asumir la responsabilidad de sus impactos.', 'Proporciona un lenguaje común global para comunicar los impactos en la economía, el medio ambiente y las personas, incluidos los derechos humanos.', 'Sus Estándares permiten informar de forma transparente sobre las contribuciones, positivas o negativas, al desarrollo sostenible.'] },
    7: { kind: 'stdsystem', navTitle: 'Sistema de los Estándares GRI' },
    8: { kind: 'conceptDef', active: 0, def: 'Se refiere a los efectos que una organización tiene o podría tener sobre la economía, el medio ambiente y las personas, incluidos sus derechos humanos. Pueden ser positivos o negativos, reales o potenciales, de corto o largo plazo, intencionados o no, reversibles o irreversibles. Los impactos en la economía, el medio ambiente y las personas están interrelacionados.' },
    9: { kind: 'conceptDef', active: 1, def: 'Es el proceso que una organización sigue para identificar, prevenir, mitigar y gestionar sus impactos. Debe abordar los impactos negativos potenciales mediante prevención o mitigación, y los reales mediante remediación. Los impactos se priorizan según su gravedad y probabilidad; en derechos humanos, la gravedad es el factor principal.' },
    10: { kind: 'conceptDef', active: 2, def: 'Al usar los Estándares GRI, una organización identifica múltiples impactos pero se enfoca en los más significativos: los temas materiales. Un tema material puede abarcar impactos económicos, ambientales y sociales a la vez. Por ejemplo, "agua y efluentes" puede ser material si el uso de agua afecta tanto a los ecosistemas como al acceso al agua de las comunidades.' },
    11: { kind: 'conceptDef', active: 3, def: 'Son individuos o colectivos que se ven o podrían verse afectados por las actividades de una organización: empleados, comunidades, clientes, proveedores, gobiernos, ONG, inversores, sindicatos y grupos vulnerables, entre otros. La debida diligencia se enfoca en identificar los intereses que podrían verse afectados negativamente, incluso de grupos sin relación directa con la organización.' },
    12: { kind: 'conform', active: 1, navTitle: '¿Cómo se reporta? (1/5)' },
    13: { kind: 'conform', active: 2, navTitle: '¿Cómo se reporta? (2/5)' },
    14: { kind: 'conform', active: 4, navTitle: '¿Cómo se reporta? (3/5)' },
    15: { kind: 'conform', active: 6, navTitle: '¿Cómo se reporta? (4/5)' },
    16: { kind: 'conform', active: 9, navTitle: '¿Cómo se reporta? (5/5)' },
    17: { kind: 'bullets', title: 'Opción "En referencia"', sub: 'Cuando no se pueden cumplir todos los requisitos de conformidad, se cumplen 3 requisitos:', bullets: ['Publicar un índice de contenidos GRI.', 'Proporcionar una declaración de uso.', 'Notificar a GRI.', 'Además, se debería aplicar los 8 principios de elaboración de informes y explicar cómo se gestionan los impactos (Contenido 3-3), e iniciar la transición hacia la opción "De conformidad".'], navTitle: 'Opción "En referencia"' },
    18: { kind: 'omissions', navTitle: 'Uso de las omisiones' },
    22: { kind: 'sostenible', navTitle: 'Desarrollo sostenible' },
    23: { kind: 'doublemat', navTitle: 'Análisis de materialidad' },
    24: { kind: 'timeline4', navTitle: 'Proceso de determinación (4 pasos)' },
    45: { kind: 'casechain', navTitle: 'Caso de estudio: cadena de valor' },
    49: { kind: 'caseinfo', navTitle: 'Caso: información e indicadores' },
    60: {
      kind: 'impacttable', stage: 'abastecimiento', navTitle: 'Impactos: abastecimiento',
      rows: [
        ['Programas de desarrollo social generan empleo e infraestructura en comunidades locales.', 'Las compras locales pueden impulsar el crecimiento económico de las comunidades.', 'Emisiones de GEI de la agricultura (metano, óxido nitroso) que contribuyen al cambio climático.', 'Condiciones laborales precarias, bajos salarios y largas jornadas de los trabajadores agrícolas.'],
        ['', '', 'Efectos negativos en la biodiversidad por la expansión de la frontera agrícola.', 'Riesgo de violaciones a derechos humanos (trabajo infantil, forzoso) y uso de agua en zonas de estrés hídrico.'],
      ]
    },
    61: {
      kind: 'impacttable', stage: 'operación', navTitle: 'Impactos: operación',
      rows: [
        ['La mejora de condiciones laborales aumenta la calidad de vida y la satisfacción de los empleados.', 'La presencia de la empresa impulsa el desarrollo económico de las zonas de influencia.', 'Emisiones de contaminantes al aire (CO2, metano, COV) por maquinaria y calderas.', 'Residuos de manufactura y empaque que contaminan y afectan ecosistemas si no se gestionan.'],
        ['', '', 'El desperdicio de alimentos genera contaminación y emisiones adicionales.', 'Consumo de agua en zonas de alto estrés hídrico y riesgo de accidentes laborales.'],
      ]
    },
    62: {
      kind: 'impacttable', stage: 'distribución', navTitle: 'Impactos: distribución',
      rows: [
        ['La distribución crea empleos y beneficios económicos en el sector logístico.', 'Una distribución eficiente fortalece las relaciones comerciales con minoristas y socios.', 'Emisiones de la flota a diésel y gasolina; residuos de los productos vendidos.', 'Etiquetado sin información suficiente que puede desinformar al consumidor final.'],
        ['', '', 'Dependencia de combustibles fósiles no renovables.', 'Efectos en la salud de los consumidores por las características nutricionales.'],
      ]
    },
    69: { kind: 'evaltable', navTitle: 'Caso: temas a evaluar' },
    70: {
      kind: 'evalcard', impact: 'Cambio climático (emisiones de GEI)', color: 'var(--purple)', navTitle: 'Evaluación: cambio climático',
      rows: [
        ['Gravedad', 'Alto —', 'toda la cadena de valor depende de combustibles fósiles, con impacto significativo en el cambio climático.'],
        ['Escala', '', 'Contaminación del aire por combustibles fósiles que deteriora la calidad ambiental y afecta a la comunidad.'],
        ['Alcance', 'Muy alto —', 'puede afectar la calidad de vida de poblaciones aledañas por las emisiones.'],
        ['Irremediable', 'Grado medio —', 'la remediación exige recursos humanos, técnicos, tecnológicos y financieros.'],
        ['Probabilidad', 'Muy alta —', 'sin un control efectivo en origen, los impactos se harán evidentes.'],
      ]
    },
    71: {
      kind: 'evalcard', impact: 'Seguridad y salud en el trabajo', color: 'var(--orange-strong)', navTitle: 'Evaluación: SST',
      rows: [
        ['Gravedad', 'Medio —', 'el manejo de maquinaria, vehículos y sustancias químicas puede causar accidentes y enfermedades laborales.'],
        ['Escala', '', 'Exposición de trabajadores en abastecimiento (fertilizantes), producción (maquinaria) y distribución (carga pesada).'],
        ['Alcance', 'Alto —', 'problemas respiratorios y dermatológicos, atrapamientos, fracturas y lesiones osteomusculares.'],
        ['Irremediable', 'Grado medio —', 'medidas administrativas, preventivas y correctivas contrarrestan la ocurrencia.'],
        ['Probabilidad', 'Media —', 'por la naturaleza de las actividades industriales en las tres etapas.'],
      ]
    },
    72: {
      kind: 'evalcard', impact: 'Desarrollo de las comunidades locales', color: 'var(--teal)', navTitle: 'Evaluación: comunidades',
      rows: [
        ['Escala', '', 'Impacto significativo en el desarrollo económico y social mediante programas con la comunidad aledaña.'],
        ['Alcance', 'Baja —', 'los programas representan solo el 2 % del valor distribuido en el año; benefician a la región pero no son significativos para la compañía.'],
        ['Probabilidad', 'Media —', 'los programas de desarrollo social generan impactos positivos y desarrollan capacidades.'],
      ]
    },
    89: { kind: 'bullets', title: '¿Cómo identificar los contenidos para un tema material?', navTitle: 'Identificar contenidos', bullets: ['Presentar información solo de los contenidos relacionados con los temas materiales.', 'No hay un número mínimo de contenidos: depende de los impactos identificados.', 'Un tema material puede requerir más de un Estándar Temático.', 'Cuando aplique, usar los Estándares Sectoriales GRI.', 'Si un impacto no está en los Estándares GRI, la organización puede crear indicadores propios.'] },
    90: { kind: 'bullets', title: 'Recomendaciones para identificar la información a reportar', navTitle: 'Recomendaciones de reporte', bullets: ['Identificar los Estándares GRI relevantes para cada tema material.', 'Relacionar los temas materiales con los contenidos GRI (matriz de vínculo).', 'Considerar los insumos de los diálogos con grupos de interés.', 'Integrar los contenidos en la estructura del reporte con tablas y gráficos.', 'Monitoreo y actualización continua del informe.'] },
    91: { kind: 'gri3', navTitle: 'Contenidos GRI 3-1 y 3-2', cards: [['Contenido 3-1 · Proceso de determinación de los temas materiales', ['Describir el proceso seguido para determinar los temas materiales.', 'Cómo se identificaron los impactos reales y potenciales en toda la cadena de valor.', 'Cómo se priorizaron los impactos según su importancia.', 'Especificar los grupos de interés y expertos que participaron.']], ['Contenido 3-2 · Lista de temas materiales', ['Enumerar los temas materiales de la organización.', 'Informar los cambios frente a la lista del periodo anterior.']]] },
    92: { kind: 'gri3', navTitle: 'Contenido GRI 3-3', cards: [['Contenido 3-3 · Gestión de los temas materiales', ['Describir los impactos reales y potenciales, negativos y positivos.', 'Indicar la relación de la organización con los impactos negativos.', 'Describir políticas y compromisos frente al tema material.', 'Medidas para prevenir, mitigar y remediar los impactos.', 'Seguimiento de la eficacia: metas, objetivos, indicadores y lecciones aprendidas.', 'Cómo la participación de los grupos de interés influyó en las medidas adoptadas.']]] },
    97: { kind: 'summary', navTitle: 'Resumen del curso', bullets: ['Entendimos la importancia del análisis de materialidad para las organizaciones.', 'Recorrimos el proceso para realizar el análisis de materialidad.', 'Abordamos la selección de indicadores y el reporte según los temas materiales.'] },
    98: { kind: 'closing', navTitle: 'Cierre' },
  };
})();
