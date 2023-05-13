import { autoResizeCanvas, getGLContext, loadModel } from './utils.js';
import { Program } from './program.js';

const canvas = document.getElementById('webgl-canvas');
autoResizeCanvas(canvas);

// Init program
const gl = getGLContext(canvas);
gl.clearColor(0.2, 0.2, 0.2, 1);
gl.clearDepth(1);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const program = new Program(gl, 'vertex-shader', 'fragment-shader');
program.load(['aVertexPosition'], []);

// Init buffers (temp)
var modelData = loadModel("/models/ball");
const vertices = modelData.vertices;
const indices = modelData.indices;

const VAO = gl.createVertexArray();
gl.bindVertexArray(VAO);

// Vertex buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(program.aVertexPosition);

// Index buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

gl.bindVertexArray(null);

Draw();

function Draw() {
    requestAnimationFrame(Draw);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}