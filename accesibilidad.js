(() => {
  "use strict";

  const CLAVES = {
    grises: "evaEscalaGrises",
    fuente: "evaFuenteLegible",
    espaciado: "evaEspaciadoAmplio",
    enlaces: "evaEnlacesSubrayados",
    movimiento: "evaMovimientoReducido"
  };

  const estaActivo = (clave) => localStorage.getItem(clave) === "activo";

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const main = document.querySelector("main");
    const panel = document.querySelector(".controles-accesibilidad");

    if (!body || !panel || panel.dataset.evaAccesibilidadInicializada === "true") return;
    panel.dataset.evaAccesibilidadInicializada = "true";

    if (main && !main.id) main.id = "contenido-principal";

    if (main && !document.querySelector(".enlace-saltar-contenido")) {
      const enlaceSaltar = document.createElement("a");
      enlaceSaltar.className = "enlace-saltar-contenido";
      enlaceSaltar.href = "#contenido-principal";
      enlaceSaltar.textContent = "Saltar al contenido principal";
      body.prepend(enlaceSaltar);
    }

    panel.setAttribute("aria-label", "Opciones de accesibilidad de la página");
    panel.classList.add("panel-accesibilidad-eva");

    const encabezado = document.createElement("div");
    encabezado.className = "accesibilidad-encabezado";
    encabezado.innerHTML = `
      <h3>Opciones de accesibilidad</h3>
      <p>Personalice la lectura y la visualización. Las preferencias quedan guardadas en este dispositivo.</p>
    `;
    panel.prepend(encabezado);

    const crearBoton = ({ id, texto, clave, descripcion }) => {
      const boton = document.createElement("button");
      boton.id = id;
      boton.type = "button";
      boton.className = "control-accesibilidad control-accesibilidad-ampliado";
      boton.textContent = texto;
      boton.dataset.claveAccesibilidad = clave;
      boton.setAttribute("aria-pressed", "false");
      boton.title = descripcion;
      return boton;
    };

    const configuraciones = [
      {
        id: "boton-grises",
        texto: "Escala de grises",
        clave: CLAVES.grises,
        descripcion: "Reduce los colores de la página y muestra el contenido en escala de grises."
      },
      {
        id: "boton-fuente-legible",
        texto: "Fuente legible",
        clave: CLAVES.fuente,
        descripcion: "Usa una tipografía sencilla y uniforme para facilitar la lectura."
      },
      {
        id: "boton-espaciado",
        texto: "Mayor espaciado",
        clave: CLAVES.espaciado,
        descripcion: "Aumenta el espacio entre letras, palabras y líneas."
      },
      {
        id: "boton-enlaces",
        texto: "Resaltar enlaces",
        clave: CLAVES.enlaces,
        descripcion: "Subraya y refuerza visualmente los enlaces principales."
      },
      {
        id: "boton-movimiento",
        texto: "Reducir movimiento",
        clave: CLAVES.movimiento,
        descripcion: "Disminuye animaciones, transiciones y desplazamientos automáticos."
      }
    ];

    const botonRestablecer = panel.querySelector("#boton-restablecer");
    const botonesNuevos = configuraciones.map((configuracion) => {
      const boton = crearBoton(configuracion);
      panel.insertBefore(boton, botonRestablecer || null);
      return boton;
    });

    const botonLectura = document.createElement("button");
    botonLectura.id = "boton-lectura";
    botonLectura.type = "button";
    botonLectura.className = "control-accesibilidad control-accesibilidad-ampliado";
    botonLectura.textContent = "Leer página";
    botonLectura.setAttribute("aria-pressed", "false");
    botonLectura.title = "Lee en voz alta el contenido principal de la página.";
    panel.insertBefore(botonLectura, botonRestablecer || null);

    const estado = document.createElement("p");
    estado.className = "estado-accesibilidad";
    estado.setAttribute("role", "status");
    estado.setAttribute("aria-live", "polite");
    estado.textContent = "Opciones listas para usar.";
    panel.appendChild(estado);

    const botonRapido = document.createElement("button");
    botonRapido.type = "button";
    botonRapido.className = "acceso-rapido-accesibilidad";
    botonRapido.setAttribute("aria-label", "Ir a las opciones de accesibilidad");
    botonRapido.textContent = "Accesibilidad";
    body.appendChild(botonRapido);

    const anunciar = (mensaje) => {
      estado.textContent = "";
      window.setTimeout(() => {
        estado.textContent = mensaje;
      }, 30);
    };

    const actualizarBoton = (boton, activo) => {
      if (!boton) return;
      boton.setAttribute("aria-pressed", activo ? "true" : "false");
    };

    const aplicarPreferenciasAmpliadas = () => {
      const preferencias = {
        grises: estaActivo(CLAVES.grises),
        fuente: estaActivo(CLAVES.fuente),
        espaciado: estaActivo(CLAVES.espaciado),
        enlaces: estaActivo(CLAVES.enlaces),
        movimiento: estaActivo(CLAVES.movimiento)
      };

      body.classList.toggle("escala-grises", preferencias.grises);
      body.classList.toggle("fuente-legible", preferencias.fuente);
      body.classList.toggle("espaciado-amplio", preferencias.espaciado);
      body.classList.toggle("enlaces-resaltados", preferencias.enlaces);
      body.classList.toggle("movimiento-reducido", preferencias.movimiento);

      configuraciones.forEach((configuracion) => {
        const boton = document.getElementById(configuracion.id);
        actualizarBoton(boton, estaActivo(configuracion.clave));
      });
    };

    botonesNuevos.forEach((boton) => {
      boton.addEventListener("click", () => {
        const clave = boton.dataset.claveAccesibilidad;
        const activar = !estaActivo(clave);
        localStorage.setItem(clave, activar ? "activo" : "inactivo");
        aplicarPreferenciasAmpliadas();
        anunciar(`${boton.textContent}: ${activar ? "activado" : "desactivado"}.`);
      });
    });

    if (!localStorage.getItem(CLAVES.movimiento) && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      localStorage.setItem(CLAVES.movimiento, "activo");
    }

    let lecturaActiva = false;
    let fragmentosLectura = [];
    let indiceLectura = 0;

    const detenerLectura = (anunciarDetencion = true) => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      lecturaActiva = false;
      fragmentosLectura = [];
      indiceLectura = 0;
      botonLectura.textContent = "Leer página";
      botonLectura.setAttribute("aria-pressed", "false");
      if (anunciarDetencion) anunciar("Lectura en voz alta detenida.");
    };

    const dividirTexto = (texto, limite = 220) => {
      const oraciones = texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [texto];
      const fragmentos = [];
      let actual = "";

      oraciones.forEach((oracion) => {
        const limpia = oracion.replace(/\s+/g, " ").trim();
        if (!limpia) return;

        if (`${actual} ${limpia}`.trim().length <= limite) {
          actual = `${actual} ${limpia}`.trim();
        } else {
          if (actual) fragmentos.push(actual);
          actual = limpia;
        }
      });

      if (actual) fragmentos.push(actual);
      return fragmentos;
    };

    const obtenerTextoPrincipal = () => {
      if (!main) return "";
      const copia = main.cloneNode(true);
      copia.querySelectorAll(
        "script, style, noscript, [aria-hidden='true'], button, input, .sugerencias-busqueda, .noticias-indicadores"
      ).forEach((elemento) => elemento.remove());
      return copia.textContent.replace(/\s+/g, " ").trim();
    };

    const reproducirSiguiente = () => {
      if (!lecturaActiva || indiceLectura >= fragmentosLectura.length) {
        detenerLectura(false);
        anunciar("Lectura en voz alta finalizada.");
        return;
      }

      const mensaje = new SpeechSynthesisUtterance(fragmentosLectura[indiceLectura]);
      mensaje.lang = "es-PE";
      mensaje.rate = 0.95;
      mensaje.pitch = 1;
      mensaje.onend = () => {
        indiceLectura += 1;
        reproducirSiguiente();
      };
      mensaje.onerror = () => {
        detenerLectura(false);
        anunciar("No fue posible continuar la lectura en voz alta.");
      };
      window.speechSynthesis.speak(mensaje);
    };

    if (!("speechSynthesis" in window)) {
      botonLectura.disabled = true;
      botonLectura.title = "La lectura en voz alta no está disponible en este navegador.";
    } else {
      botonLectura.addEventListener("click", () => {
        if (lecturaActiva) {
          detenerLectura();
          return;
        }

        const texto = obtenerTextoPrincipal();
        if (!texto) {
          anunciar("No se encontró contenido para leer.");
          return;
        }

        window.speechSynthesis.cancel();
        fragmentosLectura = dividirTexto(texto);
        indiceLectura = 0;
        lecturaActiva = true;
        botonLectura.textContent = "Detener lectura";
        botonLectura.setAttribute("aria-pressed", "true");
        anunciar("Lectura en voz alta iniciada.");
        reproducirSiguiente();
      });
    }

    if (botonRestablecer) {
      botonRestablecer.addEventListener("click", () => {
        Object.values(CLAVES).forEach((clave) => localStorage.removeItem(clave));
        detenerLectura(false);
        aplicarPreferenciasAmpliadas();
        anunciar("Se restablecieron todas las opciones de accesibilidad.");
      });
    }

    botonRapido.addEventListener("click", () => {
      const reducirMovimiento = body.classList.contains("movimiento-reducido");
      panel.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => {
        const primerControl = panel.querySelector("button");
        primerControl?.focus({ preventScroll: true });
      }, reducirMovimiento ? 0 : 350);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.altKey && evento.shiftKey && evento.key.toLowerCase() === "a") {
        evento.preventDefault();
        botonRapido.click();
      }

      if (evento.key === "Escape" && lecturaActiva) detenerLectura();
    });

    aplicarPreferenciasAmpliadas();
  });
})();
