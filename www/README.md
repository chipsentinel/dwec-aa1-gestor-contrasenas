# Gestor de contraseñas (www/)

Actividad de Aprendizaje 1 de DWEC (DAW2). Aplicación web con dos pantallas que habla con el servidor del profesor.

> Esta es una versión parcial del README: de momento explica cómo arrancar el proyecto, su estructura y las cinco funcionalidades **obligatorias**. Los extras y el resto se añaden en commits posteriores.

## Cómo arrancarlo

Hacen falta dos consolas, en la raíz del repositorio:

```
npm install            (solo la primera vez)
npm run db:init        (solo la primera vez: crea la base de datos)

npm start              (consola 1: servidor en http://localhost:3000)
npm run www            (consola 2: web en http://127.0.0.1:8080)
```

Después se abre http://localhost:8080.

## Estructura de archivos

```
www/
├── index.html        Pantalla 1 (Figura 1): barra de botones, categorías (izquierda) y sites de la categoría (derecha)
├── site.html         Pantalla 2 (Figura 3): formulario para añadir un site
├── css/estilos.css   Apariencia de las dos pantallas
└── js/
    ├── api.js        Clase Api: todas las llamadas al servidor (el único fetch)
    ├── validacion.js Función validarCampo, común a las dos pantallas
    ├── index.js      Comportamiento de index.html
    └── site.js       Comportamiento de site.html
```

Los HTML **no tienen JavaScript dentro** (ni `<script>` con código ni `onclick=`). Cargan los scripts al final del body en este orden: `api.js`, `validacion.js` y el de la pantalla.

## El esquema de 4 pasos

Todas las funcionalidades siguen el mismo esquema:

1. **EVENTO**: el usuario hace clic (`addEventListener("click", ...)`).
2. **VALIDAR**: se comprueba lo escrito con `validarCampo` (o se pide confirmación con `confirm`). Si no vale, se para aquí.
3. **api.metodo()** con `await`, dentro de un `try/catch`: si el servidor falla, se escribe un mensaje en rojo.
4. **REPINTAR**: se vuelve a pedir la lista al servidor y se pinta otra vez.

## Funcionalidades obligatorias

### OBLIGATORIO 1: añadir categoría
- **Qué hace**: el botón "Añadir categoría" abre el cuadro "Nueva categoría" (Figura 2). Se escribe un nombre (mínimo 3 caracteres) y se pulsa OK; la categoría aparece en la lista. Cancelar cierra el cuadro.
- **Archivo y función**: `js/index.js` → `abrirDialogoCategoria()`, `cerrarDialogoCategoria()`, `anadirCategoria()`; `js/api.js` → `addCategoria(nombre)`.
- **API**: `POST /categories` con `{ "name": "..." }`.
- **Lab**: lecciones [50](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/50-dom-buttons-labels) (click), [51](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/51-dom-text-input) (inputs y validación), [61](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/08-concurrency/61-async-programming) (async/await).
- **Nuevo**: `hidden` (el cuadro está en el HTML, oculto, y se muestra o se oculta cambiando `hidden`).
- **Cómo demostrarlo**: pulsar "Añadir categoría", escribir "ab" y OK (sale "Mínimo 3 caracteres (tiene 2)" y el cuadro sigue abierto), escribir "Banca" y OK.

### OBLIGATORIO 2: eliminar categoría
- **Qué hace**: el botón "Eliminar" de cada categoría la borra, tras confirmar.
- **Archivo y función**: `js/index.js` → `eliminarCategoria(categoria)`; `js/api.js` → `deleteCategoria(id)`.
- **API**: `DELETE /categories/:id`.
- **Lab**: lecciones 41 (try/catch), 49-50 (DOM y botones), 61.
- **Nuevo**: `confirm()` abre una ventana Aceptar/Cancelar.
- **Cómo demostrarlo**: pulsar Eliminar y Cancelar (no pasa nada); pulsarlo y Aceptar (desaparece).

### OBLIGATORIO 3: ver los sites de una categoría
- **Qué hace**: al pulsar el nombre de una categoría se piden sus sites al servidor y se pintan en una tabla con sitio, usuario y fecha de creación (como en la Figura 1, la contraseña no se enseña en la tabla).
- **Archivo y función**: `js/index.js` → `seleccionarCategoria(id)`, `pintarSites(categoria)`, `crearFilaSite(site)`, `formatearFecha(texto)`; `js/api.js` → `getCategoria(id)`.
- **API**: `GET /categories/:id` (devuelve la categoría con `sites` dentro).
- **Lab**: lecciones 15 (if/else), 24 (arrays), 33 (for...of), 40 (fechas), 49-51 (DOM), 61.
- **Cómo demostrarlo**: pulsar una categoría con sites (tabla) y otra sin sites (texto "Esta categoría no tiene sites todavía.").

### OBLIGATORIO 4: añadir site
- **Qué hace**: con una categoría seleccionada se activa el botón "Añadir site" de la barra, que abre `site.html`. Nombre (mín. 3), usuario (mín. 3) y contraseña (mín. 8) son obligatorios. Save guarda y vuelve a `index.html` con la categoría abierta; Cancel vuelve sin guardar.
- **Archivo y función**: `js/site.js` → `guardarSite()`, `formularioValido()`, `leerFormulario()`; `js/api.js` → `addSite(idCategoria, site)`; `js/index.js` → `abrirCategoriaDeLaUrl()`; el botón Cancel y el regreso tras guardar usan `volver()`.
- **API**: `POST /categories/:id` con `{ name, url, user, password, description }`.
- **Cómo viaja la categoría**: por la URL, `site.html?categoria=3`. Se lee con `URLSearchParams(location.search)`.
- **Lab**: lecciones 09 (Number), 14 (&&), 41, 50-51, 61.
- **Nuevo**: `URLSearchParams`, `location`.
- **Cómo demostrarlo**: pulsar Save con el formulario vacío (salen tres mensajes) y luego con datos válidos (vuelve y aparece el site).

### OBLIGATORIO 5: eliminar site
- **Qué hace**: cada fila de la tabla tiene en "Acciones" un botón "Eliminar" que borra el site, tras confirmar.
- **Archivo y función**: `js/index.js` → `eliminarSite(site)`, `crearCeldaAcciones(site)`; `js/api.js` → `deleteSite(id)`.
- **API**: `DELETE /sites/:id`.
- **Lab**: lecciones 41, 49-50, 61.
- **Cómo demostrarlo**: pulsar Eliminar en una fila y aceptar.
