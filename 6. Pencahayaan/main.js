function main(){
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    quad(1, 2, 3, 0); // Kubus depan
    quad(2, 6, 7, 3); // Kubus kanan
    quad(3, 7, 4, 0); // Kubus atas
    quad(4, 5, 1, 0); // Kubus kiri
    quad(5, 4, 7, 6); // Kubus belakang
    quad(6, 2, 1, 5); // Kubus bawah

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //normal buffer
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);

    var vertexShaderCode = document.getElementById("vertexShaderCode").text;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    var fragmentShaderCode = `
        precision mediump float;
        varying vec3 v_Position;
        varying vec3 v_Color;
        varying vec3 v_Normal;
        uniform vec3 u_AmbientColor;
        uniform vec3 u_DiffuseColor;
        uniform vec3 u_DiffusePosition;
        void main() {
            // Vektor cahaya = titik sumber cahaya - titik verteks
            vec3 lightPos = u_DiffusePosition;
            vec3 v_light = normalize(lightPos - v_Position);
            float dotNL = max(dot(v_Normal, v_light), 0.0);
            vec3 diffuse = v_Color * u_DiffuseColor * dotNL;
            vec3 ambient = v_Color * u_AmbientColor;
            gl_FragColor = vec4(ambient + diffuse, 1.0);
        }
    `;

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);    

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var aPosition = gl.getAttribLocation(shaderProgram, "a_Position");
    var aColor = gl.getAttribLocation(shaderProgram, "a_Color");
    var aNormal = gl.getAttribLocation(shaderProgram, "a_Normal");
    gl.vertexAttribPointer(
        aPosition, 
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        0);
    gl.vertexAttribPointer(
        aColor, 
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        3 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(
        aNormal, 
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        6 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);
    gl.enableVertexAttribArray(aNormal);

    gl.viewport(100, 0, canvas.height, canvas.height);
    gl.enable(gl.DEPTH_TEST);

    var primitive = gl.TRIANGLES;
    var offset = 0;
    var count = 36;  // Jumlah verteks yang akan digambar

    var model = glMatrix.mat4.create();
    var view = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(view,
        [0.0, 0.0, 2.0], // di mana posisi kamera (posisi)
        [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
        [0.0, 1.0, 0.0] // ke mana arah atas kamera (vektor)
        );
    var projection = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projection, 
        glMatrix.glMatrix.toRadian(90), // fov dalam radian
        1.0,  // rasio aspek
        0.5,  // near
        10.0  // far
        );
    var uModel = gl.getUniformLocation(shaderProgram, 'u_Model');
    var uView = gl.getUniformLocation(shaderProgram, 'u_View');
    var uProjection = gl.getUniformLocation(shaderProgram, 'u_Projection');

    var uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_AmbientColor');
    gl.uniform3fv(uAmbientColor, [0.1, 0.1, 0.1]);
    var uDiffuseColor = gl.getUniformLocation(shaderProgram, 'u_DiffuseColor');
    gl.uniform3fv(uDiffuseColor, [0.9, 0.9, 0.9]);
    var uDiffusePosition = gl.getUniformLocation(shaderProgram, 'u_DiffusePosition');
    gl.uniform3fv(uDiffusePosition, [0.0, 0.0, 1.0]);
    var uNormal = gl.getUniformLocation(shaderProgram, 'u_Normal');

    var theta = glMatrix.glMatrix.toRadian(1); // 1 derajat
    function render() {
        if(!freeze){
            glMatrix.mat4.rotate(model, model, theta, [1.0, 1.0, 1.0]);
        }
        
        gl.uniformMatrix4fv(uModel, false, model);
        gl.uniformMatrix4fv(uView, false, view);
        gl.uniformMatrix4fv(uProjection, false, projection);
        var normal = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normal, model);
        gl.uniformMatrix3fv(uNormal, false, normal);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitive, offset, count);
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);    
}