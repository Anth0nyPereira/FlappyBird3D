"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
    birdInitialPosition: null,
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

function createBird() {
    var radius = 5;  
    var detail = 5;  
    var geometry = new THREE.TetrahedronGeometry(radius, detail);
    var material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

// function that will return an obstacle already made of 2 stars that only has the centering position and the height of the hole between the two poles
function createObstacle(centerPosition, holeHeight) {

    var obstacle = new THREE.Group();
    
    // first, let's create the star at the bottom
    var star1Height = centerPosition - holeHeight/2;
    var star1 = createStar(star1Height);
    star1.position.y = star1Height/2;

    // now, the second star at the top
    // let's define a maximum value for the height of an obstacle (conjunction of two stars) --> 500 of height

    var star2Height = 500 - holeHeight - star1Height;
    var star2 = createStar(star2Height);
    star2.position.y = star2Height/2 + holeHeight + star1Height;

    obstacle.add(star1);
    console.log(star1.position);
    console.log(star1Height);
    obstacle.add(star2);
    console.log(star2.position);
    console.log(star2Height);
    return obstacle;
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

    // Create bird
    var bird = createBird();
    var target = new THREE.Vector3();
    bird.position.set(sceneElements.camera.getWorldPosition(target).x, sceneElements.camera.getWorldPosition(target).y, sceneElements.camera.getWorldPosition(target).z - 50);
    bird.name = "bird";
    sceneElements.sceneGraph.add(bird);

    /*
    // Create first star-obstacle
    var star1 = createStar(10);
    star1.position.y = 50;
    sceneElements.sceneGraph.add(star1);

    var star2 = createStar(5);
    star2.position.y = 25;
    sceneElements.sceneGraph.add(star2);

    // second obstacle - for testing purposes

    var star3 = createStar(10);
    star3.position.y = 50;
    star3.position.z = -30;
    sceneElements.sceneGraph.add(star3);

    var star4 = createStar(5);
    star4.position.y = 25;
    star4.position.z = -30;
    sceneElements.sceneGraph.add(star4);
    */

    var obstacle1 = createObstacle(40, 20);
    sceneElements.sceneGraph.add(obstacle1);

    // Initialize bird initial position array
    sceneElements.birdInitialPosition = [];
}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;

var deltaBirdY = 0.2;

var birdFlag = true;

var times = 0;

function computeFrame(time) {
    sceneElements.camera.position.z -= 0.5;
    sceneElements.control.target = new THREE.Vector3(0, 0, -Math.pow(10, 10));

    var bird = sceneElements.sceneGraph.getObjectByName("bird");
    bird.position.z -= 0.5;
    
    var target = new THREE.Vector3();
    /*
    console.log(sceneElements.camera.getWorldPosition(target));
    console.log(sceneElements.camera);
    */
    
    // Position-y of bird increases when pressing space
    
    if (space) {
        var initialPosition = bird.position.y;
        if (sceneElements.birdInitialPosition.length > 0 && birdFlag) {
            if (Math.abs(sceneElements.birdInitialPosition[0] - initialPosition) >= 5) {
                //deltaBirdY *= -1; 
                sceneElements.birdInitialPosition = [];
                birdFlag = false;
                //console.log(birdFlag);
            }
        }

        if (birdFlag) {
            sceneElements.birdInitialPosition.push(initialPosition);
            //console.log(sceneElements.birdInitialPosition);
            bird.position.y += 2*deltaBirdY;
        } else if (!birdFlag) {
            bird.position.y -= deltaBirdY;
        }
        

    } else if (!space) {
        bird.position.y -= deltaBirdY;
        birdFlag = true;
        //console.log(birdFlag);
    }

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
} 