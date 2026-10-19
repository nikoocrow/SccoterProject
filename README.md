# Scooter — Hero 3D interactivo

Hero de página completa (100vh) para presentar un scooter eléctrico en 3D, construido con **React**, **Vite** y **Three.js** (vía React Three Fiber). El visitante puede girar el modelo, cambiar su color, ver sus poses animadas y explorar sus piezas con puntos interactivos, en inglés o en español.

## Funcionalidades

- **Modelo 3D orbitable**: se arrastra para girar alrededor del scooter (sin zoom con la rueda, para no bloquear el scroll de la página).
- **Poses animadas** — selector `Static · Ride · Park · Fold` (o doble click sobre el scooter para pasar a la siguiente):
  - **Static**: posición de reposo, sin ninguna animación.
  - **Ride**: las ruedas giran y la dirección oscila levemente.
  - **Park**: baja la pata de apoyo y el manubrio queda girado.
  - **Fold**: se abre el seguro de la bisagra y el manubrio se pliega sobre el gancho trasero.
- **Detalles (hotspots)**: en la pose *Static*, el switch *Details* muestra puntos sobre las piezas. Al hacer click, la cámara hace zoom a esa zona, permite orbitarla, y el panel derecho cambia al nombre y la descripción de la pieza. Otro click vuelve a la vista general.
- **Colores**: 5 acabados (Arctic White, Signal Red, Ocean Blue, Sage Green, Graphite) con transición suave. Solo se tiñe la carrocería; llantas, puños y cinta antideslizante se mantienen.
- **Bilingüe (EN · ES)**: todos los textos cambian al instante. El idioma inicial se detecta del navegador y la elección se recuerda.
- **Créditos**: botón en la barra superior que abre una tarjeta animada con el autor.
- **Responsive**: adaptado a escritorio y móvil.

## Stack

| | |
|---|---|
| UI | React 19 |
| Build | Vite 8 (Rolldown) |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| Lint | oxlint |

## Empezar

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve el build de producción localmente
npm run lint
```

## Estructura

```
public/
  models/scooter.glb      Modelo optimizado (meshopt + texturas WebP)
  avatar.jpg              Foto de la tarjeta de créditos
src/
  components/
    Hero.jsx              Layout del hero, estado (pose, color, idioma, detalles)
    ScooterScene.jsx      Canvas 3D: cámara, OrbitControls, luces, hotspots
    ScooterModel.jsx      Carga del GLB, rig de animación (poses) y tinte de color
    InfoPanel.jsx         Título y texto del panel derecho, con animación por letras
    PoseSwitch.jsx        Selector segmentado de poses
    Toggle.jsx            Switch estilo iOS
    Credits.jsx           Botón y tarjeta de créditos
  data/
    hotspots.js           Puntos de interés: posición, pieza a la que siguen y textos EN/ES
    colors.js             Acabados de color
  i18n.js                 Textos de la interfaz en inglés y español
```

### Personalizar

- **Textos**: `src/i18n.js` (interfaz y poses) y `src/data/hotspots.js` (piezas). Para otro idioma, agrega su clave en esos archivos y en `LANGS`.
- **Colores**: `src/data/colors.js`.
- **Poses y ángulos** (plegado, pata, dirección, velocidad de ruedas): `POSES` y constantes al inicio de `src/components/ScooterModel.jsx`.
- **Retícula vertical de las columnas**: variables `--col-top`, `--row1` y `--row-gap` en `src/index.css`.

## Cómo funcionan las animaciones

El modelo no trae clips de animación. Las poses se recrean a partir del Blueprint original de Unreal Engine del modelo: cada pieza móvil (ruedas, columna de dirección, manubrio, seguro y pata) conserva su propio pivote en el GLB, y cada pose es una rotación aplicada sobre la rotación de reposo de esa pieza, interpolada suavemente en cada frame. Los hotspots que están sobre piezas móviles se anclan a ellas para seguirlas.

## Rendimiento

- **Modelo**: 5.9 MB → 2.2 MB. Geometría con `EXT_meshopt_compression` y texturas a WebP (calidad 90, resolución original de 2048 px), generado con [gltf-transform](https://gltf-transform.dev). Se precarga desde `index.html`.
- **Carga en dos fases**: la interfaz carga ~74 KB gzip; three.js (~270 KB gzip) va en un chunk aparte, cargado en paralelo y cacheable entre deploys.
- **Iluminación de estudio** generada con PMREM a partir de paneles de luz, sin cargadores HDR/EXR en el bundle.

Para regenerar el modelo optimizado desde un GLB original:

```bash
npx @gltf-transform/cli webp original.glb tmp.glb --quality 90
npx @gltf-transform/cli optimize tmp.glb public/models/scooter.glb \
  --compress meshopt --texture-compress false \
  --flatten false --join false --instance false --palette false --simplify false --weld false
```

> Los flags `--flatten/--join/--instance false` son necesarios: conservan los nodos y pivotes de cada pieza que usa el rig de animación.

## Despliegue

Es un sitio estático: ejecuta `npm run build` y publica la carpeta `dist/` (Vercel, Netlify, GitHub Pages, etc.). Recomendado en el hosting:

- Compresión gzip o brotli activada.
- `Cache-Control: immutable` para `/assets/*` (los nombres llevan hash).
- Caché larga con revalidación para `/models/scooter.glb`.

## Créditos

- Diseño y desarrollo: **nikocrow** — [nikocrow.dev](https://nikocrow.dev)
- Modelo 3D: *Scooter 03*, de su autor original (asset de terceros). Revisa su licencia antes de redistribuirlo.
