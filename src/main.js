import { AutoResizeCanvas, GetGLContext } from './utils.js';
import { Program } from './program.js';

const canvas = document.getElementById('webgl-canvas');
AutoResizeCanvas(canvas);

// Init program
const gl = GetGLContext(canvas);
gl.clearColor(0.2, 0.2, 0.2, 1);
gl.clearDepth(1);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const program = new Program(gl, 'vertex-shader', 'fragment-shader');
program.Load(['aVertexPosition'], []);

// Init buffers (temp)
const vertices = [
    1.5, 0, 0,
    -1.5, 1, 0,
    -1.5, 0.809017, 0.587785,
    -1.5, 0.309017, 0.951057,
    -1.5, -0.309017, 0.951057,
    -1.5, -0.809017, 0.587785,
    -1.5, -1, 0,
    -1.5, -0.809017, -0.587785,
    -1.5, -0.309017, -0.951057,
    -1.5, 0.309017, -0.951057,
    -1.5, 0.809017, -0.587785
];

const indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 7,
    0, 7, 8,
    0, 8, 9,
    0, 9, 10,
    0, 10, 1
];

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

setInterval(function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(VAO);
    gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}, 100);