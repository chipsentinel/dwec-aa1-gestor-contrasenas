// api.js: EXTRA 3 - una clase que agrupa TODAS las llamadas al servidor.
// Así las pantallas (index.js, site.js) no saben nada de fetch ni de rutas: solo llaman a métodos
// como api.getCategorias(). Si cambia el servidor, solo se toca este archivo.
//
// Se carga con <script src="js/api.js"> ANTES que el JS de la pantalla, para que la clase exista.


// ===== 1. La clase Api =====

// Clase con atributo privado y método privado: lecciones 26 (clases), 29 (constructores) y 37 (privados #)
class Api {

    // Dirección del servidor del profesor (lección 37: atributo privado, solo se usa dentro de la clase)
    #urlBase = "http://localhost:3000";


    // ===== 2. El ÚNICO fetch del proyecto =====

    // Método privado (lección 37). Hace la llamada al servidor y devuelve la respuesta.
    //   ruta:   por ejemplo "/categories"
    //   metodo: "GET", "POST" o "DELETE"
    //   datos:  objeto con los datos a enviar (solo en los POST); en GET y DELETE no se pasa
    // async/await: lección 61.
    async #peticion(ruta, metodo, datos) {
        // NUEVO (no está en el lab): fetch es la función del navegador para llamar a un servidor.
        // Recibe la dirección y un objeto con las opciones (method, headers, body).
        const opciones = { method: metodo };

        if (datos) {
            // El servidor exige esta cabecera en los POST para entender que el cuerpo es JSON
            opciones.headers = { "Content-Type": "application/json" };
            // NUEVO (no está en el lab): JSON.stringify convierte un objeto en texto JSON para enviarlo
            opciones.body = JSON.stringify(datos);
        }

        // await: espera a que el servidor conteste (lección 61)
        const respuesta = await fetch(this.#urlBase + ruta, opciones);

        // fetch NO falla si el servidor contesta con error (404, 500...): lo comprobamos nosotros
        // y lanzamos la excepción con throw (lección 41, como en dividir entre cero).
        // NUEVO (no está en el lab): respuesta.ok es true si el servidor contestó bien (códigos 200 a 299)
        // y respuesta.status es ese código (200, 404, 500...). Va junto a fetch y respuesta.json().
        if (!respuesta.ok) {
            throw new Error("El servidor respondió con el error " + respuesta.status);
        }

        return respuesta;
    }


    // ===== 3. Métodos públicos: uno por cada ruta de la API =====

    // GET /categories -> lista de categorías: [{id, name, ...}, ...]
    async getCategorias() {
        const respuesta = await this.#peticion("/categories", "GET");
        // NUEVO (no está en el lab): respuesta.json() convierte el texto JSON recibido en objetos/arrays
        return await respuesta.json();
    }

    // POST /categories con {name} -> crea la categoría y devuelve la creada (OBLIGATORIO 1)
    async addCategoria(nombre) {
        const respuesta = await this.#peticion("/categories", "POST", { name: nombre });
        return await respuesta.json();
    }
}
