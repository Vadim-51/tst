/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var wallLength = function (x1, y1, x2, y2) {

    var length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    length = parseFloat(length.toFixed(1));

    return length;
};

var getWallMesh = function (wall) {
    if ('mesh' in wall)
        return wall.mesh;
};

var recrateWallMesh = function (wall) {

    var x1 = wall.A.x;
    var y1 = wall.A.y;
    var x2 = wall.B.x;
    var y2 = wall.B.y;

    var position = new THREE.Vector3(((x1 + x2) / 2), ((y1 + y2) / 2), 0);
    var angle = angleRadians(x1, y1, x2, y2);
    var geometry = new THREE.BoxGeometry(wallLength(x1, y1, x2, y2), wall.height, wall.depth);
    var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    var cube = new THREE.Mesh(geometry, material);
    cube.rotation.x = Math.PI / 2;
    cube.rotation.y = angle;
    cube.position.copy(position);
    cube.description = 'wall';
    cube.name = wall.name;
    wall.width = wallLength(x1, y1, x2, y2);
    wall.length = wall.width - wall.depth;
    wall.mesh = cube;

    var dir = cube.getWorldDirection().multiplyScalar(wall.depth / 2);

    cube.position.sub(dir);
    cube.position.z = wall.height / 2; //properly position wall on floor

    return cube;
};

var getDirection = function (a, b) {
    b = new THREE.Vector3(b.x, b.y, 0);
    a = new THREE.Vector3(a.x, a.y, 0);
    return b.sub(a)
           .normalize()
           .applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-90));
};

var createTouchPoint = function (wall,prevWall) {
    var wallMesh = wall.mesh;
    var prevWallMesh = prevWall.mesh;
    var radius = 9;
    var circle = new THREE.CircleBufferGeometry(radius, 32);
    var mesh = new THREE.Mesh(circle, new THREE.MeshBasicMaterial({ color: 0x000000 }));

    var dir1 = getDirection(wall.A, wall.B);
    var dir2 = getDirection(prevWall.A, prevWall.B);
    var sum = dir1.add(dir2)
             .normalize()           
             .multiplyScalar(wall.depth / 2);

    mesh.position.x = wall.A.x;
    mesh.position.y = wall.A.y;

    mesh.position.sub(sum);

    mesh.position.z = wall.height + 1;

    mesh.currentWallName = wall.name;
    mesh.description = 'point';
    wall.touchPoint = mesh;
    return mesh;
};

var createFloor2D = function () {
    var points = [];
    Apartment.apart.wallCollection.forEach(function (item) {
        points.push(new THREE.Vector2(item.A.x, item.A.y));
    });

    var californiaShape = new THREE.Shape(points);
    var geometry = new THREE.ShapeGeometry(californiaShape);
    var material = new THREE.MeshBasicMaterial({ color: 0x83acf2, opacity: 1 });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 1;
    mesh.floor = true;
    mesh.name = 'floor';
    return mesh;
};
