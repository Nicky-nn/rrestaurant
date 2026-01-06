import { useEffect } from 'react';

/**
 * Función para aplicar estilos de dark mode
 */
export const applyDarkMode = () => {
    const existingStyle = document.getElementById("dark-mode-toggle");
    if (existingStyle) existingStyle.remove();

    const drkMo = document.createElement("style");
    drkMo.id = "dark-mode-toggle";
    drkMo.innerText = `
html {color-scheme:dark!important;color:#000}
html * {color-scheme:light!important;text-shadow:0 0 .1px}
html body {background:none!important}
html, html :is(i, img, image, embed, video, canvas, option, object, :fullscreen:not(iframe), iframe:not(:fullscreen)),
html body>* [style*="url("]:not([style*="cursor:"]):not([type="text"]) {filter:invert(1)hue-rotate(180deg)!important}
html body>* [style*="url("]:not([style*="cursor;"]) :not(#a),
html:not(#a) :is(canvas, option, object) :is(i, img, image, embed, video),
html:not(#a) video:fullscreen{filter:unset!important}`;
    document.head.appendChild(drkMo);
};

/**
 * Función para remover estilos de dark mode (volver a light mode original)
 */
export const removeDarkMode = () => {
    const existingStyle = document.getElementById("dark-mode-toggle");
    if (existingStyle) existingStyle.remove();
};

/**
 * Determina qué modo visual aplicar según el modo configurado
 */
export const getModoEfectivo = (modo: "LIGHT" | "DARK" | "SYSTEM" | null): "LIGHT" | "DARK" => {
    if (modo === "SYSTEM" || modo === null) {
        const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "DARK" : "LIGHT";
    }
    return modo;
};

/**
 * Aplica estilos basado en el modo efectivo
 */
export const aplicarEstilosUxModo = (modo: "LIGHT" | "DARK" | "SYSTEM" | null) => {
    const modoEfectivo = getModoEfectivo(modo);

    if (modoEfectivo === "DARK") {
        applyDarkMode();
    } else {
        // LIGHT: no hacer nada, mantener estilos originales
        removeDarkMode();
    }
};

/**
 * Hook para aplicar el modo UX automáticamente
 */
export const useUxModo = (modo: "LIGHT" | "DARK" | "SYSTEM" | null) => {
    useEffect(() => {
        aplicarEstilosUxModo(modo);

        // Escuchar cambios en las preferencias del sistema solo si estamos en modo SYSTEM
        if (modo === "SYSTEM" || modo === null) {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                aplicarEstilosUxModo(modo);
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [modo]);
};
