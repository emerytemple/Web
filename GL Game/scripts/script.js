"use strict";

function main() {
	var canvas = document.getElementById('webgl');
	if(!canvas)	{
		console.log('canvas failed');
		return;
	}

	var gl = canvas.getContext('webgl2');
	if(!gl) {
		console.log('gl not supported');
		return;
	}

	// glsl
	var vertCode = vertexShaderSource();
	var fragCode = fragmentShaderSource();

	var vertexShader = createShader(gl, vertCode, gl.VERTEX_SHADER);
	var fragmentShader = createShader(gl, fragCode, gl.FRAGMENT_SHADER);

	var shaderProgram = createProgram(gl, vertexShader, fragmentShader);

	// init
	var pos = gl.getAttribLocation(shaderProgram, "position");
	var res = gl.getUniformLocation(shaderProgram, "resolution");

	var vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	var vertices = [
		10, 20,
		80, 20,
		10, 30,
		10, 30,
		80, 20,
		80, 30,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// render
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 0.9);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(shaderProgram);
	gl.uniform2f(res, gl.canvas.width, gl.canvas.height);
	gl.enableVertexAttribArray(pos);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function vertexShaderSource() {
	return `
	
	attribute vec2 position; // given in pixels
	
	uniform vec2 resolution;

	void main(void) {
		vec2 clipSpace = ((position/resolution)*2.0)-1.0;
		gl_Position = vec4(clipSpace*vec2(1, -1),0.0, 1.0);
	}

	`;
}

function fragmentShaderSource() {
	return `
	
	precision mediump float;

	void main(void) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
	}

	`;
}

function createShader(gl, shaderSource, shaderType) {
	var shader = gl.createShader(shaderType);
	
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(!success) {
		console.log('shader compile error' + gl.getShaderInfoLog(shader));
	}
	
	return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	
	gl.linkProgram(program);

	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(!success) {
		console.log('program failed to link' + gl.getProgramInfoLog(program));
	}

	return program;
}
