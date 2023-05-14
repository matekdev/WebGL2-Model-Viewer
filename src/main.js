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
    lightPosition = [0, 100, 100],
    backgroundColor = [0.8, 0.8, 0.8, 1],
    modelViewMatrix = mat4.create(),
    projectionMatrix = mat4.create(),
    normalMatrix = mat4.create();

main();

function init() {
    const canvas = document.getElementById('webgl-canvas');
    autoResizeCanvas(canvas);

    gl = getGLContext(canvas);
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
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
    camera.reset();

    new Controls(camera, canvas);

    gl.uniform3fv(program.uLightPosition, lightPosition);
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

function initUI() {
    const pane = new Tweakpane.Pane();

    // Wireframe
    const wireframe = pane.addInput({ wireframe: scene.get('model').wireframe, }, 'wireframe');
    wireframe.on('change', function (ev) { scene.get('model').wireframe = ev.value });

    // Model Color
    const color = pane.addInput({ color: { r: scene.get('model').diffuse[0], g: scene.get('model').diffuse[1], b: scene.get('model').diffuse[2] } }, 'color', { color: { type: 'float' } });
    color.on('change', function (ev) { scene.get('model').diffuse = [ev.value.r, ev.value.g, ev.value.b, 1.0]; });

    // Background Color
    const bgColor = pane.addInput({ bgColor: { r: backgroundColor[0], g: backgroundColor[1], b: backgroundColor[2] } }, 'bgColor', { color: { type: 'float' } });
    bgColor.on('change', function (ev) { backgroundColor = [ev.value.r, ev.value.g, ev.value.b, 1.0]; });

    // Camera offsets
    const offset = pane.addFolder({ title: 'Offset', expanded: true, });
    const x = offset.addInput({ x: camera.position[0] }, 'x', { min: -100, max: 100, step: 1 });
    x.on('change', function (ev) { camera.setPosition([ev.value, camera.position[1], camera.position[2]]); });
    const y = offset.addInput({ y: camera.position[1] }, 'y', { min: -100, max: 100, step: 1 });
    y.on('change', function (ev) { camera.setPosition([camera.position[0], ev.value, camera.position[2]]); });

    const resetButton = offset.addButton({ title: 'Reset Camera' });
    resetButton.on('click', () => { camera.reset(); pane.dispose(); initUI(); });

    // Lighting
    const lighting = pane.addFolder({ title: 'Lighting', expanded: true, });
    const lightingX = lighting.addInput({ x: lightPosition[0] }, 'x', { min: -100, max: 100, step: 1 });
    lightingX.on('change', function (ev) { lightPosition[0] = ev.value; });
    const lightingY = lighting.addInput({ y: lightPosition[1] }, 'y', { min: -100, max: 100, step: 1 });
    lightingY.on('change', function (ev) { lightPosition[1] = ev.value; });
    const lightingZ = lighting.addInput({ z: lightPosition[1] }, 'z', { min: -100, max: 100, step: 1 });
    lightingZ.on('change', function (ev) { lightPosition[2] = ev.value; });
}

function loadModels() {
    scene.add(new Floor(80, 2), 'floor');
    scene.load('/models/teapot.obj', 'model');
}

function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(program.uLightPosition, lightPosition);

    try {
        updateTransforms();
        setMatrixUniforms();

        scene.traverse(object => {
            gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
            gl.uniform1i(program.uWireframe, object.wireframe);

            gl.bindVertexArray(object.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

            if (object.wireframe || object.alias == 'floor')
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
    initUI();
    clock.on('tick', draw);
}
