import { AutoResizeCanvas, GetGLContext } from './utils.js';

const canvas = document.getElementById('webgl-canvas');
AutoResizeCanvas(canvas);

const gl = GetGLContext(canvas);
gl.clearColor(0.2, 0.2, 0.2, 1);
gl.clearDepth(100);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);