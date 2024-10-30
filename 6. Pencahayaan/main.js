function main(){
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    quad(1, 2, 3, 0); // Kubus depan
    quad(2, 6, 7, 3); // Kubus kanan
    quad(3, 7, 4, 0); // Kubus atas
    quad(4, 5, 1, 0); // Kubus kiri
    quad(5, 4, 7, 6); // Kubus belakang
    quad(6, 2, 1, 5); // Kubus bawah

    //vertex buffer
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
        varying vec3 vPosition;
        varying vec3 vColor;
        varying vec3 vNormal;
        uniform vec3 uAmbientColor;
        uniform float uAmbientIntensity;
        uniform vec3 uDiffuseColor;
        uniform vec3 uDiffusePosition;
        uniform mat3 uNormal;  // Sebagai model matrix-nya vektor normal
        uniform vec3 uViewerPosition;
        void main() {
            // Vektor cahaya = titik sumber cahaya - titik verteks
            vec3 lightPos = uDiffusePosition;
            vec3 vlight = normalize(lightPos - vPosition);
            vec3 normalizedNormal = normalize(uNormal * vNormal);

            vec3 ambient = vColor * uAmbientColor * uAmbientIntensity;

            float cosTheta = dot(normalizedNormal, vlight);
            vec3 diffuse = vec3(0., 0., 0.);
            if (cosTheta > 0.) {
                float diffuseIntensity = cosTheta;
                diffuse = vColor * uDiffuseColor * diffuseIntensity;
            }
            vec3 reflector = reflect(-vlight, normalizedNormal);
            vec3 normalizedReflector = normalize(reflector);
            vec3 normalizedViewer = normalize(uViewerPosition - vPosition);
            float cosPhi = dot(normalizedReflector, normalizedViewer);
            vec3 specular = vec3(0., 0., 0.);
            if (cosPhi > 0.) {
                float shininessConstant = 100.0; 
                float specularIntensity = pow(cosPhi, shininessConstant); 
                specular = vColor * uDiffuseColor * specularIntensity;
            }
            vec3 phong = ambient + diffuse + specular;
            gl_FragColor = vec4(phong, 1.0);
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

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var aPosition = gl.getAttribLocation(program, "aPosition");
    var aColor = gl.getAttribLocation(program, "aColor");
    var aNormal = gl.getAttribLocation(program, "aNormal");
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
    var camera = [0, 0, 2];
    glMatrix.mat4.lookAt(view,
        camera, // di mana posisi kamera (posisi)
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
    var uModel = gl.getUniformLocation(program, 'uModel');
    var uView = gl.getUniformLocation(program, 'uView');
    var uProjection = gl.getUniformLocation(program, 'uProjection');

    var uAmbientColor = gl.getUniformLocation(program, 'uAmbientColor');
    gl.uniform3fv(uAmbientColor, [0.1, 0.1, 0.1]);
    var uAmbientIntensity = gl.getUniformLocation(program, 'uAmbientIntensity');
    gl.uniform1f(uAmbientIntensity, 0.3); //30%
    var uDiffuseColor = gl.getUniformLocation(program, 'uDiffuseColor');
    gl.uniform3fv(uDiffuseColor, [1.0, 1.0, 1.0]);
    var uDiffusePosition = gl.getUniformLocation(program, 'uDiffusePosition');
    gl.uniform3fv(uDiffusePosition, [0.0, 0.8, 1.0]);
    var uNormal = gl.getUniformLocation(program, 'uNormal');

    var uViewerPosition = gl.getUniformLocation(program, "uViewerPosition");
    gl.uniform3fv(uViewerPosition, camera);

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