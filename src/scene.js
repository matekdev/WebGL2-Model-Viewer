import { calculateNormals } from './utils.js';

export class Scene {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.objects = [];
    }

    get(alias) {
        return this.objects.find(object => object.alias === alias);
    }

    load(filename, alias, attributes) {
        const request = new XMLHttpRequest();
        request.open('GET', filename, false);
        request.send(null);
        if (request.status !== 200)
            return

        var mesh = new OBJ.Mesh(request.responseText);
        mesh.visible = true;
        mesh.alias = alias || mesh.alias;
        this.add(mesh, attributes);
    }

    add(object, attributes) {
        const { gl, program } = this;

        object.diffuse = object.diffuse || [1, 1, 1, 1];
        object.Kd = object.Kd || object.diffuse.slice(0, 3);

        object.ambient = object.ambient || [0.2, 0.2, 0.2, 1];
        object.Ka = object.Ka || object.ambient.slice(0, 3);

        object.specular = object.specular || [1, 1, 1, 1];
        object.Ks = object.Ks || object.specular.slice(0, 3);

        object.specularExponent = object.specularExponent || 0;
        object.Ns = object.Ns || object.specularExponent;

        object.d = object.d || 1;
        object.transparency = object.transparency || object.d;

        object.illum = object.illum || 1;

        object.wireframe = false;

        Object.assign(object, attributes);

        object.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

        object.vao = gl.createVertexArray();

        gl.bindVertexArray(object.vao);

        if (program.aVertexPosition >= 0) {
            const vertexBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(program.aVertexPosition);
            gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        }

        if (program.aVertexNormal >= 0) {
            const normalBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
                calculateNormals(object.vertices, object.indices)),
                gl.STATIC_DRAW
            );
            gl.enableVertexAttribArray(program.aVertexNormal);
            gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
        }

        if (object.scalars && program.aVertexColor >= 0) {
            const colorBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.scalars), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(program.aVertexColor);
            gl.vertexAttribPointer(program.aVertexColor, 4, gl.FLOAT, false, 0, 0);
        }

        if (object.image) {
            object.texture = new Texture(gl, object.image);
        }

        this.objects.push(object);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    remove(alias) {
        const object = this.get(alias);
        const index = this.objects.indexOf(object);
        this.objects.splice(index, 1);
    }
}