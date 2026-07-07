# Tutorías GRI · Materialidad de impacto — Curso HTML5

Curso e-learning interactivo generado a partir de la presentación
`GRI_Materialidad_envío 3` y el guion `Guion_Tutoria Materialidad_Envío 4`.

## Cómo abrirlo

El curso necesita un servidor web local (no funciona abriendo `index.html`
directamente por `file://`, porque carga datos y audio con `fetch`).

Opción rápida (incluida):

```bash
cd "curso-html5"
node server.js          # abre http://localhost:8823
```

O con Python:

```bash
cd "curso-html5"
python3 -m http.server 8823
```

Luego abre `http://localhost:8823` en el navegador.

## Cómo se usa

- **Reproducción automática**: al pulsar "Comenzar curso" la narración empieza
  sola y las viñetas/animaciones aparecen sincronizadas con la voz.
- **Controles inferiores**: anterior/siguiente diapositiva, retroceder/avanzar
  segmento, reproducir/pausar, repetir diapositiva, barra de progreso (clic para
  saltar), velocidad (0.75×–2×), volumen y reproducción automática on/off.
- **Índice lateral** (botón *Índice*): navegación por módulos, con progreso y
  marca de diapositivas vistas (se guarda en el navegador).
- **Transcripción** (botón *Transcripción*): texto de la narración, resaltando
  el segmento en curso.
- **Caso de estudio**: botón en la barra superior y en las diapositivas del caso,
  descarga el PDF `anexos/Caso-de-estudio-Alimentos-SA.pdf`.
- **Quizzes**: la narración se detiene tras la pregunta y espera la respuesta;
  al responder se muestra la retroalimentación con locución. Hay 4 tipos: opción
  única, selección múltiple, reflexión y emparejamiento.
- **Atajos de teclado**: `espacio` play/pausa · `←/→` diapositiva ·
  `↑/↓` segmento · `r` repetir · `i` índice · `t` transcripción · `f` pantalla
  completa · `m` silenciar.
- **Móvil**: los paneles se abren como capas deslizables; se recomienda ver en
  horizontal para aprovechar el formato de diapositiva.

## Estructura

```
curso-html5/
├── index.html            Punto de entrada
├── css/course.css        Sistema de diseño (colores GRI, arquetipos, animaciones)
├── js/
│   ├── course.js         Motor: reproducción, sincronía, navegación, progreso
│   ├── slides.js         Arquetipos de diapositiva base + despachador
│   ├── overrides.js      Diapositivas a medida (portada, tablas, timeline, caso…)
│   └── quiz.js           Motor de quizzes interactivos
├── data/
│   ├── course_model.json Contenido de las 98 diapositivas + narración segmentada
│   └── slidedefs_auto.json  Definiciones de vista autogeneradas
├── audio/                208 locuciones .mp3 (voz Julian, español latino)
├── img/                  Imágenes usadas por el curso
├── anexos/               Caso de estudio en PDF (adjunto)
└── server.js             Servidor estático local opcional
```

## Notas de producción

- **Voz**: Julian (Higgsfield / ElevenLabs), español latino neutro. Las siglas
  "GRI" se locutan deletreadas ("ge erre i"); en pantalla siempre se escribe "GRI".
- **Diseño**: recreación fiel de la plantilla GRI (azul `#22549E`, acentos
  naranja/teal/púrpura), no imágenes de las diapositivas originales, sino HTML/CSS
  nativo para que las animaciones y el texto sean nítidos a cualquier tamaño.
- **Progreso**: se guarda en `localStorage`; "Continuar donde quedé" retoma la
  última diapositiva.
```
```
