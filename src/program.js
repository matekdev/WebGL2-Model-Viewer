export class Program {

    constructor(gl, vertexShaderId, fragmentShaderId) {
        this.gl = gl;
        this.program = gl.createProgram();

        if (!(vertexShaderId && fragmentShaderId)) {
            return console.error('No shader IDs were provided');
        }

        gl.attachShader(this.program, this.#getShader(gl, vertexShaderId));
        gl.attachShader(this.program, this.#getShader(gl, fragmentShaderId));
        gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            return console.error('Could not initialize shaders.');
        }

        this.UseProgram();
    }

    UseProgram() {
        this.gl.useProgram(this.program);
    }

    Load(attributes, uniforms) {
        this.UseProgram();
        this.SetAttributeLocations(attributes);
        this.SetUniformLocations(uniforms);
    }

    SetAttributeLocations(attributes) {
        attributes.forEach(attribute => {
            this[attribute] = this.gl.getAttribLocation(this.program, attribute);
        });
    }

    SetUniformLocations(uniforms) {
        uniforms.forEach(uniform => {
            this[uniform] = this.gl.getUniformLocation(this.program, uniform);
        });
    }

    GetUniform(uniformLocation) {
        return this.gl.getUniform(this.program, uniformLocation);
    }

    #getShader(gl, id) {
        const script = document.getElementById(id);
        if (!script) {
            return null;
        }

        const shaderString = script.text.trim();

        let shader;
        if (script.type === 'x-shader/x-vertex') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else if (script.type === 'x-shader/x-fragment') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else {
            return null;
        }

        gl.shaderSource(shader, shaderString);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
}