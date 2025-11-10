// Motor de Contenido Multilenguaje
document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. DETECCIÓN DE IDIOMA ---
  const getLanguage = () => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (["es", "en", "zh-tw"].includes(lang)) {
      return lang; // 1. Prioridad: Parámetro URL (?lang=en)
    }
    // 2. Prioridad: Preferencia del Navegador
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh-tw") || browserLang.startsWith("zh-hant")) {
      return "zh-tw";
    }
    if (browserLang.startsWith("en")) {
      return "en";
    }
    // 3. Default: Español
    return "es";
  };

  const currentLang = getLanguage();
  
  // --- 2. IDENTIFICADOR DE PÁGINA ---
  // Obtenemos el ID de la página del tag <body> (ej. <body id="index">)
  const pageId = document.body.id;
  if (!pageId) {
    console.error("Error: La etiqueta <body> necesita un 'id' para identificar la página.");
    return;
  }

  // --- 3. FUNCIÓN DE "PINTAR" CONTENIDO ---
  const loadContent = (lang) => {
    // 3.1. Obtener los textos de la página actual
    const pageContent = content[lang][pageId];
    if (!pageContent) {
      console.error(`No se encontró contenido para la página '${pageId}' en el idioma '${lang}'.`);
      // Intentar cargar en español por si acaso
      if (lang !== 'es') loadContent('es');
      return;
    }

    // 3.2. Actualizar Título de la Página
    document.title = pageContent["page-title"] || "Para ad cogitantum";

    // 3.3. Rellenar todos los elementos con 'data-i18n'
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (pageContent[key]) {
        // Usamos innerHTML para renderizar negritas <b>, etc.
        el.innerHTML = pageContent[key];
      }
    });

    // 3.4. Rellenar el bloque de código del prompt (si existe)
    const promptCodeEl = document.getElementById("prompt-code");
    if (promptCodeEl && pageContent["prompt-code"]) {
      promptCodeEl.textContent = pageContent["prompt-code"];
    }
    
    // 3.5. Actualizar los botones del cambiador de idioma
    updateLangSwitcher(lang);
  };

  // --- 4. FUNCIÓN DEL CAMBIADOR DE IDIOMA ---
  const updateLangSwitcher = (lang) => {
    document.querySelectorAll(".lang-switcher a").forEach(el => {
      if (el.getAttribute("data-lang") === lang) {
        // Convierte el enlace activo en un <span> (no clickeable)
        const span = document.createElement("span");
        span.textContent = el.textContent;
        el.replaceWith(span);
      } else {
        // Asegura que los otros sean enlaces clickeables
        el.href = `?lang=${el.getAttribute("data-lang")}`;
      }
    });
  };

  // --- 5. FUNCIÓN DE COPIAR AL PORTAPAPELES ---
  const initClipboard = () => {
    const copyButton = document.getElementById("copy-button");
    const promptCode = document.getElementById("prompt-code");

    if (!copyButton || !promptCode) return;

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(promptCode.textContent).then(() => {
        const originalText = copyButton.textContent;
        const successText = content[currentLang][pageId]["copy-success"] || "Copied!";
        copyButton.textContent = successText;
        copyButton.classList.add("copied");

        setTimeout(() => {
          copyButton.textContent = originalText;
          copyButton.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Error al copiar:", err);
      });
    });
  };

  // --- EJECUTAR TODO ---
  loadContent(currentLang);
  initClipboard();
});
