<div align="center">

<img src="assets/images/logo.png" alt="Escudo del Instituto Técnico" width="130" />

# Instituto Técnico · Sitio Web

### Rediseño completo del sitio institucional del Instituto Técnico de Santander de Quilichao, Cauca 🇨🇴

*Una institución pública que forma técnicos y ciudadanos desde 1913.*

<br>

[![Demo](https://img.shields.io/badge/🌐_Ver_demo-en_vivo-1B3A2A?style=for-the-badge&labelColor=C9A227)](URL_DE_TU_DEMO)
[![Issues](https://img.shields.io/github/issues/ryderx7/Instecnico-web?style=for-the-badge&color=1B3A2A&labelColor=142E20)](https://github.com/ryderx7/Instecnico-web/issues)
[![Stars](https://img.shields.io/github/stars/ryderx7/Instecnico-web?style=for-the-badge&color=C9A227&labelColor=142E20)](https://github.com/ryderx7/Instecnico-web/stargazers)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-Identity_+_CMS-00C7B7?logo=netlify&logoColor=white)
![Sin dependencias](https://img.shields.io/badge/dependencias-0-2E7D32)
![Responsive](https://img.shields.io/badge/responsive-100%25-142E20)

<br>

<img src="docs/screenshots/hero-desktop.png" alt="Página de inicio del Instituto Técnico en escritorio" width="92%" />

</div>

---

## 📑 Contenido

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Capturas](#-capturas)
- [Qué incluye el sitio](#-qué-incluye-el-sitio)
- [Detalles técnicos](#-detalles-técnicos)
- [Identidad visual](#-identidad-visual)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Correrlo en local](#-correrlo-en-local)
- [Gestionar noticias (CMS)](#-gestionar-noticias-cms)
- [Generar las capturas](#-generar-las-capturas)
- [Hoja de ruta](#-hoja-de-ruta)
- [Autoría y créditos](#-autoría-y-créditos)

---

## 🎓 Sobre el proyecto

El **Instituto Técnico** nació el 3 de abril de 1913, cuando la Ordenanza 13 le dio vida jurídica, por iniciativa del diputado Marcial Lemus Nates. Hoy cuenta con **4 sedes**, más de **3.300 estudiantes** y más de **113 años** de historia en Santander de Quilichao.

Este repositorio es un **rediseño total de su sitio web**: más claro, más rápido, accesible desde el celular y con herramientas útiles para toda la comunidad educativa. Va más allá de una página informativa e incluye un laboratorio virtual, una calculadora de notas y un capítulo interactivo de Filosofía.

> 💡 Todo está hecho con **HTML, CSS y JavaScript puro**, sin frameworks ni librerías externas, para que cargue rápido incluso con internet limitado.

---

## 📸 Capturas

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/inicio.png" alt="Inicio" /><br>
      <b>Inicio</b><br><sub>Hero con video, datos institucionales, sedes y noticias</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/historia.png" alt="Historia" /><br>
      <b>Historia</b><br><sub>Línea de tiempo desde 1913, símbolos y egresados</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/laboratorio.png" alt="Laboratorio virtual" /><br>
      <b>Laboratorio virtual</b><br><sub>8 experimentos interactivos de física y química</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/filosofia.png" alt="Filosofía" /><br>
      <b>Filosofía</b><br><sub>Capítulo interactivo con 17 pensadores</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/calculadora.png" alt="Calculadora de notas" /><br>
      <b>Calculadora de notas</b><br><sub>Calcula cuánto necesitas en el P3 para aprobar</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/galeria.png" alt="Galería" /><br>
      <b>Galería</b><br><sub>Infraestructura, sedes y memoria histórica</sub>
    </td>
  </tr>
</table>

<details>
<summary><b>📱 Ver versión móvil</b></summary>
<br>
<div align="center">
  <img src="docs/screenshots/inicio-mobile.png" alt="Inicio en móvil" width="22%" />
  <img src="docs/screenshots/historia-mobile.png" alt="Historia en móvil" width="22%" />
  <img src="docs/screenshots/laboratorio-mobile.png" alt="Laboratorio en móvil" width="22%" />
  <img src="docs/screenshots/calculadora-mobile.png" alt="Calculadora en móvil" width="22%" />
</div>
</details>

<details>
<summary><b>🎮 Y hasta la página 404 tiene minijuego</b></summary>
<br>
<div align="center">
  <img src="docs/screenshots/404.png" alt="Página 404 con minijuego del escudo" width="70%" />
</div>
<br>
En vez de un error aburrido, hay un minijuego: un escudo que rebota y se acelera con cada punto que sumas. Incluye sonido generado con Web Audio y soporte de teclado.
</details>

---

## ✨ Qué incluye el sitio

| Página | Qué hace |
|---|---|
| 🏠 **Inicio** (`index.html`) | Hero con video de fondo y botón para cambiarlo por imagen, datos institucionales con contadores animados, sedes, herramientas digitales, noticias, galería, contacto y mapa |
| 📜 **Historia** (`historia.html`) | Recorrido desde 1913: fundación, nacionalización, fusión de sedes, era digital. Incluye símbolos (escudo, bandera, himno, lema), egresados destacados y reconocimiento legal |
| 🧪 **Laboratorio Virtual** (`laboratorio-virtual.html`) | 8 experimentos interactivos con teoría incluida, sin instalar nada |
| 📐 **Calculadora de notas** (`calculadora.html`) | Escala 0.0–5.0 (aprueba con 3.0). Calcula la nota definitiva o cuánto necesitas en el tercer periodo |
| 🧠 **Filosofía** (`filosofia.html`) | Capítulo interactivo: 17 pensadores, periodos históricos, interludios conceptuales y biblioteca de conceptos clave |
| 🖼️ **Galería** (`galeria.html`) | Galería fotográfica con filtros por categoría |
| 💬 **Chat Global** (`chat-global.html`) | Espacio de chat para la comunidad |
| 🧭 **404** (`404.html`) | Página de error con minijuego |

<details>
<summary><b>🔬 Los 8 experimentos del laboratorio</b></summary>

| # | Experimento | Área |
|---|---|---|
| 1 | Entalpía de disolución | Química |
| 2 | Curvas de valoración ácido-base | Química |
| 3 | Ley de Ohm | Física |
| 4 | Ley de Hooke | Física |
| 5 | El péndulo simple | Física |
| 6 | Presión hidrostática | Física |
| 7 | Ondas estacionarias | Física |
| 8 | Densidad, masa y volumen | Física / Química |

</details>

---

## ⚙️ Detalles técnicos

### ⚡ Rendimiento
- Video del hero con `preload="none"` y póster, para no gastar datos antes de tiempo
- **Detecta conexiones lentas** (`saveData` y 2G) y usa imagen en lugar de video
- Animaciones con `IntersectionObserver`: solo se activan lo que está en pantalla
- *Skeleton loaders* mientras cargan las noticias
- Cero dependencias de JavaScript: sin npm, sin build

### ♿ Accesibilidad
- Enlace **"Saltar al contenido"** en cada página
- Respeta `prefers-reduced-motion` y ofrece botón para pausar el video
- Navegación completa por teclado y `aria-label` en controles
- Objetivos táctiles de al menos 44 px

### 🔒 Seguridad y privacidad
- **Content Security Policy** definida en cada página (con hashes SHA-256 para los scripts en línea del inicio)
- Enlaces externos con `rel="noopener noreferrer"`
- Banner de cookies con política de privacidad
- Contenido de noticias escapado antes de mostrarse en la página

### 🔍 SEO
- Meta tags, **Open Graph** y **Twitter Cards** en todas las páginas
- Datos estructurados **JSON-LD** (`EducationalOrganization`, `FAQPage` y más)
- Enlaces canónicos y `theme-color`
- `404` con `noindex` para no ensuciar el índice

### 🧰 Stack

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3: Grid, Flexbox, variables CSS, `clamp()` |
| Lógica | JavaScript vanilla (ES5/ES6) |
| Contenido | JSON (`content/noticias.json`) editable desde el CMS |
| Panel admin | Netlify Identity + CMS en `/admin` |
| Tipografías | [Fraunces](https://fonts.google.com/specimen/Fraunces) (títulos) y [Public Sans](https://fonts.google.com/specimen/Public+Sans) (texto) |
| Mapa | Google Maps embed |

---

## 🎨 Identidad visual

Paleta tomada de los colores institucionales: **hueso, verde y dorado**.

| Color | Hex | Uso |
|---|---|---|
| ![](https://img.shields.io/badge/-%20%20%20-F5F1E8) Hueso | `#F5F1E8` | Fondos y texto claro |
| ![](https://img.shields.io/badge/-%20%20%20-1B3A2A) Verde oscuro | `#1B3A2A` | Secciones y tarjetas |
| ![](https://img.shields.io/badge/-%20%20%20-142E20) Verde profundo | `#142E20` | Fondo principal oscuro |
| ![](https://img.shields.io/badge/-%20%20%20-C9A227) Dorado | `#C9A227` | Acentos y botones |
| ![](https://img.shields.io/badge/-%20%20%20-DFB93F) Dorado claro | `#DFB93F` | Hover y énfasis |

---

## 📂 Estructura del proyecto

```
Instecnico-web/
├── index.html                 # Inicio
├── historia.html              # Historia institucional
├── filosofia.html             # Capítulo interactivo de Filosofía
├── laboratorio-virtual.html   # 8 experimentos interactivos
├── calculadora.html           # Calculadora de notas
├── galeria.html               # Galería fotográfica
├── chat-global.html           # Chat de la comunidad
├── 404.html                   # Error con minijuego
│
├── admin/                     # Panel de administración (CMS)
├── content/
│   └── noticias.json          # Noticias que se muestran en el inicio
├── assets/
│   ├── images/                # Logo, sedes, galería, historia, filósofos
│   ├── videos/                # hero.mp4 / hero.webm
│   ├── audio/                 # Himno institucional y audio de filosofía
│   └── js/                    # calculadora.js, identity-redirect.js
└── docs/
    └── screenshots/           # Capturas usadas en este README
```

---

## 🚀 Correrlo en local

No necesita instalación ni compilación.

```bash
# 1. Clonar
git clone https://github.com/ryderx7/Instecnico-web.git
cd Instecnico-web

# 2. Levantar un servidor local (elige uno)
npx serve .
# o
python -m http.server 8000
```

Abre `http://localhost:3000` (o `:8000`).

> ⚠️ Usa un servidor y no abras `index.html` con doble clic: las noticias se cargan con `fetch()` desde `content/noticias.json`, que los navegadores bloquean en `file://`.

---

## 📰 Gestionar noticias (CMS)

Las noticias del inicio viven en `content/noticias.json` y se pueden editar de dos formas:

1. **Desde el panel**: entra a `/admin`, inicia sesión con Netlify Identity y publica o edita noticias sin tocar código.
2. **A mano**: edita `content/noticias.json` respetando la estructura:

```json
{
  "items": [
    {
      "title": "Título de la noticia",
      "date": "2026-01-15",
      "author": "Instituto Técnico",
      "category": "Noticia",
      "image": "assets/images/mi-imagen.jpg",
      "body": "Texto de la noticia en Markdown."
    }
  ]
}
```

---

## 🖼️ Generar las capturas

Hay un script que abre cada página, evita el banner de cookies y la intro, y guarda las capturas en `docs/screenshots/`:

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/capturar.mjs
```

Genera versiones de escritorio y móvil con los nombres que usa este README. Haz `git add docs/screenshots && git commit` y las capturas aparecerán solas.

---

## 🗺️ Hoja de ruta

- [ ] Publicar la demo en vivo y enlazarla arriba
- [ ] Lighthouse 95+ en las cuatro categorías
- [ ] Más experimentos en el laboratorio virtual
- [ ] Más capítulos interactivos (como el de Filosofía) para otras áreas
- [ ] Versión en inglés
- [ ] Modo claro / oscuro seleccionable

Ideas y sugerencias son bienvenidas en [Issues](https://github.com/ryderx7/Instecnico-web/issues).

---

## 🤝 Autoría y créditos

- **Diseño y desarrollo:** [ryderx7](https://github.com/ryderx7)
- **Metodología de Filosofía:** profesor Gersaín León Franco
- **Institución:** Institución Educativa Instituto Técnico, Santander de Quilichao, Cauca, Colombia
- Tipografías de [Google Fonts](https://fonts.google.com)

Los escudos, logos, himno y fotografías institucionales pertenecen al Instituto Técnico.

---

<div align="center">

Hecho con 💚 y 💛 para el Instituto Técnico · desde 1913

⭐ Si te gustó el proyecto, déjale una estrella al repo

</div>
