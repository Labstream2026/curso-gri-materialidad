#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Modelo de Materialidad para el motor pdfmix (formato curso-gri-comunicacion).

Parte del modelo anterior (89 diapositivas con quizzes fusionados y audio ya
generado) y produce data/course_model.json con las 98 diapositivas del PDF:
- ids s01..s98 = claves de slides_html.json
- quizzes des-fusionados: partes fase "q" -> pregunta, fase "f" -> respuesta
- parts: {phase:"m", steps:[], text, tts, file} (audio existente en disco)
- noauto en preguntas; correct/forQuiz en los 6 quizzes de tarjeta
"""
import json, os, re

DEST = '/Users/jonathanf/Desktop/GRI Tutorias/2026 GRI TUTORIAS/Curso impacto/curso-html5'
OLD = json.load(open(os.path.join(DEST, 'data', 'course_model_auto_backup.json')
                     if os.path.exists(os.path.join(DEST, 'data', 'course_model_auto_backup.json'))
                     else os.path.join(DEST, 'data', 'course_model.json'), encoding='utf-8'))

MODULES = {
    '0': 'Bienvenida',
    '1': 'Módulo 1: Introducción a los Estándares GRI',
    '2': 'Módulo 2: Contexto del análisis de materialidad',
    '3': 'Módulo 3: Proceso para la definición de la materialidad',
    '4': 'Módulo 4: Determinación de la información a reportar',
}
def module_of(n):
    if n <= 3: return 0
    if n <= 19: return 1
    if n <= 33: return 2
    if n <= 86: return 3
    return 4

# preguntas de quiz (pausa) y sus respuestas
QUIZ = {27: 'b', 29: 'c', 31: 'a', 74: 'd', 76: 'a', 78: 'c'}   # tarjetas a-d
PAUSE_ONLY = {50, 84, 94}                                        # Q sin tarjetas (multi/match)
ANSWER_OF = {27: 28, 29: 30, 31: 32, 50: 51, 74: 75, 76: 77, 78: 79, 84: 85, 94: 95}

old_by_ppt = {s['ppt']: s for s in OLD['slides']}

def clean_parts(parts):
    out = []
    for p in parts:
        out.append({'phase': 'm', 'steps': [],
                    'text': p.get('text', ''), 'tts': p.get('tts', ''),
                    'file': p['file']})
    return out

slides = []
for n in range(1, 99):
    sid = f's{n:02d}'
    entry = {'id': sid, 'ppt': n, 'module': module_of(n), 'type': 'content',
             'title': '', 'screen_text': '', 'media': [], 'parts': []}
    src = old_by_ppt.get(n)
    if src:  # diapositiva normal o pregunta fusionada
        entry['title'] = src.get('title', '')
        entry['screen_text'] = src.get('screen_text', '')
        parts = src.get('parts', [])
        if n in ANSWER_OF:  # pregunta: solo fases q/m
            qparts = [p for p in parts if p.get('phase') in ('q', 'm')]
            entry['parts'] = clean_parts(qparts)
            entry['noauto'] = True
            if n in QUIZ:
                entry['correct'] = QUIZ[n]
        else:
            entry['parts'] = clean_parts(parts)
    else:
        # diapositiva de respuesta (estaba fusionada) o cierre
        qn = next((q for q, a in ANSWER_OF.items() if a == n), None)
        if qn:
            qsrc = old_by_ppt[qn]
            entry['title'] = (qsrc.get('title') or 'Pregunta') + ' · Respuesta'
            fparts = [p for p in qsrc.get('parts', []) if p.get('phase') == 'f']
            entry['parts'] = clean_parts(fparts)
            if qn in QUIZ:
                entry['forQuiz'] = f's{qn:02d}'
        elif n == 98:
            entry['title'] = 'Cierre'
            entry['noauto'] = True
    slides.append(entry)

model = {'course': 'Tutoría GRI · Materialidad de impacto', 'modules': MODULES, 'slides': slides}
json.dump(model, open(os.path.join(DEST, 'data', 'course_model.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

# ---- verificación ----
missing_audio = []
for s in slides:
    for p in s['parts']:
        if not os.path.exists(os.path.join(DEST, p['file'])):
            missing_audio.append(p['file'])
nq = sum(1 for s in slides if 'correct' in s)
nf = sum(1 for s in slides if 'forQuiz' in s)
na = sum(1 for s in slides if s.get('noauto'))
np_ = sum(len(s['parts']) for s in slides)
bad_tts = [s['id'] for s in slides for p in s['parts']
           if re.search(r'\bGRI\b', p['tts']) or 'http' in p['tts'] or 'Fuente' in p['tts']]
print(f'slides: {len(slides)} | parts: {np_} | quizzes correct: {nq} | forQuiz: {nf} | noauto: {na}')
print(f'audio faltante: {len(missing_audio)}', missing_audio[:6])
print(f'tts sucios: {sorted(set(bad_tts))[:8]}')
