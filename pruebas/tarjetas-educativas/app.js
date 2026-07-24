(() => {
  "use strict";

  const tarjetas = [
    {
      categoria: "Braille",
      tema: "braille",
      pregunta: "¿Cuántos puntos conforman la celda Braille?",
      respuesta: "La celda Braille está formada por seis puntos organizados en dos columnas de tres."
    },
    {
      categoria: "Braille",
      tema: "braille",
      pregunta: "¿Para qué se utiliza la regleta Braille?",
      respuesta: "Se utiliza para escribir Braille manualmente con ayuda de un punzón y una hoja de papel."
    },
    {
      categoria: "Accesibilidad",
      tema: "accesibilidad",
      pregunta: "¿Qué permite un enlace para saltar al contenido principal?",
      respuesta: "Permite que quienes navegan con teclado eviten bloques repetidos y lleguen directamente al contenido principal."
    },
    {
      categoria: "Accesibilidad",
      tema: "accesibilidad",
      pregunta: "¿Qué debe comunicar el texto alternativo de una imagen?",
      respuesta: "Debe expresar la información o función relevante de la imagen dentro del contexto donde aparece."
    },
    {
      categoria: "Inclusión educativa",
      tema: "inclusion",
      pregunta: "¿Qué busca el Diseño Universal para el Aprendizaje?",
      respuesta: "Busca ofrecer múltiples formas de participación, representación y acción para atender la diversidad del alumnado."
    },
    {
      categoria: "Inclusión educativa",
      tema: "inclusion",
      pregunta: "¿Qué es un ajuste razonable?",
      respuesta: "Es una modificación necesaria y adecuada que permite a una persona participar y aprender en igualdad de condiciones."
    }
  ];

  const elementos = {
    selector: document.querySelector("#selector-tema"),
    progreso: document.querySelector("#progreso"),
    categoria: document.querySelector("#categoria"),
    pregunta: document.querySelector("#pregunta"),
    respuesta: document.querySelector("#respuesta"),
    textoRespuesta: document.querySelector("#texto-respuesta"),
    estado: document.querySelector("#estado"),
    tarjeta: document.querySelector("#tarjeta"),
    anterior: document.querySelector("#anterior"),
    mostrar: document.querySelector("#mostrar"),
    siguiente: document.querySelector("#siguiente"),
    aleatoria: document.querySelector("#aleatoria"),
    reiniciar: document.querySelector("#reiniciar")
  };

  let tarjetasActivas = [...tarjetas];
  let indiceActual = 0;
  let respuestaVisible = false;

  const anunciar = (mensaje) => {
    elementos.estado.textContent = "";
    window.setTimeout(() => {
      elementos.estado.textContent = mensaje;
    }, 30);
  };

  const actualizarBotones = () => {
    const hayUna = tarjetasActivas.length <= 1;
    elementos.anterior.disabled = hayUna;
    elementos.siguiente.disabled = hayUna;
    elementos.aleatoria.disabled = hayUna;
  };

  const ocultarRespuesta = () => {
    respuestaVisible = false;
    elementos.respuesta.hidden = true;
    elementos.mostrar.textContent = "Mostrar respuesta";
    elementos.mostrar.setAttribute("aria-expanded", "false");
  };

  const mostrarTarjeta = ({ anunciarCambio = false } = {}) => {
    const tarjeta = tarjetasActivas[indiceActual];
    if (!tarjeta) return;

    ocultarRespuesta();
    elementos.categoria.textContent = tarjeta.categoria;
    elementos.pregunta.textContent = tarjeta.pregunta;
    elementos.textoRespuesta.textContent = tarjeta.respuesta;
    elementos.progreso.textContent = `Tarjeta ${indiceActual + 1} de ${tarjetasActivas.length}`;
    actualizarBotones();

    if (anunciarCambio) {
      anunciar(`Tarjeta ${indiceActual + 1} de ${tarjetasActivas.length}. ${tarjeta.pregunta}`);
    } else {
      anunciar("Pregunta lista.");
    }
  };

  const alternarRespuesta = () => {
    respuestaVisible = !respuestaVisible;
    elementos.respuesta.hidden = !respuestaVisible;
    elementos.mostrar.textContent = respuestaVisible ? "Ocultar respuesta" : "Mostrar respuesta";
    elementos.mostrar.setAttribute("aria-expanded", respuestaVisible ? "true" : "false");
    anunciar(respuestaVisible ? `Respuesta: ${elementos.textoRespuesta.textContent}` : "Respuesta ocultada.");
  };

  const mover = (direccion) => {
    indiceActual = (indiceActual + direccion + tarjetasActivas.length) % tarjetasActivas.length;
    mostrarTarjeta({ anunciarCambio: true });
  };

  elementos.anterior.addEventListener("click", () => mover(-1));
  elementos.siguiente.addEventListener("click", () => mover(1));
  elementos.mostrar.addEventListener("click", alternarRespuesta);

  elementos.aleatoria.addEventListener("click", () => {
    if (tarjetasActivas.length <= 1) return;
    let nuevoIndice = indiceActual;
    while (nuevoIndice === indiceActual) {
      nuevoIndice = Math.floor(Math.random() * tarjetasActivas.length);
    }
    indiceActual = nuevoIndice;
    mostrarTarjeta({ anunciarCambio: true });
  });

  elementos.reiniciar.addEventListener("click", () => {
    elementos.selector.value = "todos";
    tarjetasActivas = [...tarjetas];
    indiceActual = 0;
    mostrarTarjeta();
    elementos.tarjeta.focus();
    anunciar("Actividad reiniciada. Tarjeta 1 de 6.");
  });

  elementos.selector.addEventListener("change", () => {
    const tema = elementos.selector.value;
    tarjetasActivas = tema === "todos" ? [...tarjetas] : tarjetas.filter((tarjeta) => tarjeta.tema === tema);
    indiceActual = 0;
    mostrarTarjeta();
    anunciar(`Tema seleccionado. Se muestran ${tarjetasActivas.length} tarjetas.`);
  });

  elementos.tarjeta.addEventListener("keydown", (evento) => {
    if (evento.key === " " || evento.key === "Enter") {
      evento.preventDefault();
      alternarRespuesta();
    }
    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      mover(-1);
    }
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      mover(1);
    }
  });

  mostrarTarjeta();
})();
