import * as mat4 from './libs/glMatrix/mat4.js';
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
program.load(['aVertexPosition'], ['uModelViewMatrix', 'uProjectionMatrix']);

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

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

draw();

function draw() {
    requestAnimationFrame(draw);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), gl.canvas.width / gl.canvas.height, 10, 10000);
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -10]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, 30 * Math.PI / 180, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, 30 * Math.PI / 180, [0, 1, 0]);

    gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}