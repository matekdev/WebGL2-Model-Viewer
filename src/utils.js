/**
 * Returns the GL context of a given canvas, will log an error
 * if WebGL2 is not available on the given browser.
 * @param canvas The canvas to fetch the GL context from.
 * @returns an instance of the GL context WebGL2RenderingContext.
 */
export function GetGLContext(canvas) {
    return canvas.getContext('webgl2') || console.error('WebGL2 is not available in your browser.');
}

/**
 * Automatically resizes a given canvas to the height and width
 * of the current window.
 * @param canvas The canvas to resize.
 */
export function AutoResizeCanvas(canvas) {
    const expandFullScreen = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    expandFullScreen();
    window.addEventListener('resize', expandFullScreen);
}
