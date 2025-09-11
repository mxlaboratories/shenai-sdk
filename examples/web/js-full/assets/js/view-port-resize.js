// ensure canvas resolution on mobile devices
// for more information see: https://developer.shen.ai/getting-started/initialization#providing-the-user-interface
function setFullViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}

export function ensureCanvasResolution() {
    if (/Android/.test(navigator.userAgent) && /Chrome\/\d+/.test(navigator.userAgent)) {
        window.addEventListener("resize", setFullViewportHeight);
        document.addEventListener("DOMContentLoaded", setFullViewportHeight);
    }
}
