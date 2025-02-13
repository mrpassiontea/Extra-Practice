export function disableScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    $("html, body").css({
        overflow: "hidden",
        height: "100%",
        position: "fixed",
        top: `-${scrollPosition}px`,
        width: "100%",
    });
}

export function enableScroll() {
    const scrollPosition = parseInt($("html").css("top")) * -1;

    $("html, body").css({
        overflow: "auto",
        height: "auto",
        position: "static",
        top: "auto",
        width: "auto",
    });

    window.scrollTo(0, scrollPosition);
}

// Cache for SVG content to avoid repeated fetches
const svgCache = new Map();

export async function loadSvgContent(url) {
    if (svgCache.has(url)) {
        return svgCache.get(url);
    }
    
    const response = await fetch(url);
    const svgContent = await response.text();
    svgCache.set(url, svgContent);
    return svgContent;
}