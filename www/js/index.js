// index.js: el COMPORTAMIENTO de la pantalla principal (index.html).
// Esquema que siguen TODAS las funcionalidades de este archivo:
//     EVENTO -> VALIDAR -> api.metodo() con await -> REPINTAR
// y cada llamada al servidor va dentro de un try/catch que muestra un mensaje en rojo si falla.


// ===== 1. Buscar los elementos por su id =====

// (lección 49 y 51: document.getElementById)
const lMensaje = document.getElementById("lMensaje");
const ulCategorias = document.getElementById("ulCategorias");
const btnNuevaCategoria = document.getElementById("btnNuevaCategoria");
const fondoDialogo = document.getElementById("fondoDialogo");
const txtCategoria = document.getElementById("txtCategoria");
const lErrorCategoria = document.getElementById("lErrorCategoria");
const btnCancelarCategoria = document.getElementById("btnCancelarCategoria");
const btnAceptarCategoria = document.getElementById("btnAceptarCategoria");
const lTituloSites = document.getElementById("lTituloSites");
const lSinSites = document.getElementById("lSinSites");
const tblSites = document.getElementById("tblSites");
const tbodySites = document.getElementById("tbodySites");


// ===== 2. Datos de la pantalla =====

// Un único objeto Api para toda la pantalla (lección 26: crear un objeto con new)
const api = new Api();

// Id de la categoría que se está viendo (null = ninguna). Es una variable con let (lección 05)
let idSeleccionada = null;


// ===== 3. Mensajes de error =====

// Muestra un texto en el párrafo rojo de arriba (lección 50: textContent)
function mostrarError(texto) {
    lMensaje.textContent = texto;
}

// Lo vacía cuando todo va bien
function quitarError() {
    lMensaje.textContent = "";
}


// ===== 4. Pintar las categorías =====

// Crea el <li> de UNA categoría (lección 49: createElement + textContent)
function crearItemCategoria(categoria) {
    const item = document.createElement("li");

    // El nombre va en un <span> propio (lección 49) para que más adelante se pueda hacer clic en él
    const nombre = document.createElement("span");
    nombre.textContent = categoria.name;
    nombre.classList.add("nombre");         // classList.add: ver validacion.js. El CSS y el buscador lo localizan por esta clase

    // OBLIGATORIO 3: al hacer clic en el nombre se selecciona la categoría y se piden sus sites
    nombre.addEventListener("click", () => {
        seleccionarCategoria(categoria.id);
    });

    item.appendChild(nombre);
    item.appendChild(crearBotonEliminarCategoria(categoria));
    return item;
}

// OBLIGATORIO 2: crea el botón para eliminar la categoría (lección 50: botones y click)
function crearBotonEliminarCategoria(categoria) {
    const boton = document.createElement("button");
    boton.textContent = "Eliminar";
    boton.addEventListener("click", () => {
        eliminarCategoria(categoria);
    });
    return boton;
}

// Repinta toda la lista: primero la vacía y luego añade un <li> por categoría
function pintarCategorias(categorias) {
    // Vaciar un elemento: textContent = "" (lección 51: así se vacía un texto)
    ulCategorias.textContent = "";

    // for...of: recorre el array elemento a elemento (lección 33)
    for (const categoria of categorias) {
        ulCategorias.appendChild(crearItemCategoria(categoria));
    }
}


// ===== 5. Pedir las categorías al servidor =====

// EVENTO (aquí, el arranque de la página) -> api.getCategorias() con await -> REPINTAR
// async/await: lección 61. try/catch: lección 41.
async function cargarCategorias() {
    try {
        const categorias = await api.getCategorias();
        pintarCategorias(categorias);
        quitarError();
    } catch (error) {
        // El servidor está apagado o ha fallado: se avisa en rojo
        mostrarError("No se pudo cargar las categorías: " + error.message);
    }
}


// ===== 6. OBLIGATORIO 1: añadir una categoría =====

// El cuadro "Nueva categoría" (Figura 2) está en el HTML, oculto con hidden. Se muestra y se oculta
// cambiando hidden (true = oculto, false = visible). hidden está en la lista cerrada de cosas nuevas.

// Abre el cuadro con el campo vacío y sin errores de una vez anterior (lección 51: value y textContent)
function abrirDialogoCategoria() {
    txtCategoria.value = "";
    lErrorCategoria.textContent = "";
    txtCategoria.classList.remove("invalido");
    fondoDialogo.hidden = false;
}

function cerrarDialogoCategoria() {
    fondoDialogo.hidden = true;
}

// EVENTO (clic en OK) -> VALIDAR -> api.addCategoria() con await -> REPINTAR
// (lección 50: evento click; lección 51: leer y validar un cuadro de texto)
async function anadirCategoria() {
    // VALIDAR: el nombre es obligatorio (mínimo 3 caracteres). Si no vale, el cuadro sigue abierto
    // y no se llama al servidor
    if (!validarCampo(txtCategoria, 3, lErrorCategoria)) {
        return;
    }

    try {
        // trim() quita los espacios sobrantes antes de enviar el nombre (lección 51)
        await api.addCategoria(txtCategoria.value.trim());
        cerrarDialogoCategoria();
        await cargarCategorias();         // REPINTAR: se vuelve a pedir la lista ya con la nueva
    } catch (error) {
        cerrarDialogoCategoria();         // el mensaje rojo está detrás del cuadro: se cierra para verlo
        mostrarError("No se pudo añadir la categoría: " + error.message);
    }
}

btnNuevaCategoria.addEventListener("click", abrirDialogoCategoria);
btnCancelarCategoria.addEventListener("click", cerrarDialogoCategoria);
btnAceptarCategoria.addEventListener("click", anadirCategoria);


// ===== 7. OBLIGATORIO 2: eliminar una categoría =====

// EVENTO (clic en Eliminar) -> CONFIRMAR -> api.deleteCategoria() con await -> REPINTAR
async function eliminarCategoria(categoria) {
    // NUEVO (no está en el lab): confirm() abre una ventana con Aceptar / Cancelar.
    // Devuelve true si el usuario acepta. Evita borrar por un clic accidental.
    if (!confirm("¿Eliminar la categoría \"" + categoria.name + "\"?")) {
        return;
    }

    try {
        await api.deleteCategoria(categoria.id);

        // Si era la categoría que se estaba viendo, la columna de sites se deja vacía
        if (idSeleccionada === categoria.id) {
            ocultarSites();
        }

        await cargarCategorias();         // REPINTAR: la lista ya sin la categoría borrada
    } catch (error) {
        mostrarError("No se pudo eliminar la categoría: " + error.message);
    }
}


// ===== 8. OBLIGATORIO 3: ver los sites de una categoría =====

// Convierte la fecha que manda el servidor ("2026-11-16T03:10:14.548Z") en "16/11/2026"
// new Date(texto) y toLocaleDateString: lección 40 (fechas)
function formatearFecha(texto) {
    const fecha = new Date(texto);
    return fecha.toLocaleDateString("es-ES");
}

// Crea una celda <td> con un texto (lección 49)
function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

// Crea la fila <tr> de UN site. Como en la Figura 1, la contraseña NO se enseña en la tabla
function crearFilaSite(site) {
    const fila = document.createElement("tr");

    // Los textos de las columnas, en el mismo orden que la cabecera (lección 24: arrays)
    const textos = [site.name, site.user, formatearFecha(site.createdAt)];

    // for...of: lección 33
    for (const texto of textos) {
        fila.appendChild(crearCelda(texto));
    }

    return fila;
}

// Deja la columna derecha como al principio (ninguna categoría seleccionada)
function ocultarSites() {
    idSeleccionada = null;
    lTituloSites.textContent = "Selecciona una categoría";
    lSinSites.textContent = "";
    tblSites.hidden = true;       // NUEVO (no está en el lab): hidden oculta un elemento (true) o lo muestra (false)
}

// Repinta la columna derecha con los datos de una categoría (que trae sus "sites" dentro)
function pintarSites(categoria) {
    lTituloSites.textContent = "Sites de " + categoria.name;

    // Se vacía la tabla antes de pintar (lección 51)
    tbodySites.textContent = "";

    if (categoria.sites.length === 0) {
        // Sin sites: se muestra un texto y se oculta la tabla (lección 15: if/else)
        lSinSites.textContent = "Esta categoría no tiene sites todavía.";
        tblSites.hidden = true;
        return;
    }

    lSinSites.textContent = "";
    tblSites.hidden = false;
    for (const site of categoria.sites) {
        tbodySites.appendChild(crearFilaSite(site));
    }
}

// EVENTO (clic en una categoría) -> api.getCategoria() con await -> REPINTAR la columna derecha
async function seleccionarCategoria(id) {
    try {
        const completa = await api.getCategoria(id);
        idSeleccionada = id;
        pintarSites(completa);
        quitarError();
    } catch (error) {
        mostrarError("No se pudo cargar los sites: " + error.message);
    }
}


// ===== 9. Arranque =====

// Al cargarse el script (al final del body) se piden las categorías
cargarCategorias();
