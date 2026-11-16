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
const btnGenerar = document.getElementById("btnGenerar");
const ckMostrar = document.getElementById("ckMostrar");
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

// EVENTO (clic en Cancel): se vuelve sin guardar nada. Aquí se pasa la función por su nombre; en otros
// eventos se usa una función flecha () => { ... } (lección 25)
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

    // Mejora de uso: el botón se desactiva mientras se guarda, para no guardar dos veces con un doble clic
    btnGuardar.disabled = true;

    try {
        await api.addSite(idCategoria, leerFormulario());

        // Se vuelve a index.html con la categoría en la URL; index.js la abre y pinta sus sites (ya con el nuevo)
        volver();
    } catch (error) {
        mostrarError("No se pudo guardar el site: " + error.message);
        btnGuardar.disabled = false;      // si falló, se puede volver a intentar
    }
}

btnGuardar.addEventListener("click", guardarSite);

// EXTRA 5: validar cada campo obligatorio al SALIR de él.
// NUEVO (no está en el lab): el evento "blur" salta cuando un cuadro de texto pierde el foco
// (el usuario hace clic en otro sitio o pulsa Tab). Se usa igual que "click" (lección 50).
txtNombre.addEventListener("blur", () => {
    validarCampo(txtNombre, 3, lErrorNombre);
});

txtUsuario.addEventListener("blur", () => {
    validarCampo(txtUsuario, 3, lErrorUsuario);
});

txtPassword.addEventListener("blur", () => {
    validarCampo(txtPassword, 8, lErrorPassword);
});


// ===== 6. EXTRA 1: generar una contraseña segura =====

// Los cuatro grupos de caracteres. Se quitan los que se confunden al leerlos: l, I, O, 0 y 1.
// Constantes en MAYÚSCULAS (lección 08)
const MINUSCULAS = "abcdefghijkmnpqrstuvwxyz";
const MAYUSCULAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMEROS = "23456789";
const SIMBOLOS = "!@#$%&*?+-=";
const LARGO_PASSWORD = 12;

// Número entero al azar entre 0 y max (el máximo NO se incluye), como aleatorioHasta de la lección 45.
// Diferencia con el lab: Math.random() no sirve para contraseñas (lo dice la lección 45), así que se usa
// crypto.getRandomValues, que da números impredecibles.
// NUEVO (no está en el lab): new Uint32Array(1) es una lista de 1 número entero positivo; getRandomValues
// la rellena con un número al azar seguro. Con % max se reduce al rango pedido.
function aleatorioHasta(max) {
    const numeros = new Uint32Array(1);
    crypto.getRandomValues(numeros);
    return numeros[0] % max;
}

// Un carácter al azar de un texto (lección 23: texto[posición])
function caracterAleatorio(texto) {
    return texto[aleatorioHasta(texto.length)];
}

// Mezcla el array con el algoritmo de Fisher-Yates (lección 45, apartado 7), pero con el azar seguro
function mezclar(caracteres) {
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = aleatorioHasta(i + 1);
        [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];   // intercambia dos posiciones (lección 45)
    }
}

// Construye la contraseña: 1 carácter de cada grupo (así siempre hay de los cuatro tipos),
// se rellena hasta 12 con caracteres de cualquier grupo y se mezcla
function generarPassword() {
    const todos = MINUSCULAS + MAYUSCULAS + NUMEROS + SIMBOLOS;      // lección 06: concatenar textos
    const caracteres = [
        caracterAleatorio(MINUSCULAS),
        caracterAleatorio(MAYUSCULAS),
        caracterAleatorio(NUMEROS),
        caracterAleatorio(SIMBOLOS)
    ];

    // for: lección 19; push: lección 24
    for (let i = caracteres.length; i < LARGO_PASSWORD; i++) {
        caracteres.push(caracterAleatorio(todos));
    }

    mezclar(caracteres);
    return caracteres.join("");                                      // lección 24: join
}

// Enseña u oculta la contraseña cambiando el tipo del cuadro: "text" la muestra, "password" la oculta
// NUEVO (no está en el lab): type es la propiedad que dice qué tipo de cuadro es el <input>. Se cambia igual
// que disabled o checked (lecciones 50 y 52): "password" (puntitos) o "text" (texto visible).
function mostrarPassword(visible) {
    if (visible) {
        txtPassword.type = "text";
    } else {
        txtPassword.type = "password";
    }
    ckMostrar.checked = visible;               // lección 52: checked
}

// EVENTO (clic en Generar) -> se escribe la contraseña, se muestra y se valida (así se quita el error)
btnGenerar.addEventListener("click", () => {
    txtPassword.value = generarPassword();
    mostrarPassword(true);                     // se enseña para que el usuario pueda verla y copiarla
    validarCampo(txtPassword, 8, lErrorPassword);
});

// NUEVO (no está en el lab): el evento "change" salta cuando una casilla cambia de estado (se marca o se
// desmarca). En la lección 52 se lee checked con un botón; aquí se reacciona al instante.
ckMostrar.addEventListener("change", () => {
    mostrarPassword(ckMostrar.checked);
});


// ===== 7. Arranque =====

prepararPantalla();
