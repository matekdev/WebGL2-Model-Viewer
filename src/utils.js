export function GetGLContext(canvas) {
    return canvas.getContext('webgl2') || console.error('WebGL2 is not available in your browser.');
}

export function AutoResizeCanvas(canvas) {
    const expandFullScreen = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    expandFullScreen();
    window.addEventListener('resize', expandFullScreen);
}
