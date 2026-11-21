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

<img src="docs/screenshots/hero-desktop.png" alt="Página de inicio del Instituto Técnico" width="92%" />

</div>

---

## 🎓 Sobre el proyecto

El **Instituto Técnico** nació el 3 de abril de 1913, por iniciativa del diputado Marcial Lemus Nates. Hoy tiene **4 sedes**, más de **3.300 estudiantes** y más de **113 años** de historia en Santander de Quilichao.

Este repositorio es un **rediseño total de su sitio web**: más claro, más rápido y pensado para el celular. Además de informar, ofrece herramientas útiles para toda la comunidad educativa: un laboratorio virtual, una calculadora de notas y un capítulo interactivo de Filosofía.

> 💡 Hecho con **HTML, CSS y JavaScript puro**: sin frameworks, sin npm, sin build. Carga rápido incluso con internet limitado.

---

## ✨ Lo más destacado

<table>
  <tr>
    <td width="33%" align="center">
      <img src="docs/screenshots/laboratorio.png" alt="Laboratorio virtual" /><br>
      <b>🧪 Laboratorio virtual</b><br><sub>8 experimentos interactivos de física y química</sub>
    </td>
    <td width="33%" align="center">
      <img src="docs/screenshots/filosofia.png" alt="Filosofía" /><br>
      <b>🧠 Filosofía interactiva</b><br><sub>17 pensadores, periodos y conceptos clave</sub>
    </td>
    <td width="33%" align="center">
      <img src="docs/screenshots/calculadora-mobile.png" alt="Calculadora de notas en móvil" /><br>
      <b>📐 Calculadora de notas</b><br><sub>Cuánto necesitas en el P3 para aprobar</sub>
    </td>
  </tr>
</table>

| Página | Qué hace |
|---|---|
| 🏠 `index.html` | Hero con video, datos institucionales, sedes, noticias y contacto |
| 📜 `historia.html` | Línea de tiempo desde 1913, símbolos y egresados destacados |
| 🧪 `laboratorio-virtual.html` | 8 experimentos con teoría incluida |
| 📐 `calculadora.html` | Escala 0.0–5.0 (aprueba con 3.0) |
| 🧠 `filosofia.html` | Capítulo interactivo con biblioteca de conceptos |
| 🖼️ `galeria.html` | Fotos con filtros por categoría |
| 💬 `chat-global.html` | Chat para la comunidad |
| 🎮 `404.html` | Error con minijuego |

---

## ⚙️ Detalles técnicos

- ⚡ **Rendimiento:** detecta conexiones lentas (`saveData`, 2G) y cambia el video por imagen; animaciones con `IntersectionObserver`; *skeleton loaders* en las noticias.
- ♿ **Accesibilidad:** enlace "Saltar al contenido", respeta `prefers-reduced-motion`, navegación completa por teclado y objetivos táctiles de 44 px.
- 🔒 **Seguridad:** Content Security Policy en cada página, enlaces externos con `noopener noreferrer` y noticias escapadas antes de mostrarse.
- 🔍 **SEO:** Open Graph, Twitter Cards, datos estructurados JSON-LD y enlaces canónicos.

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3: Grid, Flexbox, variables CSS, `clamp()` |
| Lógica | JavaScript vanilla |
| Contenido | `content/noticias.json`, editable desde el CMS |
| Panel admin | Netlify Identity + CMS en `/admin` |
| Tipografías | [Fraunces](https://fonts.google.com/specimen/Fraunces) y [Public Sans](https://fonts.google.com/specimen/Public+Sans) |

**Paleta institucional:** hueso `#F5F1E8` · verde oscuro `#1B3A2A` · verde profundo `#142E20` · dorado `#C9A227` · dorado claro `#DFB93F`

---

## 📂 Estructura

```
Instecnico-web/
├── index.html · historia.html · filosofia.html
├── laboratorio-virtual.html · calculadora.html
├── galeria.html · chat-global.html · 404.html
├── admin/                # Panel CMS
├── content/noticias.json # Noticias del inicio
├── assets/               # images, videos, audio, js
└── docs/screenshots/     # Capturas de este README
```

---

## 🚀 Correrlo en local

```bash
git clone https://github.com/ryderx7/Instecnico-web.git
cd Instecnico-web

npx serve .
# o
python -m http.server 8000
```

> ⚠️ Usa un servidor; no abras `index.html` con doble clic. Las noticias se cargan con `fetch()`, que los navegadores bloquean en `file://`.

---

## 📰 Gestionar noticias

1. **Desde el panel:** entra a `/admin`, inicia sesión con Netlify Identity y publica sin tocar código.
2. **A mano:** edita `content/noticias.json`:

```json
{
  "items": [
    {
      "title": "Título de la noticia",
      "date": "2026-01-15",
      "author": "Instituto Técnico",
      "category": "Noticia",
      "image": "assets/images/mi-imagen.jpg",
      "body": "Texto en Markdown."
    }
  ]
}
```

---

## 🗺️ Hoja de ruta

- [ ] Publicar la demo en vivo
- [ ] Lighthouse 95+ en las cuatro categorías
- [ ] Más experimentos y capítulos interactivos para otras áreas
- [ ] Versión en inglés
- [ ] Modo claro / oscuro

Ideas y sugerencias en [Issues](https://github.com/ryderx7/Instecnico-web/issues).

---

## 🤝 Créditos

- **Diseño y desarrollo:** [ryderx7](https://github.com/ryderx7)
- **Metodología de Filosofía:** profesor Gersaín León Franco
- **Institución:** I.E. Instituto Técnico, Santander de Quilichao, Cauca, Colombia

Los escudos, logos, himno y fotografías institucionales pertenecen al Instituto Técnico.

---

<div align="center">

Hecho con 💚 y 💛 para el Instituto Técnico · desde 1913

⭐ Si te gustó el proyecto, déjale una estrella al repo

</div>
