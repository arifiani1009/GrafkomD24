function main(){
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    var vertices = [
        -0.5, 0.0,   //titik A
        0.5, 0.0,  //titik B
        0.0 , 0.8//,   //titik C
        // 0.5, 0.0   //titik D //dicomment biar jadi 3 titik
    ];

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var vertexShaderCode = `
        attribute vec2 aPosition;
        void main(){
            gl_Position = vec4(aPosition, 0.0, 1.0);
            gl_PointSize = 10.0;
        }
    `;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    var fragmentShaderCode = `
        void main(){
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    `;

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);    

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var aPos = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //gl.drawArrays(gl.LINES, 0, 4);
    //gl.drawArrays(gl.LINE_STRIP, 0, 4);
    //gl.drawArrays(gl.LINE_LOOP, 0, 4);
    //gl.drawArrays(gl.TRIANGLES, 0, 6);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
