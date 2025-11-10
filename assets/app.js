document.addEventListener("DOMContentLoaded", () => {
  let pageContent; // Esta variable será rellenada por el script que carguemos

  // --- 1. DETECCIÓN DE IDIOMA ---
  const getLanguage = () => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (["es", "en", "zh-tw"].includes(lang)) return lang;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh-tw") || browserLang.startsWith("zh-hant")) return "zh-tw";
    if (browserLang.startsWith("en")) return "en";
    return "es"; // Default
  };

  // --- 2. IDENTIFICADOR DE PÁGINA ---
  const pageId = document.body.id;
  if (!pageId) {
    console.error("Error: La etiqueta <body> necesita un 'id' para identificar la página.");
    return;
  }
  
  const currentLang = getLanguage();

  // --- 3. FUNCIÓN DE "PINTAR" CONTENIDO ---
  const paintPage = () => {
    if (!pageContent) {
      console.error("Error: El objeto 'pageContent' no está definido.");
      return;
    }

    // 3.1. Actualizar Título
    document.title = pageContent["page-title"] || "Para ad cogitantum";

    // 3.2. Rellenar todos los elementos 'data-i18n'
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (pageContent[key]) {
        el.innerHTML = pageContent[key];
      }
    });

    // 3.3. Rellenar el bloque de código del prompt
    const promptCodeEl = document.getElementById("prompt-code");
    if (promptCodeEl && pageContent["prompt-code"]) {
      promptCodeEl.textContent = pageContent["prompt-code"];
    }
  };

  // --- 4. FUNCIÓN DEL CAMBIADOR DE IDIOMA ---
  const updateLangSwitcher = (lang) => {
    document.querySelectorAll(".lang-switcher a").forEach(el => {
      if (el.getAttribute("data-lang") === lang) {
        const span = document.createElement("span");
        span.textContent = el.textContent;
        el.replaceWith(span);
      } else {
        el.href = `?lang=${el.getAttribute("data-lang")}`;
      }
    });
  };

  // --- 5. FUNCIÓN DE COPIAR ---
  const initClipboard = () => {
    const copyButton = document.getElementById("copy-button");
    const promptCode = document.getElementById("prompt-code");
    if (!copyButton || !promptCode) return;

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(promptCode.textContent).then(() => {
        const originalText = copyButton.textContent;
        // Obtenemos el texto de éxito desde pageContent
        const successText = (pageContent && pageContent["copy-success"]) ? pageContent["copy-success"] : "Copied!";
        copyButton.textContent = successText;
        copyButton.classList.add("copied");

        // Obtenemos el texto original desde pageContent
        const originalButtonText = (pageContent && pageContent["copy-button"]) ? pageContent["copy-button"] : "Copy Prompt";
        setTimeout(() => {
          copyButton.textContent = originalButtonText;
          copyButton.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Error al copiar:", err);
      });
    });
  };

  // --- 6. LÓGICA DE CARGA DINÁMICA ---
  const loadContentScript = (lang) => {
    const script = document.createElement("script");
    script.src = `assets/content/${pageId}.${lang}.js`; // Ej: assets/content/index.es.js
    
    script.onload = () => {
      // 'pageContent' ha sido definido por el script cargado
      paintPage();
      initClipboard();
    };
    
    script.onerror = () => {
      console.error(`Error al cargar ${script.src}.`);
      if (lang !== 'es') {
        console.warn("Intentando cargar 'es' como fallback.");
        loadContentScript('es');
      } else {
        // Fallback final si 'es' también falla
        document.body.innerHTML = "<h1>Error: No se pudo cargar el contenido.</h1>";
      }
    };
    
    document.head.appendChild(script);
  };

  // --- EJECUTAR TODO ---
  updateLangSwitcher(currentLang);
  loadContentScript(currentLang);
});
