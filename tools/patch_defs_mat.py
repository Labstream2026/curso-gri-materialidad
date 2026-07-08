#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Parches post-QA a slidedefs_auto.json (idempotente).

Aplica los hallazgos del QA multi-agente vs los PNG exportados del PPT:
- 12-17: etiquetas laterales rotadas -> barras verticales; limpia bloques rotos.
- 18: numerales 01-04 en teal.
- 45-48: banda de ilustración isométrica -> recorte del PNG exportado.
- 49: cajas de las tablas + orden.
- 56: caja del subtítulo.
- 60: celda 'Operación' -> '' (columna combinada Abastecimiento).
- 92: encabezado del literal 'd.'.
- genérico: tablas sin box -> box de ancho completo.
"""
import json, os
from PIL import Image

BASE = '/Users/jonathanf/Desktop/GRI Tutorias/2026 GRI TUTORIAS/Curso impacto'
DEST = os.path.join(BASE, 'curso-html5')
DEFS = os.path.join(DEST, 'data', 'slidedefs_auto.json')
PNGS = os.path.join(BASE, 'GRI_Materialidad_envío 3 (1)')

d = json.load(open(DEFS, encoding='utf-8'))
log = []

def blocks(k):
    return d.get(str(k), {}).get('blocks', [])

def para_join(b):
    return ' '.join(p.get('t', '') for p in b.get('paras', []))

# ---------- 12-17: barras laterales verticales + limpieza ----------
for k in (12, 13, 14, 15, 16, 17):
    bl = blocks(k)
    if not bl:
        continue
    out = []
    for b in bl:
        box = b.get('box')
        fill = (b.get('fill') or '').upper()
        # bloque roto (alto > 800 o texto duplicado gigante)
        if box and box[3] > 800:
            log.append(f'{k}: eliminado bloque roto h={box[3]}')
            continue
        # chips numerados decorativos con kids apilados
        if b.get('type') == 'group' and len(b.get('kids', [])) == 1 and box and abs(box[2] - 58.4) < 1:
            log.append(f'{k}: eliminado chip decorativo y={box[1]}')
            continue
        if b.get('type') == 'text' and fill == 'EF9228':
            b['box'] = [117, 148, 50, 490]; b['vertical'] = True
            log.append(f'{k}: barra naranja vertical')
        elif b.get('type') == 'text' and fill == '22A39E':
            b['box'] = ([173, 148, 50, 490] if k == 17 else [986, 148, 50, 490])
            b['vertical'] = True
            log.append(f'{k}: barra teal vertical')
        elif b.get('type') == 'text' and b.get('box') is None and 'Opciones para la preparación' in para_join(b):
            b['box'] = [106.8, 88, 800, 30]
        elif b.get('type') == 'table' and b.get('box') is None:
            b['box'] = [240, 150, 735, 505]; b['noHead'] = True
        out.append(b)
    d[str(k)]['blocks'] = out

# ---------- 18: numerales 01-04 ----------
b18 = blocks(18)
if b18 is not None and not any(para_join(x) == '01' for x in b18):
    nums = [('01', [127, 187, 95, 60], 2), ('02', [127, 340, 95, 60], 5),
            ('03', [135, 505, 95, 60], 8), ('04', [683, 190, 95, 60], 11)]
    for t, box, step in nums:
        b18.append({'box': box, 'step': step, 'type': 'text',
                    'paras': [{'lvl': 0, 't': t, 'sz': 36, 'b': True,
                               'color': '22A39E', 'bullet': False}]})
    log.append('18: numerales 01-04 añadidos')

# ---------- 45-48: banda de ilustración -> recorte del PNG ----------
# banda en espacio 1280x720; el PNG exportado es 960x540 (factor 0.75)
BANDS = {45: (60, 128, 1220, 535), 46: (85, 92, 1250, 372),
         47: (85, 92, 1250, 376), 48: (85, 92, 1250, 385),
         # 8-11: tarjetas de conceptos (rects+rótulos se perdieron en la extracción;
         # los iconos blancos quedan invisibles sobre fondo blanco)
         8: (505, 170, 1155, 595), 9: (505, 170, 1155, 595),
         10: (505, 170, 1155, 595), 11: (505, 170, 1155, 595)}
for k, (x0, y0, x1, y1) in BANDS.items():
    key = str(k)
    if key not in d:
        continue
    src = os.path.join(PNGS, f'Diapositiva{k}.png')
    if not os.path.exists(src):
        log.append(f'{k}: PNG no encontrado'); continue
    im = Image.open(src)
    sx = im.width / 1280.0
    crop = im.crop((int(x0 * sx), int(y0 * sx * (720/720)), int(x1 * sx), int(y1 * sx)))
    outname = f'img/s/caso{k}.png'
    crop.save(os.path.join(DEST, outname))
    bl = blocks(k)
    keep = []
    for b in bl:
        box = b.get('box') or [0, 0, 0, 0]
        cy = box[1] + box[3] / 2
        inside = (y0 - 10) <= cy <= (y1 + 10)
        # conserva icono de título (arriba izquierda) y texto de cuerpo (abajo)
        if b.get('type') == 'pic' and box[1] < 70:
            keep.append(b); continue
        if b.get('type') == 'text' and not inside:
            keep.append(b); continue
        if b.get('type') == 'text' and inside and len(para_join(b)) > 120:
            keep.append(b); continue  # cuerpo largo que arranca dentro de la banda
        log.append(f'{k}: sustituido bloque {b.get("type")} por recorte')
    keep.insert(0, {'box': [x0, y0, x1 - x0, y1 - y0], 'step': 'always',
                    'type': 'pic', 'src': outname, 'contain': True})
    d[key]['blocks'] = keep

# ---------- 49: cajas de tablas + orden ----------
b49 = blocks(49)
for b in b49:
    if b.get('type') == 'table':
        if len(b.get('rows', [])) == 7:
            b['box'] = [104, 112, 1140, 190]
        elif len(b.get('rows', [])) == 12:
            b['box'] = [104, 342, 1140, 360]
# info general (7 filas) primero
b49.sort(key=lambda b: (b.get('box') or [0, 999])[1] if b.get('type') == 'table' else -1)
log.append('49: tablas posicionadas')

# ---------- 56: subtítulo sin caja ----------
for b in blocks(56):
    if b.get('type') == 'text' and b.get('box') is None and '¿Por dónde empezar?' in para_join(b):
        b['box'] = [106.8, 84, 567, 34]
        log.append('56: subtítulo posicionado')

# ---------- 60: celda combinada ----------
for b in blocks(60):
    if b.get('type') == 'table':
        rows = b.get('rows', [])
        for ri, row in enumerate(rows):
            if ri >= 2 and row and row[0] == 'Operación':
                row[0] = ''
                log.append('60: celda "Operación" vaciada (combinada)')

# ---------- 92: literal d. faltante ----------
b92 = blocks(92)
if b92 and not any('d. describir las medidas' in para_join(x) for x in b92):
    b92.append({'box': [442.8, 372, 759.7, 32.3], 'step': 'always', 'type': 'text',
                'paras': [{'lvl': 0, 't': 'd. describir las medidas adoptadas para gestionar el tema material, incluyendo:',
                           'sz': 14.0, 'b': False, 'color': None, 'bullet': None}]})
    log.append('92: literal d. añadido')

# ---------- ronda 2 (auditoría visual) ----------
# 37/42/57: diagramas vectoriales rotos -> recorte del PNG (título nativo)
BANDS2 = {37: (90, 175, 1195, 700), 42: (90, 165, 1205, 700), 57: (90, 190, 1195, 700)}
for k, (x0, y0, x1, y1) in BANDS2.items():
    key = str(k)
    if key not in d:
        continue
    bl = blocks(k)
    if any(b.get('src', '').endswith(f'caso{k}.png') for b in bl):
        pass  # ya recortado
    src = os.path.join(PNGS, f'Diapositiva{k}.png')
    if not os.path.exists(src):
        continue
    im = Image.open(src)
    sx = im.width / 1280.0
    crop = im.crop((int(x0 * sx), int(y0 * sx), int(x1 * sx), int(y1 * sx)))
    outname = f'img/s/caso{k}.png'
    crop.save(os.path.join(DEST, outname))
    keep = []
    for b in bl:
        if b.get('src', '').startswith('img/s/caso'):
            continue  # recorte previo: se regenera
        box = b.get('box') or [0, 0, 0, 0]
        cy = box[1] + box[3] / 2
        if b.get('type') == 'pic' and box[1] < 70:
            keep.append(b); continue
        if b.get('type') == 'text' and cy < (y0 - 6):
            keep.append(b); continue
        log.append(f'{k}: bloque {b.get("type")} -> recorte (r2)')
    keep.insert(0, {'box': [x0, y0, x1 - x0, y1 - y0], 'step': 'always',
                    'type': 'pic', 'src': outname, 'contain': True})
    d[key]['blocks'] = keep

# 49: tablas compactas sin solaparse
for b in blocks(49):
    if b.get('type') == 'table':
        if len(b.get('rows', [])) == 7:
            b['box'] = [104, 100, 1140, 200]; b['fs'] = 11; b['compact'] = True
        elif len(b.get('rows', [])) == 12:
            b['box'] = [104, 345, 1140, 355]; b['fs'] = 10.5; b['compact'] = True
log.append('49: tablas compactadas')

# icono del caso pisando el título -> esquina
for k, v in d.items():
    for b in v.get('blocks', []):
        if b.get('type') == 'pic' and 'image109' in (b.get('src') or '') and (b.get('box') or [99])[0] > 40:
            b['box'] = [16, 16, 42, 42]
            log.append(f'{k}: icono del caso a la esquina')

# 18: heading 'Prohibiciones legales' en una línea
for b in blocks(18):
    if b.get('type') == 'text' and 'Prohibiciones legales' in para_join(b):
        for p in b.get('paras', []):
            if p.get('t') == 'Prohibiciones legales' and (p.get('sz') or 99) > 19:
                p['sz'] = 19
                log.append('18: heading 02 compactado')

# 22: cita blanca sobre panel azul
for b in blocks(22):
    if b.get('type') == 'text' and 'Satisfacer las necesidades' in para_join(b) and not b.get('fill'):
        b['fill'] = '23559F'
        log.append('22: cita con fondo azul propio (texto blanco)')

# ---------- genérico: tablas sin box ----------
for k, v in d.items():
    for b in v.get('blocks', []):
        if b.get('type') == 'table' and b.get('box') is None:
            b['box'] = [104, 150, 1140, 520]
            log.append(f'{k}: tabla sin box -> ancho completo')

json.dump(d, open(DEFS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(log)} parches aplicados:')
for l in log:
    print(' -', l)
