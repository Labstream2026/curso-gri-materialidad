#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extrae geometría/animaciones de la PPT de Materialidad y genera defs AUTO.

Adaptado de las tools del curso Cadena de valor para que ambos cursos sean
visualmente idénticos (arquetipo AUTO: texto nativo + imágenes posicionadas).

Salidas:
  data/ppt_main.json      — shapes con box 1280x720, fills, paras, anim
  img/s/<archivo>         — imágenes re-encodadas (baseline, <=1600px)
  data/slidedefs_auto.json — kind auto/mcover/magenda/mdivider/prooftest/quiz/mthanks
"""
import json, os, re, sys, zipfile, io
from xml.etree import ElementTree as ET
from PIL import Image

BASE = '/Users/jonathanf/Desktop/GRI Tutorias/2026 GRI TUTORIAS/Curso impacto'
COURSE = os.path.join(BASE, 'curso-html5')
PPTX = os.path.join(BASE, 'GRI_Materialidad_envío 3 (1).pptx')
DATA = os.path.join(COURSE, 'data')
IMGDIR = os.path.join(COURSE, 'img', 's')

NS = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}
def q(tag):
    pfx, local = tag.split(':')
    return f'{{{NS[pfx]}}}{local}'

def px(v):
    return round(int(v) / 9525.0, 1)

def para_text(txbody):
    paras = []
    for pnode in txbody.findall(q('a:p')):
        ppr = pnode.find(q('a:pPr'))
        lvl = int(ppr.get('lvl', '0')) if ppr is not None else 0
        bullet = None
        if ppr is not None:
            if ppr.find(q('a:buNone')) is not None:
                bullet = False
            elif ppr.find(q('a:buChar')) is not None or ppr.find(q('a:buAutoNum')) is not None:
                bullet = True
        txt = ''
        sz = None; bold = False; color = None
        for rnode in pnode.findall(q('a:r')):
            tnode = rnode.find(q('a:t'))
            txt += tnode.text or '' if tnode is not None else ''
            rpr = rnode.find(q('a:rPr'))
            if rpr is not None:
                if sz is None and rpr.get('sz'):
                    sz = int(rpr.get('sz')) / 100.0
                if rpr.get('b') == '1':
                    bold = True
                if color is None:
                    clr = rpr.find('.//' + q('a:srgbClr'))
                    if clr is not None:
                        color = clr.get('val')
        txt = txt.strip()
        if txt:
            paras.append({'lvl': lvl, 't': txt, 'sz': sz, 'b': bold,
                          'color': color, 'bullet': bullet})
    return paras

def shape_fill(sp):
    sppr = sp.find(q('p:spPr'))
    if sppr is None:
        return None
    fill = sppr.find(q('a:solidFill'))
    if fill is None:
        return None
    clr = fill.find(q('a:srgbClr'))
    if clr is not None:
        return clr.get('val')
    sch = fill.find(q('a:schemeClr'))
    if sch is not None:
        return 'scheme:' + sch.get('val')
    return None

def shape_info(sp, rels, img_counter):
    out = []
    tag = sp.tag
    nv = sp.find('.//' + q('p:cNvPr'))
    spid = nv.get('id') if nv is not None else None
    name = nv.get('name', '') if nv is not None else ''
    xfrm = sp.find('.//' + q('a:xfrm'))
    box = None
    if xfrm is not None:
        off, ext = xfrm.find(q('a:off')), xfrm.find(q('a:ext'))
        if off is not None and ext is not None:
            box = [px(off.get('x')), px(off.get('y')), px(ext.get('cx')), px(ext.get('cy'))]
    if tag == q('p:sp'):
        tx = sp.find(q('p:txBody'))
        paras = para_text(tx) if tx is not None else []
        ph = sp.find('.//' + q('p:ph'))
        kind = 'text'
        if ph is not None:
            kind = 'ph:' + (ph.get('type') or 'body')
        out.append({'spid': spid, 'name': name, 'kind': kind, 'box': box,
                    'fill': shape_fill(sp), 'paras': paras})
    elif tag == q('p:pic'):
        blip = sp.find('.//' + q('a:blip'))
        rid = blip.get(q('r:embed')) if blip is not None else None
        target = rels.get(rid)
        entry = {'spid': spid, 'name': name, 'kind': 'pic', 'box': box, 'img': None}
        # recorte de imagen (srcRect): fracciones l/t/r/b sobre 100000
        src = sp.find('.//' + q('a:srcRect'))
        if src is not None:
            crop = [int(src.get(side, '0') or '0') / 100000.0 for side in ('l', 't', 'r', 'b')]
            if any(c > 0.001 for c in crop):
                entry['crop'] = [round(c, 4) for c in crop]
        if target:
            entry['img'] = target
            img_counter.append((spid, target))
        out.append(entry)
    elif tag == q('p:graphicFrame'):
        tbl = sp.find('.//' + q('a:tbl'))
        if tbl is not None:
            rows = []
            for tr in tbl.findall(q('a:tr')):
                rows.append([' '.join(t.text or '' for t in tc.iter(q('a:t'))).strip()
                             for tc in tr.findall(q('a:tc'))])
            out.append({'spid': spid, 'name': name, 'kind': 'table', 'box': box, 'rows': rows})
        else:
            out.append({'spid': spid, 'name': name, 'kind': 'graphic', 'box': box})
    elif tag in (q('p:grpSp'),):
        kids = []
        for child in sp:
            if child.tag in (q('p:sp'), q('p:pic'), q('p:graphicFrame'), q('p:grpSp')):
                kids.extend(shape_info(child, rels, img_counter))
        out.append({'spid': spid, 'name': name, 'kind': 'group', 'box': box, 'kids': kids})
    return out

def parse_timing(root):
    timing = root.find(q('p:timing'))
    if timing is None:
        return []
    events = []
    def node_dur(ctn):
        durs = [0]
        for beh in ctn.iter():
            if beh.tag == q('p:cTn') and beh.get('dur') and beh.get('dur').isdigit():
                durs.append(int(beh.get('dur')))
        return max(durs)
    def targets(par):
        return [tgt.get('spid') for tgt in par.iter(q('p:spTgt'))]
    seqs = timing.findall('.//' + q('p:seq'))
    main = None
    for s in seqs:
        c = s.find(q('p:cTn'))
        if c is not None and c.get('nodeType') == 'mainSeq':
            main = c
            break
    if main is None:
        return []
    t = 0.0
    order = 0
    child_lst = main.find(q('p:childTnLst'))
    if child_lst is None:
        return []
    for top in child_lst.findall(q('p:par')):
        ctn = top.find(q('p:cTn'))
        if ctn is None:
            continue
        delay = 0
        st = ctn.find(q('p:stCondLst'))
        if st is not None:
            for cond in st.findall(q('p:cond')):
                d = cond.get('delay')
                if d and d.isdigit():
                    delay = max(delay, int(d))
        t += delay
        group_start = t
        group_end = t
        inner = ctn.find(q('p:childTnLst'))
        if inner is None:
            continue
        cur = group_start
        for lvl2 in inner.findall(q('p:par')):
            c2 = lvl2.find(q('p:cTn'))
            if c2 is None:
                continue
            d2 = 0
            st2 = c2.find(q('p:stCondLst'))
            if st2 is not None:
                for cond in st2.findall(q('p:cond')):
                    dd = cond.get('delay')
                    if dd and dd.isdigit():
                        d2 = max(d2, int(dd))
            nt = c2.get('nodeType', '')
            inner3 = c2.find(q('p:childTnLst'))
            effs = inner3.findall(q('p:par')) if inner3 is not None else []
            start = (cur + d2) if nt == 'withEffect' else (group_end + d2)
            end = start
            for e3 in effs:
                c3 = e3.find(q('p:cTn'))
                if c3 is None:
                    continue
                d3 = 0
                st3 = c3.find(q('p:stCondLst'))
                if st3 is not None:
                    for cond in st3.findall(q('p:cond')):
                        dd = cond.get('delay')
                        if dd and dd.isdigit():
                            d3 = max(d3, int(dd))
                dur = node_dur(c3)
                for spid in targets(e3):
                    events.append({'spid': spid, 'order': order,
                                   't_ms': int(start + d3), 'effect': c3.get('presetClass', '')})
                    order += 1
                end = max(end, start + d3 + dur)
            cur = start
            group_end = max(group_end, end)
        t = group_end
    return events

def reencode(path):
    """Baseline/RGB y <=1600px — evita JPEG progresivos que Chrome no decodifica."""
    ext = os.path.splitext(path)[1].lower()
    if ext == '.svg':
        return
    try:
        im = Image.open(path)
    except Exception:
        return
    changed = False
    if im.width > 1600 or im.height > 1600:
        im.thumbnail((1600, 1600))
        changed = True
    if ext in ('.jpg', '.jpeg'):
        im = im.convert('RGB')
        im.save(path, 'JPEG', quality=85, progressive=False, optimize=True)
    elif ext == '.png':
        if changed or os.path.getsize(path) > 900_000:
            im.save(path, 'PNG', optimize=True)
    elif ext in ('.tiff', '.tif', '.bmp', '.gif', '.emf', '.wmf'):
        # convertir a png utilizable
        try:
            im.convert('RGBA').save(os.path.splitext(path)[0] + '.png', 'PNG', optimize=True)
        except Exception:
            pass

def extract():
    z = zipfile.ZipFile(PPTX)
    os.makedirs(IMGDIR, exist_ok=True)
    os.makedirs(DATA, exist_ok=True)
    slide_files = sorted([n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)],
                         key=lambda n: int(re.search(r'(\d+)', n).group(1)))
    slides = []
    exported = {}
    for sf in slide_files:
        n = int(re.search(r'slide(\d+)\.xml', sf).group(1))
        root = ET.fromstring(z.read(sf))
        relf = f'ppt/slides/_rels/slide{n}.xml.rels'
        rels = {}
        if relf in z.namelist():
            rroot = ET.fromstring(z.read(relf))
            for rel in rroot:
                rels[rel.get('Id')] = rel.get('Target')
        img_counter = []
        shapes = []
        tree = root.find(q('p:cSld')).find(q('p:spTree'))
        for child in tree:
            if child.tag in (q('p:sp'), q('p:pic'), q('p:graphicFrame'), q('p:grpSp')):
                shapes.extend(shape_info(child, rels, img_counter))
        for spid, target in img_counter:
            zn = 'ppt/' + target.replace('../', '')
            if zn not in z.namelist():
                continue
            if zn not in exported:
                base = os.path.basename(zn)
                dst_rel = f'img/s/{base}'
                dst_abs = os.path.join(COURSE, dst_rel)
                with z.open(zn) as src, open(dst_abs, 'wb') as g:
                    g.write(src.read())
                reencode(dst_abs)
                exported[zn] = dst_rel
            for sh in shapes:
                if sh.get('kind') == 'pic' and sh.get('spid') == spid:
                    sh['img'] = exported[zn]
                if sh.get('kind') == 'group':
                    def fix(node):
                        for k in node.get('kids', []):
                            if k.get('kind') == 'pic' and k.get('spid') == spid:
                                k['img'] = exported[zn]
                            if k.get('kind') == 'group':
                                fix(k)
                    fix(sh)
        anim = parse_timing(root)
        title = ''
        for sh in shapes:
            if sh.get('kind', '').startswith('ph:title') or sh.get('kind') == 'ph:ctrTitle':
                title = ' '.join(p['t'] for p in sh.get('paras', []))
                break
        slides.append({'n': n, 'title': title, 'shapes': shapes, 'anim': anim})
    with open(os.path.join(DATA, 'ppt_main.json'), 'w', encoding='utf-8') as f:
        json.dump(slides, f, ensure_ascii=False, indent=1)
    na = sum(1 for s in slides if s['anim'])
    print(f'{len(slides)} slides · {na} con animación · {len(exported)} imágenes exportadas')
    return slides

# ------------------------------------------------------------------
#  DEFS
# ------------------------------------------------------------------
SKIP_KINDS = ('ph:sldNum', 'ph:ftr', 'ph:dt')

MODULE_DIV = {4: 'Módulo 1', 20: 'Módulo 2', 34: 'Módulo 3', 87: 'Módulo 4'}
PASO_DIV = {36: 'Paso 1', 52: 'Paso 2', 63: 'Paso 3', 80: 'Paso 4'}
AGENDAS = {3, 5, 21, 35, 88}
PROOF = {26, 44, 73, 83, 93}
QUIZ = {27, 29, 31, 50, 74, 76, 78, 84, 94}

def slide_steps(ppt_slide):
    seen = {}
    for ev in ppt_slide.get('anim', []):
        sp = ev['spid']
        if sp not in seen or ev['t_ms'] < seen[sp]:
            seen[sp] = ev['t_ms']
    ordered = sorted(seen.items(), key=lambda kv: (kv[1], int(kv[0]) if kv[0].isdigit() else 0))
    return {sp: (k + 1, t / 1000.0) for k, (sp, t) in enumerate(ordered)}

def block_from_shape(sh, stepmap):
    k = sh.get('kind', '')
    if k in SKIP_KINDS:
        return None
    step_t = stepmap.get(sh.get('spid'))
    b = {'box': sh.get('box'), 'step': step_t[0] if step_t else 'always'}
    if k == 'pic':
        if not sh.get('img'):
            return None
        b.update(type='pic', src=sh['img'])
        if sh.get('crop'):
            b['crop'] = sh['crop']
    elif k == 'table':
        b.update(type='table', rows=sh.get('rows', []))
    elif k == 'group':
        kids = [block_from_shape(x, stepmap) for x in sh.get('kids', [])]
        kids = [x for x in kids if x]
        if not kids:
            return None
        b.update(type='group', kids=kids)
    elif k == 'graphic':
        return None
    else:
        paras = sh.get('paras') or []
        if not paras and not sh.get('fill'):
            return None
        joined = ' '.join(p['t'] for p in paras)
        if re.fullmatch(r'\d{1,2}', joined.strip() or '') and (sh.get('box') or [0, 0, 0, 0])[3] < 60:
            return None
        b.update(type='text', paras=paras, fill=sh.get('fill'),
                 ph=k if k.startswith('ph:') else None)
    return b

def build_defs(slides):
    defs = {}
    by_n = {s['n']: s for s in slides}
    for s in slides:
        n = s['n']
        texts = [sh for sh in s['shapes'] if sh.get('paras')]
        pics = [sh for sh in s['shapes'] if sh.get('kind') == 'pic' and sh.get('img')]
        joined = ' '.join(p['t'] for sh in texts for p in sh['paras']).strip()

        if n == 1:
            defs['1'] = {'kind': 'mcover', 'navTitle': 'Portada',
                         'module': 'Tutorías GRI', 'title': 'Materialidad de impacto',
                         'sub': 'Tutorías GRI · Estándares de sostenibilidad'}
            continue
        if n == 98:
            defs['98'] = {'kind': 'mthanks', 'navTitle': 'Cierre', 'final': True,
                          'module': 'la tutoría'}
            continue
        if n in MODULE_DIV or n in PASO_DIV:
            sec = MODULE_DIV.get(n) or PASO_DIV.get(n)
            ttl = re.sub(r'^(Módulo\s*\d+|Paso\s*\d+)[:.]?\s*', '', s['title'] or joined).strip() or (s['title'] or joined)
            d = {'kind': 'mdivider', 'navTitle': (sec + ' · ' + ttl)[:46],
                 'section': sec, 'title': ttl}
            if pics:
                d['photo'] = pics[0]['img'].replace('img/', '', 1)
            defs[str(n)] = d
            continue
        if n in AGENDAS:
            big = max(texts, key=lambda sh: len(sh['paras']), default=None)
            items = [p['t'] for p in (big['paras'] if big else []) if len(p['t']) > 2]
            ttl = 'Contenido de la tutoría' if n == 3 else 'Contenido del módulo'
            defs[str(n)] = {'kind': 'magenda', 'navTitle': ttl, 'title': ttl, 'items': items}
            continue
        if n in PROOF:
            defs[str(n)] = {'kind': 'prooftest', 'navTitle': '¡Pongámonos a prueba!'}
            continue
        if n in QUIZ:
            defs[str(n)] = {'kind': 'quiz', 'navTitle': 'Pregunta'}
            continue

        stepmap = slide_steps(s)
        blocks = []
        title = s['title']
        for sh in s['shapes']:
            if sh.get('kind') in ('ph:title', 'ph:ctrTitle'):
                continue
            blk = block_from_shape(sh, stepmap)
            if blk:
                blocks.append(blk)
        defs[str(n)] = {'kind': 'auto', 'title': title, 'blocks': blocks}

    # navTitles únicos para títulos repetidos
    counts = {}
    for s in slides:
        t = (s['title'] or '').strip()
        if t and defs.get(str(s['n']), {}).get('kind') == 'auto':
            counts[t] = counts.get(t, 0) + 1
    seen = {}
    for s in slides:
        t = (s['title'] or '').strip()
        d = defs.get(str(s['n']))
        if d and d.get('kind') == 'auto' and t and counts.get(t, 0) > 1:
            seen[t] = seen.get(t, 0) + 1
            d['navTitle'] = f'{t[:40]} ({seen[t]}/{counts[t]})'

    with open(os.path.join(DATA, 'slidedefs_auto.json'), 'w', encoding='utf-8') as f:
        json.dump(defs, f, ensure_ascii=False, indent=1)
    from collections import Counter
    print('defs:', Counter(v['kind'] for v in defs.values()))

if __name__ == '__main__':
    slides = extract()
    build_defs(slides)
