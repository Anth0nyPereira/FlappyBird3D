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

function createStar(height, withLines) { // added a new argument so that I can reuse this function to make the little rocket's stars
    var star = new THREE.Group();

    var radiusTop = 4;  
    var radiusBottom = 4;   
    var radialSegments =  3;  
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({color: 0xffff00});
    var star1 = new THREE.Mesh(geometry, material);
    var star2 = new THREE.Mesh(geometry, material);
    star2.rotation.y = Math.PI;

    star.add(star1);
    star.add(star2);

    if (withLines) {
        var line1 = addLineSegment(geometry, 0xfe1493);
        var line2 = addLineSegment(geometry, 0xfe1493);
        line2.rotation.y = Math.PI;

        star.add(line1);
        star.add(line2);
    }
    
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
    shape.moveTo(0, 3);
    shape.lineTo(2, 0);
    shape.lineTo(-2, 0);
    shape.lineTo(0, 3);

    var extrudeSettings = {steps: 2, depth: 0.1, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material); 
    return mesh;
}

function createRocketTail() {
    var shape = new THREE.Shape();
    shape.moveTo(2, 0);
    shape.bezierCurveTo(3, -3, 2, -5, 1, -8);
    shape.lineTo(-1, -8);
    shape.bezierCurveTo(-2, -5, -3, -3, -2, 0);
    shape.lineTo(2, 0);

    var extrudeSettings = {steps: 2, depth: 0.3, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material);    
    return mesh;
}

function createGlass() {
    var radius =  1, segments = 100;  
    var geometry = new THREE.CircleGeometry(radius, segments);
    var material = new THREE.MeshBasicMaterial({color: 0x0096ff});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1.4, 1.4, 1.4);
    return mesh;
}

function createRing() {
    var radius =  1.5, tubeRadius =  0.3, radialSegments =  5, tubularSegments =  100;  

    var geometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.9, 0.9, 0.9);
    return mesh;
}

function createWindowStars() {
    var stars = new THREE.Group();
    for (var i = 0; i < 8; i++) {
        var star = createStar(0.05, false);
        star.scale.set(0.05, 0.05, 0.05);
        star.position.set(1.35*Math.cos(i*Math.PI/4), 1.35*Math.sin(i*Math.PI/4), 0);
        star.rotation.x = Math.PI/2;
        stars.add(star);
    }
    return stars;
}

function createRocketWing() {
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.5, 2, 0, 0, -1, 6);
    shape.bezierCurveTo(-1.5, 4, -3, 7, -4, 8);
    shape.lineTo(-4, 4);
    shape.lineTo(0, 0);

    var extrudeSettings = {steps: 2, depth: 0.3, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);  
    mesh.scale.set(0.7, 0.7, 0.7);  
    return mesh;
}

function createRocketWindow() {
    var window = new THREE.Group();

    // glass
    var glass = createGlass();

    // ring around the glass
    var ring = createRing();

    // stars
    var stars = createWindowStars();
    stars.position.set(0, 0.1, 0.5);

    window.add(glass);
    window.add(ring);
    window.add(stars);

    return window;
    
}

function createRocket() {
    var rocket = new THREE.Group();
    var head = createRocketHead();
    head.position.y = 7.5;

    var tail = createRocketTail();
    tail.position.y = 7.5;

    var window = createRocketWindow();
    window.position.set(0, 5, 1);

    var wing1 = createRocketWing();
    wing1.position.set(3.8, -2, -2);

    var wing2 = createRocketWing();
    wing2.rotation.y = Math.PI;
    wing2.position.set(-3.8, -2, -2);

    rocket.add(head);
    rocket.add(tail);
    rocket.add(window);
    rocket.add(wing1);
    rocket.add(wing2);

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