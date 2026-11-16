# Gestor de contraseñas (www/)

Actividad de Aprendizaje 1 de DWEC (DAW2, SEAS). Aplicación web con dos pantallas que habla con el servidor del profesor. Este README es mi **guía de defensa**: explica qué hace cada parte, dónde está y de dónde sale cada línea.

Enlaces: [repo del profesor](https://github.com/ohierro/dwec_aa1_server) · [mi lab de JavaScript](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript) · [mi fork (este proyecto)](https://github.com/chipsentinel/dwec-aa1-gestor-contrasenas)

## Índice

1. [Cómo arrancarlo](#cómo-arrancarlo)
2. [Estructura de archivos](#estructura-de-archivos)
3. [El esquema de 4 pasos](#el-esquema-de-4-pasos)
4. [Funcionalidades obligatorias](#funcionalidades-obligatorias)
5. [Funcionalidades extra](#funcionalidades-extra)
6. [Origen del código](#origen-del-código)
7. [Cambios en el servidor](#cambios-en-el-servidor)
8. [Conceptos nuevos explicados](#conceptos-nuevos-explicados)
9. [Lecciones del lab usadas](#lecciones-del-lab-usadas)
10. [15 preguntas probables de la defensa](#15-preguntas-probables-de-la-defensa)
11. [Uso de IA](#uso-de-ia)
12. [Posibles mejoras](#posibles-mejoras)

## Cómo arrancarlo

Hacen falta dos consolas, en la raíz del repositorio:

```
npm install            (solo la primera vez)
npm run db:init        (solo la primera vez: crea la base de datos y los datos de ejemplo)

npm start              (consola 1: servidor en http://localhost:3000)
npm run www            (consola 2: web en http://127.0.0.1:8080)
```

Después se abre http://localhost:8080. Si se cambia el modelo de la base de datos hay que borrar `database.sqlite` y repetir `npm run db:init` (así se hizo al añadir el campo `icon`).

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

### Relación con las figuras del enunciado

El aspecto sigue de forma orientativa las tres figuras (no es una copia exacta):

| Figura | Qué pide | Cómo está hecho |
|---|---|---|
| 1. Pantalla principal | Botones arriba, lista de categorías a la izquierda y tabla de sites a la derecha (sitio, user, fecha, acciones) | Barra con "Añadir categoría" y "Añadir site"; columna de categorías con la seleccionada resaltada; tabla con cabecera azul y, en Acciones, los botones "Mostrar" (enseña la contraseña, que sale tapada) y "Eliminar" |
| 2. Nueva categoría | Cuadro con Nombre, Cancel y OK | Cuadro oculto con `hidden` que se abre con "Añadir categoría" (con el icono, EXTRA 4) |
| 3. Añadir entrada | URL, User, Password con botón de generar, Description grande, Cancel y Save | `site.html` con esos campos, botón verde "Generar", `<textarea>` para la descripción y botones Cancel (rojo) y Save (azul). Añade un campo "Nombre", porque el enunciado lo pide obligatorio |

Lo que las figuras muestran y **no** está hecho: el icono de **editar** (no es obligatorio y el enunciado solo puntúa lo pedido) y el de **abrir la URL en otra pestaña**, que necesita `window.open`, algo que no está en mi lab ni en la lista de conceptos nuevos permitidos.

## El esquema de 4 pasos

Todas las funcionalidades siguen el mismo esquema:

1. **EVENTO**: el usuario hace clic (`addEventListener("click", ...)`).
2. **VALIDAR**: se comprueba lo escrito con `validarCampo` (o se pide confirmación con `confirm`). Si no vale, se para aquí.
3. **api.metodo()** con `await`, dentro de un `try/catch`: si el servidor falla, se escribe un mensaje en rojo.
4. **REPINTAR**: se vuelve a pedir la lista al servidor y se pinta otra vez.

Ejemplo real (añadir categoría, resumido):

```js
async function anadirCategoria() {
    if (!validarCampo(txtCategoria, 3, lErrorCategoria)) return;   // 2. VALIDAR
    try {
        await api.addCategoria(nombre, icono);                     // 3. api con await
        await cargarCategorias();                                  // 4. REPINTAR
    } catch (error) {
        mostrarError("No se pudo añadir la categoría: " + error.message);
    }
}
btnAceptarCategoria.addEventListener("click", anadirCategoria);    // 1. EVENTO
```

## Funcionalidades obligatorias

### OBLIGATORIO 1: añadir categoría
- **Qué hace**: el botón "Añadir categoría" abre el cuadro "Nueva categoría" (Figura 2). Se escribe un nombre (mínimo 3 caracteres) y se pulsa OK; la categoría aparece en la lista. Cancelar cierra el cuadro.
- **Archivo y función**: `js/index.js` → `abrirDialogoCategoria()`, `cerrarDialogoCategoria()`, `anadirCategoria()`; `js/api.js` → `addCategoria(nombre, icono)`.
- **Nuevo**: `hidden` (el cuadro está en el HTML, oculto, y se muestra o se oculta cambiando `hidden`).
- **API**: `POST /categories` con `{ "name": "...", "icon": "..." }`.
- **Lab**: lecciones [50](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/50-dom-buttons-labels) (click), [51](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/51-dom-text-input) (inputs y validación), [61](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/08-concurrency/61-async-programming) (async/await).
- **Cómo demostrarlo**: pulsar "Añadir categoría", escribir "ab" y OK (sale "Mínimo 3 caracteres (tiene 2)" y el cuadro sigue abierto), escribir "Banca" y OK.

### OBLIGATORIO 2: eliminar categoría
- **Qué hace**: el botón "Eliminar" de cada categoría la borra, tras confirmar.
- **Archivo y función**: `js/index.js` → `eliminarCategoria(categoria)`; `js/api.js` → `deleteCategoria(id)`.
- **API**: `DELETE /categories/:id`.
- **Lab**: lecciones [41](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/41-exception-handling) (try/catch), 49-50 (DOM y botones), 61.
- **Nuevo**: `confirm()` abre una ventana Aceptar/Cancelar.
- **Cómo demostrarlo**: pulsar Eliminar y Cancelar (no pasa nada); pulsarlo y Aceptar (desaparece).

### OBLIGATORIO 3: ver los sites de una categoría
- **Qué hace**: al pulsar el nombre de una categoría se piden sus sites al servidor y se pintan en una tabla con sitio, usuario, fecha de creación y contraseña. La contraseña sale tapada (••••••••) y se enseña con el botón "Mostrar" de su fila. Si no hay sites sale un texto.
- **Archivo y función**: `js/index.js` → `seleccionarCategoria(id)`, `pintarSites(categoria)`, `crearFilaSite(site)`, `crearBotonMostrar(site, celdaPassword)`, `formatearFecha(texto)`; `js/api.js` → `getCategoria(id)`.
- **API**: `GET /categories/:id` (devuelve la categoría con `sites` dentro).
- **Lab**: lecciones 15 (if/else), 24 (arrays), 33 (for...of), [40](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/40-datetime) (fechas), 49-51 (DOM), 61.
- **Cómo demostrarlo**: pulsar una categoría con sites (tabla) y otra sin sites (texto "Esta categoría no tiene sites todavía.").

### OBLIGATORIO 4: añadir site
- **Qué hace**: con una categoría seleccionada se activa el botón "Añadir site" de la barra, que abre `site.html` (con `location.href = "site.html?categoria=3"`). Nombre (mín. 3), usuario (mín. 3) y contraseña (mín. 8) son obligatorios. Save guarda y vuelve a `index.html` con la categoría abierta; Cancel vuelve sin guardar.
- **Archivo y función**: `js/site.js` → `guardarSite()`, `formularioValido()`, `leerFormulario()`; `js/api.js` → `addSite(idCategoria, site)`; `js/index.js` → `abrirCategoriaDeLaUrl()`; `volver()` (usado por Cancel y tras guardar) también usa `location.href`.
- **API**: `POST /categories/:id` con `{ name, url, user, password, description }`.
- **Cómo viaja la categoría**: por la URL, `site.html?categoria=3`. Se lee con `URLSearchParams(location.search)`.
- **Lab**: lecciones 09 (Number), 14 (&&), 41, 50-51, 61.
- **Nuevo**: `URLSearchParams`, `location`.
- **Cómo demostrarlo**: pulsar Save con el formulario vacío (salen tres mensajes) y luego con datos válidos (vuelve y aparece el site).

### OBLIGATORIO 5: eliminar site
- **Qué hace**: cada fila de la tabla tiene en "Acciones" un botón "Eliminar" que borra el site, tras confirmar.
- **Archivo y función**: `js/index.js` → `eliminarSite(site)`, `crearBotonEliminarSite(site)`; `js/api.js` → `deleteSite(id)`.
- **API**: `DELETE /sites/:id`.
- **Lab**: lecciones 41, 49-50, 61.
- **Cómo demostrarlo**: pulsar Eliminar en una fila y aceptar.

## Funcionalidades extra

### EXTRA 1: generar contraseña segura
- **Qué hace**: en `site.html`, el botón verde "Generar", junto al campo Password (Figura 3), escribe una contraseña de 12 caracteres con minúsculas, mayúsculas, números y símbolos (sin `l`, `I`, `O`, `0`, `1`, que se confunden al leerlos). La casilla "Mostrar contraseña" la enseña u oculta.
- **Archivo y función**: `js/site.js` → `generarPassword()`, `aleatorioHasta(max)`, `caracterAleatorio(texto)`, `mezclar(caracteres)`, `mostrarPassword(visible)`.
- **Cómo funciona**: se coge **un carácter de cada grupo** (así siempre hay de los cuatro tipos), se rellena hasta 12 con caracteres de cualquier grupo y se **mezcla** con Fisher-Yates para que los cuatro primeros no estén siempre al principio. El azar sale de `crypto.getRandomValues`.
- **Lab**: lecciones 06, 08 (constantes), 19 (for), 23 (`texto[i]`), 24 (push, join), [45](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/45-random) (Fisher-Yates e intercambio `[a, b] = [b, a]`; dice que para contraseñas se usa `crypto.getRandomValues`), [52](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/52-dom-checkbox-radiobuttons) (checkbox).
- **Nuevo**: `crypto.getRandomValues`, `Uint32Array`, evento `change`.
- **Cómo demostrarlo**: pulsar Generar varias veces (siempre distinta, 12 caracteres) y marcar/desmarcar "Mostrar contraseña".

### EXTRA 2: buscador
- **Qué hace**: el cuadro de búsqueda, a la derecha de la barra de botones, filtra a la vez las categorías (por nombre) y los sites (por nombre y usuario) mientras se escribe, sin distinguir mayúsculas.
- **Archivo y función**: `js/index.js` → `filtrar()`, `filtrarCategorias(buscado)`, `filtrarSites(buscado)`, `contiene(texto, buscado)`.
- **Cómo funciona**: no se pide nada al servidor; se **ocultan** con `hidden` los elementos ya pintados que no contienen el texto (`toLowerCase` + `includes`). Tras repintar se vuelve a aplicar el filtro.
- **Lab**: lección [23](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/04-data-structures/23-string-class) (toLowerCase, includes), 24, 33, 49 (querySelector).
- **Nuevo**: evento `input`, `hidden`.
- **Cómo demostrarlo**: escribir "git" y ver cómo desaparecen las filas que no coinciden; borrar y vuelven.

### EXTRA 3: clase que agrupa las llamadas a la API
- **Qué hace**: la clase `Api` tiene un método por cada ruta (`getCategorias`, `getCategoria`, `addCategoria`, `addSite`, `deleteCategoria`, `deleteSite`). Las pantallas no usan `fetch` ni conocen las rutas.
- **Archivo y función**: `js/api.js`. El atributo `#urlBase` y el método `#peticion` son privados; `#peticion` contiene el **único `fetch` del proyecto**.
- **Lab**: lecciones [26](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/26-classes-introduction) y [29](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/29-constructors) (clases), [37](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/37-encapsulation-private) (privados `#`), 41 (throw), 61.
- **Nuevo**: `fetch`, `JSON.stringify`, `respuesta.json()`.
- **Cómo demostrarlo**: buscar "fetch" en `www/js`: solo aparece en `api.js`.

### EXTRA 4: icono en las categorías
- **Qué hace**: al crear una categoría se elige un emoji de una lista desplegable dentro del cuadro "Nueva categoría"; se muestra antes del nombre. Las categorías sin icono muestran 📁.
- **Archivo y función**: `index.html` (`<select id="cmbIcono">`), `js/index.js` → `crearIconoCategoria()` (`categoria.icon || "📁"`) y `anadirCategoria()`; `js/api.js` → `addCategoria(nombre, icono)`. Requiere el cambio en el servidor (ver más abajo).
- **API**: `POST /categories` con `{ name, icon }`.
- **Lab**: lección 14 (`||` como valor por defecto), 49, 51.
- **Cómo demostrarlo**: crear "Banca" con el icono 🏦 y ver que aparece; recargar la página (el icono se guarda en la base de datos).

### EXTRA 5: validación al salir del campo (blur)
- **Qué hace**: los campos obligatorios se validan en cuanto el usuario sale de ellos (clic fuera o Tab): aparece el mensaje y el borde se pone rojo.
- **Archivo y función**: `js/validacion.js` → `validarCampo(input, minimo, parrafoError)`; los `addEventListener("blur", ...)` están en `js/index.js` y `js/site.js`.
- **Lab**: lección 51 (validar inputs).
- **Nuevo**: evento `blur`, `classList`.
- **Cómo demostrarlo**: hacer clic en "Nombre", pulsar Tab sin escribir: sale "Mínimo 3 caracteres (tiene 0)".
- **Detalle importante**: el mensaje es corto y su párrafo tiene altura fija. Si el mensaje ocupara dos líneas o el párrafo cambiara de altura, el botón se movería entre el `blur` y el clic y el clic se perdería. Está comprobado (ver `css/estilos.css`, sección 7).

### Mejoras de uso (sin ser obligatorias ni extras)
- `confirm()` antes de borrar categorías y sites.
- La contraseña sale tapada en la tabla y cada fila tiene un botón "Mostrar" / "Ocultar" (`crearBotonMostrar`).
- La categoría seleccionada se resalta (al seleccionar se repinta la lista y `crearItemCategoria` compara cada id con `idSeleccionada`).
- Los botones OK (categoría) y Save (site) se desactivan mientras guardan (evita duplicados con un doble clic).
- Mensaje en rojo si el servidor falla.

## Origen del código

Cada línea tiene un origen. Tres fuentes:

| Origen | Qué es | Cómo se marca |
|---|---|---|
| **Profesor** | [ohierro/dwec_aa1_server](https://github.com/ohierro/dwec_aa1_server): servidor, API, base de datos, `package.json`, README original | No se reescribe. Lo que se cambió lleva `// AÑADIDO: ...` o `// CORREGIDO: ...` |
| **Mi lab** | [programming-language-lab](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript) | Cada bloque de `www/` indica `(lección NN)` |
| **Nuevo** | Lo que no viene de ninguno de los dos | `// NUEVO (no está en el lab): ...` con su explicación |

| Archivo | Origen | Qué se cambió / en qué lecciones se basa |
|---|---|---|
| `index.js` (raíz), `src/categories/*.js`, `db/**`, `config/`, `.sequelizerc`, `package.json` | Profesor | Sin cambios, salvo los de la fila siguiente |
| `db/models/category.js`, `db/migrations/…create-category.js`, `db/seeders/…categories.js`, `src/categories/category.controller.js`, `src/categories/sites.controller.js` | Profesor **modificado** | Campo `icon` y `return` en los `deleteOne` (ver [Cambios en el servidor](#cambios-en-el-servidor)) |
| `README.md` (raíz) | Profesor + aviso mío | Aviso al principio con enlace a este README |
| `www/index.html`, `www/site.html` | Mío | Lecciones 49, 50, 51, 52 (el `<select>` y el `<textarea>` son solo HTML) |
| `www/css/estilos.css` | Mío | Lección 49 (HTML y CSS separados); `display:flex`, variables CSS y `[hidden]` son solo CSS |
| `www/js/api.js` | Mío | Lecciones 26, 29, 37, 41, 61 + `fetch`, `JSON.stringify`, `respuesta.json()`, `respuesta.ok` |
| `www/js/validacion.js` | Mío | Lecciones 15, 23, 51 + `classList` |
| `www/js/index.js` | Mío | Lecciones 09, 14, 15, 24, 33, 40, 41, 49, 50, 51, 61 + `confirm`, `hidden`, `input`, `blur`, `URLSearchParams`, `location`, `classList` |
| `www/js/site.js` | Mío | Lecciones 06, 08, 09, 14, 15, 19, 23, 24, 41, 45, 50, 51, 52, 61 + `crypto.getRandomValues`, `Uint32Array`, `change`, `blur`, `URLSearchParams`, `location`, `input.type` |

## Cambios en el servidor

Solo se tocaron 5 archivos del profesor. Cada línea cambiada lleva un comentario `AÑADIDO` o `CORREGIDO`. Commit: `fix(servidor): campo icon en categorías y return en los deleteOne`.

| Archivo | Antes | Después | Por qué |
|---|---|---|---|
| `db/models/category.js` | `name: DataTypes.STRING` | `name: DataTypes.STRING,` + `icon: DataTypes.STRING` | Para guardar el icono de la categoría (EXTRA 4). Sin el campo en el modelo, Sequelize ignoraría `icon` |
| `db/migrations/…create-category.js` | solo la columna `name` | + columna `icon` | La tabla `Categories` necesita la columna |
| `db/seeders/…categories.js` | solo `name` | + `icon: "📁"` | Las categorías de ejemplo tienen un icono |
| `src/categories/category.controller.js` (`deleteOne`) | `res.sendStatus(404)` | `return res.sendStatus(404)` | Sin `return` el código seguía, `category.destroy()` fallaba (`category` es `null`) y **el servidor se caía** al borrar un id que no existe |
| `src/categories/sites.controller.js` (`deleteOne`) | `res.sendStatus(404)` | `return res.sendStatus(404)` | Igual: `site.destroy()` fallaba con `site` `null` |

Después de tocar modelo y migración se borró `database.sqlite` (no está en git) y se lanzó `npm run db:init`.

## Conceptos nuevos explicados

Lo que no está en el lab. La lista cerrada permitida es esta:

| Concepto | Qué es | Dónde se usa |
|---|---|---|
| `fetch` | Función del navegador para llamar a un servidor. Devuelve una promesa: se usa con `await` | `api.js`, `#peticion` |
| `JSON.stringify(objeto)` | Convierte un objeto en texto JSON para enviarlo en el cuerpo del POST | `api.js`, `#peticion` |
| `respuesta.json()` | Convierte el texto JSON que contesta el servidor en objetos o arrays | `api.js` |
| Evento `blur` | Salta cuando un campo pierde el foco (clic fuera o Tab) | `index.js`, `site.js` (EXTRA 5) |
| Evento `input` | Salta con cada cambio en el cuadro (con cada letra) | `index.js` (buscador) |
| Evento `change` | Salta cuando una casilla se marca o desmarca | `site.js` ("Mostrar contraseña") |
| `classList.add` / `classList.remove` | Añade o quita una clase CSS a un elemento | `validacion.js`, `index.js` |
| `hidden` | Propiedad que oculta (`true`) o muestra (`false`) un elemento | `index.js` |
| `crypto.getRandomValues` | Números aleatorios seguros (los de `Math.random` son predecibles) | `site.js` |
| `Uint32Array` | Lista de números enteros positivos; es lo que rellena `getRandomValues` | `site.js` |
| `URLSearchParams` | Lee los valores de la URL: `?categoria=3` → `.get("categoria")` | `index.js`, `site.js` |
| `location` | La URL de la página: `location.search` la lee y `location.href = ...` cambia de página | `index.js`, `site.js` |
| `confirm()` | Ventana Aceptar/Cancelar; devuelve `true` si se acepta | `index.js` |

Detalles menores que **no están en esa lista cerrada** ni en el lab, y que conviene saber explicar. Los dejé porque no hay una alternativa del lab razonable:

| Detalle | Qué es | Dónde se usa | Por qué no hay alternativa |
|---|---|---|---|
| `respuesta.ok` / `respuesta.status` | `ok` es `true` si el servidor contestó bien (200-299); `status` es el código (404, 500...) | `api.js`, `#peticion` | Sin comprobarlo, un 404 pasaría por correcto, porque `fetch` solo falla sin conexión |
| `input.type` | Propiedad que dice si el cuadro es `password` (puntitos) o `text` (visible). Se cambia como `disabled` o `checked` (lecciones 50 y 52) | `site.js`, `mostrarPassword` | Es la forma de enseñar/ocultar la contraseña con la casilla |
| `<select>` y `<textarea>` | Lista desplegable y cuadro de varias líneas de HTML; su `value` se lee como el de un `<input>` (lección 51) | `index.html`, `index.js`, `site.html`, `site.js` | Es solo HTML; no añade JavaScript nuevo |

## Lecciones del lab usadas

| Lección | Tema | Dónde se usa |
|---|---|---|
| [05](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/02-fundamentals/05-variables) | Variables (`let`) | `idSeleccionada` |
| [06](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/02-fundamentals/06-string-concatenation) | Concatenar textos | Mensajes, rutas, grupos de caracteres |
| [08](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/02-fundamentals/08-constants) | Constantes | `MINUSCULAS`, `LARGO_PASSWORD`… |
| [09](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/02-fundamentals/09-type-casting) | `Number()` | Id que viene en la URL |
| [14](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/02-fundamentals/14-logical-operators) | Operadores lógicos | `&&`, `!`, `\|\|` |
| [15](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/03-control-flow/15-if-else) | if / else | Validación, tabla vacía |
| [19](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/03-control-flow/19-for-loop) | for | Generar contraseña |
| [23](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/04-data-structures/23-string-class) | String | `trim`, `length`, `toLowerCase`, `includes`, `texto[i]` |
| [24](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/04-data-structures/24-arrays) | Arrays | `push`, `join`, posiciones |
| [25](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/04-data-structures/25-array-operations) | Funciones flecha | `() => {...}` en los eventos |
| [26](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/26-classes-introduction) | Clases | `class Api` |
| [28](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/28-methods-with-parameters) | Métodos con parámetros | `addSite(idCategoria, site)` |
| [29](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/29-constructors) | Constructores | `new Api()` |
| [33](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/05-methods-and-classes/33-lists) | for...of | Pintar listas y filas |
| [37](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/37-encapsulation-private) | Privados `#` | `#urlBase`, `#peticion` |
| [40](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/40-datetime) | Fechas | `formatearFecha` |
| [41](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/41-exception-handling) | try/catch/finally, throw | Todas las llamadas al servidor |
| [45](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/06-advanced-oop/45-random) | Random, Fisher-Yates | `mezclar`, `generarPassword` |
| [49](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/49-dom-introduction) | DOM | `getElementById`, `createElement`, `appendChild`, `querySelector(All)` |
| [50](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/50-dom-buttons-labels) | Botones y click | Todos los botones |
| [51](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/51-dom-text-input) | Cuadros de texto | `value`, `trim`, validación |
| [52](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/07-ui-and-databases/52-dom-checkbox-radiobuttons) | Checkbox | "Mostrar contraseña" |
| [61](https://github.com/chipsentinel/programming-language-lab/tree/main/javascript/08-concurrency/61-async-programming) | async / await | Todas las llamadas al servidor |

## 15 preguntas probables de la defensa

**1. ¿Por qué no hay JavaScript dentro del HTML?**
Es un requisito del enunciado y una buena práctica: el HTML es la estructura, el CSS la apariencia y el JS el comportamiento (lección 49). Los eventos se asocian desde el JS con `addEventListener` en lugar de `onclick=`.

**2. ¿Qué hacen `async` y `await`?**
`async` marca una función que usa `await`; `await` espera a que termine una tarea lenta (la respuesta del servidor) sin bloquear la página (lección 61). Sin `await`, la función seguiría antes de tener los datos.

**3. ¿Qué es `fetch` y por qué compruebas el estado de la respuesta?**
`fetch` llama al servidor y devuelve una promesa. No falla si el servidor contesta con un error (404, 500): solo falla si no hay conexión. Por eso `#peticion` comprueba `respuesta.ok` y lanza una excepción con `throw` (lección 41) para que el `catch` de la pantalla muestre el mensaje.

**4. ¿Para qué sirve la clase `Api` y qué significa `#`?**
Agrupa todas las llamadas al servidor (EXTRA 3): las pantallas llaman a `api.getCategorias()` y no saben nada de rutas ni de `fetch`. `#urlBase` y `#peticion` son privados (lección 37): solo se pueden usar dentro de la clase.

**5. ¿Qué diferencia hay entre `click`, `blur`, `input` y `change`?**
`click`: clic en un botón. `blur`: un campo pierde el foco. `input`: cambia el texto del cuadro con cada letra (buscador). `change`: una casilla se marca o desmarca.

**6. ¿Cómo sabe `site.html` a qué categoría añadir el site?**
La categoría viaja en la URL: `site.html?categoria=3`. `site.js` la lee con `new URLSearchParams(location.search).get("categoria")`. Al guardar, vuelve a `index.html?categoria=3` y `index.js` abre esa categoría.

**7. ¿Por qué `crypto.getRandomValues` y no `Math.random`?**
`Math.random` es pseudoaleatorio: sale de una fórmula y se puede predecir. Para contraseñas hace falta azar seguro; la lección 45 lo indica. `getRandomValues` rellena un `Uint32Array` con números impredecibles.

**8. ¿Cómo garantizas que la contraseña tiene símbolos y 12 caracteres?**
Cojo un carácter de cada grupo (minúscula, mayúscula, número, símbolo), relleno hasta 12 con caracteres de cualquier grupo y mezclo. Así siempre están los cuatro tipos. Quito `l`, `I`, `O`, `0` y `1` porque se confunden.

**9. ¿Qué es Fisher-Yates y para qué lo usas?**
Es el algoritmo de la lección 45 para mezclar un array: recorre de atrás hacia delante e intercambia cada posición con otra al azar (`[a, b] = [b, a]`). Lo uso para que los cuatro caracteres obligatorios no queden siempre al principio.

**10. ¿Cómo funciona el buscador y por qué no vuelve a pedir datos al servidor?**
Los elementos ya están pintados. Con cada letra (`input`) recorro las categorías y las filas y pongo `hidden = true` a las que no contienen el texto (en minúsculas, con `includes`). Es más rápido y no carga el servidor.

**11. ¿Por qué `createElement` y no `innerHTML`?**
Con `createElement` + `textContent` el texto se trata siempre como texto: si un site se llamara `<b>hola</b>` se vería literal. Con `innerHTML` se interpretaría como HTML (riesgo de inyectar código). Además es lo que se ve en la lección 49.

**12. ¿Qué pasa si el servidor está apagado?**
`fetch` falla, el `catch` captura el error y se escribe un mensaje en rojo ("No se pudo cargar las categorías: ..."). La página no se rompe.

**13. ¿Qué cambiaste en el servidor y por qué?**
Cinco archivos (ver [Cambios en el servidor](#cambios-en-el-servidor)): añadí el campo `icon` en modelo, migración y seeder para el EXTRA 4, y puse `return` delante de `res.sendStatus(404)` en los dos `deleteOne`, porque sin él el servidor se caía al borrar un id inexistente.

**14. ¿Para qué sirven `try`, `catch` y `finally`?**
`try` ejecuta el código que puede fallar (la llamada al servidor), `catch` decide qué hacer si falla (mostrar el mensaje) y `finally` se ejecuta siempre (lección 41); lo uso para volver a activar el botón de añadir.

**15. ¿Por qué el mensaje de error es tan corto?**
Al salir de un campo salta `blur` y aparece el mensaje; si ocupara dos líneas, el botón de debajo se movería antes de que llegara el clic y el clic se perdería. Por eso el mensaje es corto ("Mínimo N caracteres (tiene X)") y su párrafo tiene altura fija. Lo comprobé con clics reales: con altura fija el botón se mueve 0 px; sin ella se desplazaba (10 px en el cuadro de categoría y 19 px en la lista).

## Uso de IA

En este trabajo he usado herramientas de IA como apoyo en el código y en la documentación. He probado la aplicación y repasado el código para poder explicarlo.

## Posibles mejoras

- **Editar sites** (la API tiene `PUT /sites/:id`, no se usa porque no es obligatorio).
- **Copiar la contraseña al portapapeles** con un botón por fila (ahora solo se puede mostrar).
- **Cifrar las contraseñas** en el servidor: ahora se guardan en texto plano, algo que un gestor real no haría.
- **Borrar los sites de una categoría** cuando se borra la categoría (ahora quedan huérfanos en la base de datos).
- **Editar o reordenar categorías** y permitir iconos propios.
- **Avisos más amables** que `confirm()` (un cuadro propio en la página).
- **Probar la aplicación automáticamente** con pruebas del navegador.
