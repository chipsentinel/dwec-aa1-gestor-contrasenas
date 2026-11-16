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

    // Son métodos con parámetros (lección 28): reciben el id, el nombre o el site y los pasan a #peticion

    // GET /categories -> lista de categorías: [{id, name, ...}, ...]
    async getCategorias() {
        const respuesta = await this.#peticion("/categories", "GET");
        // NUEVO (no está en el lab): respuesta.json() convierte el texto JSON recibido en objetos/arrays
        return await respuesta.json();
    }

    // POST /categories con {name, icon} -> crea la categoría y devuelve la creada (OBLIGATORIO 1)
    // icono: el emoji elegido (EXTRA 4)
    async addCategoria(nombre, icono) {
        const respuesta = await this.#peticion("/categories", "POST", { name: nombre, icon: icono });
        return await respuesta.json();
    }

    // GET /categories/:id -> la categoría con sus sites dentro: {id, name, sites: [...]} (OBLIGATORIO 3)
    async getCategoria(id) {
        const respuesta = await this.#peticion("/categories/" + id, "GET");
        return await respuesta.json();
    }

    // POST /categories/:id con {name, url, user, password, description} -> crea un site en esa categoría
    // (OBLIGATORIO 4). "site" es un objeto con esos cinco campos.
    async addSite(idCategoria, site) {
        const respuesta = await this.#peticion("/categories/" + idCategoria, "POST", site);
        return await respuesta.json();
    }

    // DELETE /sites/:id -> borra un site (OBLIGATORIO 5). Contesta "OK", no JSON
    async deleteSite(id) {
        await this.#peticion("/sites/" + id, "DELETE");
    }

    // DELETE /categories/:id -> borra la categoría (OBLIGATORIO 2)
    // El servidor contesta solo "OK" (no es JSON), por eso aquí NO se llama a respuesta.json()
    async deleteCategoria(id) {
        await this.#peticion("/categories/" + id, "DELETE");
    }
}
