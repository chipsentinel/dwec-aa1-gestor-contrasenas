// site.js: el COMPORTAMIENTO de la pantalla site.html (añadir un site).
// Mismo esquema que index.js:  EVENTO -> VALIDAR -> api.metodo() con await -> REPINTAR
// (aquí "repintar" es volver a index.html, que vuelve a pedir y pintar los datos).


// ===== 1. Buscar los elementos por su id =====

// (lección 49 y 51)
const lMensaje = document.getElementById("lMensaje");
const lTitulo = document.getElementById("lTitulo");
const txtNombre = document.getElementById("txtNombre");
const lErrorNombre = document.getElementById("lErrorNombre");
const txtUrl = document.getElementById("txtUrl");
const txtUsuario = document.getElementById("txtUsuario");
const lErrorUsuario = document.getElementById("lErrorUsuario");
const txtPassword = document.getElementById("txtPassword");
const lErrorPassword = document.getElementById("lErrorPassword");
const txtDescripcion = document.getElementById("txtDescripcion");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");


// ===== 2. Datos de la pantalla =====

const api = new Api();

// NUEVO (no está en el lab): la categoría llega en la URL (site.html?categoria=3).
// location.search es la parte "?categoria=3" y URLSearchParams permite leer su valor con .get().
const parametros = new URLSearchParams(location.search);
const idCategoria = parametros.get("categoria");     // texto "3", o null si no viene en la URL


// ===== 3. Mensajes de error =====

// Muestra un texto en el párrafo rojo de arriba (lección 50: textContent)
function mostrarError(texto) {
    lMensaje.textContent = texto;
}


// ===== 4. Preparar la pantalla =====

// Si no hay categoría en la URL, no se puede guardar nada: se avisa y se desactiva el botón
// (lección 50: disabled). Si la hay, se escribe su nombre en el título.
function prepararPantalla() {
    if (idCategoria === null) {
        mostrarError("Falta la categoría en la dirección. Vuelve a index.html y pulsa \"Añadir site\".");
        btnGuardar.disabled = true;
        return;
    }

    mostrarNombreDeLaCategoria();
}

// Escribe en el título el nombre de la categoría (se lo pide al servidor)
async function mostrarNombreDeLaCategoria() {
    try {
        const categoria = await api.getCategoria(idCategoria);
        lTitulo.textContent = "Añadir site a " + categoria.name;
    } catch (error) {
        mostrarError("No se pudo cargar la categoría: " + error.message);
    }
}

// Vuelve a index.html con la categoría abierta (o sin ella si no había).
// NUEVO (no está en el lab): location.href cambia de página (lista cerrada: location)
function volver() {
    if (idCategoria === null) {
        location.href = "index.html";
    } else {
        location.href = "index.html?categoria=" + idCategoria;
    }
}

// EVENTO (clic en Cancel): se vuelve sin guardar nada
btnCancelar.addEventListener("click", volver);


// ===== 5. OBLIGATORIO 4: guardar el site =====

// VALIDAR: nombre, usuario y contraseña son obligatorios (mínimos 3, 3 y 8).
// Se llama a validarCampo con los tres para que, si fallan varios, se vean todos los mensajes a la vez.
// El operador lógico && (deben ser true los tres): lección 14
function formularioValido() {
    const nombreOk = validarCampo(txtNombre, 3, lErrorNombre);
    const usuarioOk = validarCampo(txtUsuario, 3, lErrorUsuario);
    const passwordOk = validarCampo(txtPassword, 8, lErrorPassword);

    return nombreOk && usuarioOk && passwordOk;
}

// Construye el objeto con los datos del formulario (objeto literal { clave: valor }, como el de las opciones de la lección 40)
function leerFormulario() {
    return {
        name: txtNombre.value.trim(),
        url: txtUrl.value.trim(),
        user: txtUsuario.value.trim(),
        password: txtPassword.value,           // la contraseña NO se recorta: los espacios podrían ser parte de ella
        description: txtDescripcion.value.trim()
    };
}

// EVENTO (clic en Save) -> VALIDAR -> api.addSite() con await -> volver a index.html
async function guardarSite() {
    if (!formularioValido()) {
        return;
    }

    try {
        await api.addSite(idCategoria, leerFormulario());

        // Se vuelve a index.html con la categoría en la URL; index.js la abre y pinta sus sites (ya con el nuevo)
        volver();
    } catch (error) {
        mostrarError("No se pudo guardar el site: " + error.message);
    }
}

btnGuardar.addEventListener("click", guardarSite);


// ===== 6. Arranque =====

prepararPantalla();
