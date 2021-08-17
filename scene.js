"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  
    renderer: null,
    birdInitialPosition: null,
    centerPositionValues: null,
    obstaclesGroup: null,
};

helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var space = false;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 32: // space
            space = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 32: // space
            space = false;
            break;
    }
}

function createStar(height) {
    var star = new THREE.Group();

    var radiusTop = 4;  
    var radiusBottom = 4;   
    var radialSegments =  3;  
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({color: 0xffff00});
    var star1 = new THREE.Mesh(geometry, material);
    var star2 = new THREE.Mesh(geometry, material);
    star2.rotation.y = Math.PI;

    var line1 = addLineSegment(geometry, 0xfe1493);
    var line2 = addLineSegment(geometry, 0xfe1493);
    line2.rotation.y = Math.PI;

    star.add(star1);
    star.add(star2);

    star.add(line1);
    star.add(line2);
    return star;
}

function addLineSegment(geometry, color) {
    var edgesGeometry = new THREE.EdgesGeometry(geometry);
    var material = new THREE.LineBasicMaterial({color: color, linewidth: 50});
    var line = new THREE.LineSegments(edgesGeometry, material);
    return line;
}

function createRocketHead() {
    var shape = new THREE.Shape();
    shape.moveTo(2, 0);
    shape.bezierCurveTo(1.5, 1, 2.5, 2, 0, 3);
    shape.bezierCurveTo(-2.5, 2, -1.5, 1, -2, 0);
    shape.lineTo(2, 0);

    var extrudeSettings = {steps: 2, depth: 0.2, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);    
    mesh.scale.y = 1.3;
    return mesh;
}

function createRocketMiddle() {
    var points = [];
    for (var i = 5; i < 20; i+=0.1) {
        points.push(new THREE.Vector2(i, 0.1*Math.pow(i, 2)));
    }
    var geometry = new THREE.LatheGeometry(points);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.3, 0.3, 0.3);
    return mesh;
}

function createRocketTail() {
    var radiusTop =  3, radiusBottom =  1.4, height = 8, radialSegments = 12;  
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createRocket() {
    var rocket = new THREE.Group();
    var head = createRocketHead();
    head.position.y = 10.5;

    var tail = createRocketTail();
    tail.position.y = 5;

    rocket.add(head);
    rocket.add(tail);
    return rocket;
}

// function to return a random integer between two values
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // Add axes helper
    var axesHelper = new THREE.AxesHelper(500);
    sceneElements.sceneGraph.add(axesHelper);

    // ************************** //
    // Create a ground plane
    // ************************** //
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;

    // FOR TESTING PURPOSES
    // create rocket edge
    var rocket = createRocket();
    rocket.position.set(0, sceneElements.camera.position.y, sceneElements.camera.position.z);
    sceneElements.sceneGraph.add(rocket);

    //var obstacle1 = createObstacle(40, 20);
    //sceneElements.sceneGraph.add(obstacle1);

    // Initialize bird initial position array
    sceneElements.birdInitialPosition = [];

    // Initialize values of the center of each obstacle's hole
    sceneElements.centerPositionValues = [];

    // Initialize array that will store each obstacle
    sceneElements.obstaclesGroup = [];
}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;

var deltaBirdY = 0.2;

var birdFlag = true;

var times = 0;

var obstaclePosition = sceneElements.camera.position.z - 100;

var obstacleID = 1;

var gameOver = true;

function computeFrame(time) {

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
} 