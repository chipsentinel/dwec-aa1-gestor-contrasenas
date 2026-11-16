// index.js: el COMPORTAMIENTO de la pantalla principal (index.html).
// Esquema que siguen TODAS las funcionalidades de este archivo:
//     EVENTO -> VALIDAR -> api.metodo() con await -> REPINTAR
// y cada llamada al servidor va dentro de un try/catch que muestra un mensaje en rojo si falla.


// ===== 1. Buscar los elementos por su id =====

// (lección 49 y 51: document.getElementById)
const lMensaje = document.getElementById("lMensaje");
const ulCategorias = document.getElementById("ulCategorias");


// ===== 2. Datos de la pantalla =====

// Un único objeto Api para toda la pantalla (lección 26: crear un objeto con new)
const api = new Api();


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
    item.textContent = categoria.name;
    return item;
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


// ===== 6. Arranque =====

// Al cargarse el script (al final del body) se piden las categorías
cargarCategorias();
