import * as mat4 from '/libs/glMatrix/mat4.js';
import { autoResizeCanvas, getGLContext } from './utils.js';
import { Program } from './program.js';
import { Clock } from './clock.js';
import { Floor } from './floor.js';
import { Camera } from './camera.js';
import { Controls } from './controls.js';
import { Scene } from './scene.js';

let
    gl, scene, program, camera, clock,
    modelViewMatrix = mat4.create(),
    projectionMatrix = mat4.create(),
    normalMatrix = mat4.create();

main();

function init() {
    const canvas = document.getElementById('webgl-canvas');
    autoResizeCanvas(canvas);

    gl = getGLContext(canvas);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    clock = new Clock();

    program = new Program(gl, 'vertex-shader', 'fragment-shader');

    const uniforms = [
        'uProjectionMatrix',
        'uModelViewMatrix',
        'uNormalMatrix',
        'uMaterialDiffuse',
        'uLightAmbient',
        'uLightDiffuse',
        'uLightPosition',
        'uWireframe'
    ];

    const attributes = [
        'aVertexPosition',
        'aVertexNormal',
        'aVertexColor'
    ];

    program.load(attributes, uniforms);

    scene = new Scene(gl, program);

    camera = new Camera(Camera.TRACKING_TYPE);
    camera.reset([0, 2, 50]);

    new Controls(camera, canvas);

    gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
    gl.uniform4fv(program.uLightAmbient, [0.20, 0.20, 0.20, 1]);
    gl.uniform4fv(program.uLightDiffuse, [1, 1, 1, 1]);

    modelViewMatrix = camera.getViewTransform();
    mat4.identity(projectionMatrix);
    updateTransforms();
    mat4.identity(normalMatrix);
    mat4.copy(normalMatrix, modelViewMatrix);
    mat4.invert(normalMatrix, normalMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
}

function updateTransforms() {
    mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), gl.canvas.width / gl.canvas.height, 0.1, 1000);
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(program.uModelViewMatrix, false, camera.getViewTransform());
    gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
    mat4.transpose(normalMatrix, camera.matrix);
    gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);
}

function loadModels() {
    scene.add(new Floor(80, 2));
    scene.load('/models/ball.json', 'ball');
}

function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    try {
        updateTransforms();
        setMatrixUniforms();

        scene.traverse(object => {
            gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
            gl.uniform1i(program.uWireframe, object.wireframe);

            gl.bindVertexArray(object.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

            if (object.wireframe)
                gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
            else
                gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        });
    }
    catch (error) {
        console.error(error);
    }
}

function main() {
    init();
    loadModels();
    clock.on('tick', draw);
}