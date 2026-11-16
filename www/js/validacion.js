// validacion.js: la validación de campos, común a las dos pantallas.
// Se carga con <script src="js/validacion.js"> después de api.js y antes del JS de la pantalla.


// ===== 1. validarCampo =====

// Comprueba que el texto de un cuadro tiene al menos "minimo" caracteres.
//   input:        el cuadro de texto (<input>)
//   minimo:       número mínimo de caracteres (categoría 3, nombre 3, usuario 3, contraseña 8)
//   parrafoError: el <p> donde se escribe el mensaje de error
// Devuelve true si es válido y false si no (lección 15: if/else; lección 51: validar lo escrito).
function validarCampo(input, minimo, parrafoError) {
    // trim() quita los espacios de los extremos: "   " cuenta como vacío (lección 51)
    const largo = input.value.trim().length;

    if (largo < minimo) {
        // Mensaje CORTO a propósito: si ocupara dos líneas, el botón de debajo se movería
        // al aparecer/desaparecer el mensaje y el clic se perdería (se explica en el README).
        parrafoError.textContent = "Mínimo " + minimo + " caracteres (tiene " + largo + ")";

        // NUEVO (no está en el lab): classList.add añade una clase CSS al elemento (aquí, "invalido",
        // que pone el borde en rojo). Es la forma que sugiere la lección 50 al final.
        input.classList.add("invalido");
        return false;
    }

    // Es válido: se borra el mensaje y se quita la clase roja
    parrafoError.textContent = "";
    input.classList.remove("invalido");   // NUEVO (no está en el lab): classList.remove quita la clase
    return true;
}
