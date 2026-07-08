#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quizzes de tarjetas para Materialidad: letras por regex, extracción exacta
desde los fragmentos pdfmix ORIGINALES, verificación de cobertura y tarjetas.
"""
import json, re, html, os, sys

OUT = '/Users/jonathanf/Desktop/GRI Tutorias/2026 GRI TUTORIAS/Curso impacto/curso-html5'
frags = json.load(open(OUT + '/data/slides_html.json', encoding='utf-8'))
model = json.load(open(OUT + '/data/course_model.json', encoding='utf-8'))
byid = {s['id']: s for s in model['slides']}

QUESTIONS = ['s27', 's29', 's31', 's74', 's76', 's78']
ANSWER = {'s27': 's28', 's29': 's30', 's31': 's32', 's74': 's75', 's76': 's77', 's78': 's79'}

# ---- 1. letras correctas por regex sobre la narración de la RESPUESTA ----
RX = re.compile(r'(?:respuesta|opci[oó]n) correcta es la\s*([a-e])', re.I)
quiz_data = {}
for q, a in ANSWER.items():
    narr = ' '.join(p.get('text', '') for p in byid[a]['parts'])
    m = RX.search(narr)
    if not m:
        print(f'SIN LETRA en {a}: {narr[:90]}'); sys.exit(1)
    quiz_data[q] = {'correct': m.group(1).lower(), 'answerSlide': a}
print('letras:', {k: v['correct'] for k, v in quiz_data.items()})

# coherencia con el modelo (correct ya anotado por build_model_mat)
for q, v in quiz_data.items():
    if byid[q].get('correct') != v['correct']:
        print(f'DESAJUSTE {q}: modelo={byid[q].get("correct")} regex={v["correct"]}'); sys.exit(1)

# ---- 2. guardar fragmentos originales y extraer ----
orig = {q: frags[q] for q in QUESTIONS}
json.dump(orig, open(OUT + '/data/quiz_orig_frags.json', 'w'), ensure_ascii=False)

LINE = re.compile(r'<div data-step="([^"]+)"[^>]*style="([^"]*)"[^>]*>(.*?)</div>', re.S)

def lines_of(frag):
    out = []
    for m in LINE.finditer(frag):
        step, style, inner = m.groups()
        if 'color:#ffffff' in style or 'color:#fefefe' in style:
            continue
        pl = re.search(r'left:([\d.]+)px;top:([\d.]+)px', style)
        if not pl:
            continue
        txt = html.unescape(re.sub(r'<[^>]+>', '', inner))
        if txt.strip():
            out.append({'step': step, 'left': float(pl.group(1)), 'top': float(pl.group(2)), 'txt': txt})
    out.sort(key=lambda l: (l['top'], l['left']))
    return out

TITULOS = re.compile(r'^\s*(¡?pong[aá]monos a prueba!?|pregunta|comprobaci[oó]n de conocimiento)\s*$', re.I)
LETTER = re.compile(r'^\s*([A-Ea-e])\s*$')   # ancla: la letra sola (círculo del PPT)

res, problemas = {}, []
seq = {}
for q in QUESTIONS:
    seq.setdefault(byid[q]['module'], []).append(q)

for sid in QUESTIONS:
    ls = [l for l in lines_of(orig[sid]) if l['step'] != 'always']
    # 1) anclas = divs con la letra sola
    anchors = []   # (letter, top)
    rest = []
    title = None
    for l in ls:
        t = l['txt'].strip()
        m = LETTER.match(t)
        if m:
            anchors.append((m.group(1).lower(), l['top']))
        elif TITULOS.match(t) and title is None:
            title = t
        else:
            rest.append(l)
    anchors.sort(key=lambda a: a[1])
    first_top = anchors[0][1] if anchors else 1e9
    # 2) pregunta = líneas por encima de la primera letra; opciones = por cercanía vertical
    q_parts, opt_lines = [], {a[0]: [] for a in anchors}
    for l in sorted(rest, key=lambda x: (x['top'], x['left'])):
        if l['top'] < first_top - 40:
            q_parts.append(l['txt'].strip())
        else:
            best = min(anchors, key=lambda a: abs(l['top'] - a[1]))
            opt_lines[best[0]].append((l['top'], l['left'], l['txt'].strip()))
    joinp = lambda parts: re.sub(r'\s+', ' ', ' '.join(parts)).strip()
    opts = [(letter, [t for (_tp, _lf, t) in sorted(opt_lines[letter])]) for letter, _ in anchors]
    opts.sort(key=lambda o: o[0])
    letters = [o[0] for o in opts]
    if letters != sorted(set(letters)) or len(letters) < 3 or any(not o[1] for o in opts):
        problemas.append(f'{sid}: letras {letters} vacías={[o[0] for o in opts if not o[1]]}')
    mod = byid[sid]['module']
    idx = seq[mod].index(sid) + 1
    badge = '%s · Pregunta %d de %d' % (model['modules'][str(mod)].split(':')[0], idx, len(seq[mod]))
    res[sid] = {'badge': badge, 'title': title, 'question': joinp(q_parts),
                'options': [{'letter': o[0], 'text': joinp(o[1])} for o in opts],
                'correct': quiz_data[sid]['correct']}

# ---- 3. VERIFICACIÓN de cobertura: toda línea visible queda contenida ----
fails = []
for sid in QUESTIONS:
    whole = ' '.join([res[sid]['title'] or '', res[sid]['question']] +
                     [o['text'] for o in res[sid]['options']])
    whole = re.sub(r'\s+', ' ', whole)
    for l in lines_of(orig[sid]):
        if l['step'] == 'always':
            continue
        t = re.sub(r'\s+', ' ', re.sub(r'^\s*[a-e]\)\s*', '', l['txt'])).strip()
        if re.fullmatch(r'[A-Ea-e]', t):
            continue  # ancla de letra (círculo)
        if t and t not in whole:
            fails.append(f'{sid}: NO CUBIERTA: "{t[:70]}"')
if problemas or fails:
    print('PROBLEMAS:', problemas); print('\n'.join(fails)); sys.exit(1)
print('cobertura OK en', len(QUESTIONS), 'preguntas')

# ---- 4. tarjetas .quizx ----
esc = lambda t: html.escape(t or '', quote=True)
for sid, q in res.items():
    parts = ['<div class="quizx">', '<div class="qx-band"></div>', '<div class="qx-logo">GRI</div>',
             '<div class="qx-badge">%s</div>' % esc(q['badge'].upper())]
    step = 0
    if q['title']:
        parts.append('<div class="qx-title" data-step="%d">%s</div>' % (step, esc(q['title']))); step += 1
    parts.append('<div class="qx-q" data-step="%d">%s</div>' % (step, esc(q['question']))); step += 1
    parts.append('<div class="qx-opts" data-n="%d">' % len(q['options']))
    for o in q['options']:
        parts.append('<button class="qx-opt" type="button" data-letter="%s" data-step="%d">'
                     '<span class="qx-l">%s</span><span class="qx-t">%s</span><span class="qx-mark"></span></button>'
                     % (o['letter'], step, o['letter'].upper(), esc(o['text'])))
        step += 1
    parts.append('</div></div>')
    frags[sid] = ''.join(parts)

json.dump(frags, open(OUT + '/data/slides_html.json', 'w'), ensure_ascii=False)
json.dump({'quizzes': res}, open(OUT + '/data/quizx_data.json', 'w'), ensure_ascii=False, indent=1)
print('tarjetas construidas:', len(res))
for sid in ('s27', 's74'):
    q = res[sid]
    print('---', sid, '|', q['badge'], '| correcta:', q['correct'])
    print('  Q:', q['question'][:90])
    for o in q['options']:
        print('  %s) %s' % (o['letter'], o['text'][:64]))
