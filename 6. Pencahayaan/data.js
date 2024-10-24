var vertices = [];

var cubePoints = [
    [-0.5,  0.5,  0.5],   // A, 0
    [-0.5, -0.5,  0.5],   // B, 1
    [ 0.5, -0.5,  0.5],   // C, 2 
    [ 0.5,  0.5,  0.5],   // D, 3
    [-0.5,  0.5, -0.5],   // E, 4
    [-0.5, -0.5, -0.5],   // F, 5
    [ 0.5, -0.5, -0.5],   // G, 6
    [ 0.5,  0.5, -0.5]    // H, 7 
];

var cubeColors = [
    [],
    [1.0, 0.0, 0.0],    // merah
    [0.0, 1.0, 0.0],    // hijau
    [0.0, 0.0, 1.0],    // biru
    [1.0, 1.0, 1.0],    // putih
    [1.0, 0.5, 0.0],    // oranye
    [1.0, 1.0, 0.0],    // kuning
    []
];

var cubeNormals = [
    [],
    [0.0, 0.0, 1.0],    // depan
    [1.0, 0.0, 0.0],    // kanan
    [0.0, 1.0, 0.0],    // atas
    [-1.0, 0.0, 0.0],    // kiri
    [0.0, 0.0, -1.0],    // belakang
    [0.0, -1.0, 0.0],    // bawah
    []
];

function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
        for (var j=0; j<3; j++) {
        vertices.push(cubePoints[indices[i]][j]);
        }
        for (var j=0; j<3; j++) {
        vertices.push(cubeColors[a][j]);
        }
        for (var j=0; j<3; j++) {
        vertices.push(cubeNormals[a][j]);
        }
    }
}