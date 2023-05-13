import * as vec3 from '/libs/glMatrix/vec3.js';
import * as vec4 from '/libs/glMatrix/vec4.js';
import * as mat4 from '/libs/glMatrix/mat4.js';

/**
 * Camera class with functions to change the perspective.
 */
export class Camera {

    constructor() {
        this.position = vec3.create();
        this.focus = vec3.create();
        this.home = vec3.create();

        this.up = vec3.create();
        this.right = vec3.create();
        this.normal = vec3.create();

        this.matrix = mat4.create();

        this.steps = 0;
        this.azimuth = 0;
        this.elevation = 0;
        this.fov = 45;
        this.minZ = 0.1;
        this.maxZ = 10000;
    }

    /**
     * Reset the camera to the given position. Sets the azimuth and elevation to be zero.
     * @param pos The position to reset to.
     */
    reset(pos) {
        if (pos) {
            this.pos = pos;
        }

        this.setPosition(this.pos);
        this.setAzimuth(0);
        this.setElevation(0);
    }

    /**
     * Zoom the camera in and out given the parameter.
     * @param stepIncrement The increment to zoom in/out.
    */
    zoom(stepIncrement) {
        const normal = vec3.create();
        const newPosition = vec3.create();
        vec3.normalize(normal, this.normal);

        const step = stepIncrement - this.steps;

        newPosition[0] = this.position[0];
        newPosition[1] = this.position[1];
        newPosition[2] = this.position[2] - step;

        this.steps = step;
        this.setPosition(newPosition);
    }

    /**
     * Set the position of the camera.
     * @param position The position to set the camera to.
    */
    setPosition(position) {
        vec3.copy(this.position, position);
        this.update();
    }

    setAzimuth(azimuth) {
        this.changeAzimuth(azimuth - this.azimuth);
    }

    changeAzimuth(azimuth) {
        this.azimuth += azimuth;

        if (this.azimuth > 360 || this.azimuth < -360) {
            this.azimuth = this.azimuth % 360;
        }

        this.update();
    }

    setElevation(elevation) {
        this.changeElevation(elevation - this.elevation);
    }

    changeElevation(elevation) {
        this.elevation += elevation;

        if (this.elevation > 360 || this.elevation < -360) {
            this.elevation = this.elevation % 360;
        }

        this.update();
    }

    calculateOrientation() {
        const right = vec4.create();
        vec4.set(right, 1, 0, 0, 0);
        vec4.transformMat4(right, right, this.matrix);
        vec3.copy(this.right, right);

        const up = vec4.create();
        vec4.set(up, 0, 1, 0, 0);
        vec4.transformMat4(up, up, this.matrix);
        vec3.copy(this.up, up);

        const normal = vec4.create();
        vec4.set(normal, 0, 0, 1, 0);
        vec4.transformMat4(normal, normal, this.matrix);
        vec3.copy(this.normal, normal);
    }

    update() {
        mat4.identity(this.matrix);

        mat4.rotateY(this.matrix, this.matrix, this.azimuth * Math.PI / 180);
        mat4.rotateX(this.matrix, this.matrix, this.elevation * Math.PI / 180);
        mat4.translate(this.matrix, this.matrix, this.position);

        this.calculateOrientation();
    }

    getViewTransform() {
        const matrix = mat4.create();
        mat4.invert(matrix, this.matrix);
        return matrix;
    }
}
