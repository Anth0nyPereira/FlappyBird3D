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

function createBird() {
    var radius = 2;  
    var detail = 5;  
    var geometry = new THREE.TetrahedronGeometry(radius, detail);
    var material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createRocketHead() {
    var radius = 3, height = 3, radialSegments = 32;  
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);
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
    obstacle.add(star2);

    sceneElements.obstaclesGroup.push(obstacle);
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
    bird.position.set(0, sceneElements.camera.getWorldPosition(target).y, sceneElements.camera.getWorldPosition(target).z);
    bird.name = "bird";
    sceneElements.sceneGraph.add(bird);

    // FOR TESTING PURPOSES
    // create rocket edge
    var rocket = createRocket();
    rocket.position.set(0, sceneElements.camera.getWorldPosition(target).y, sceneElements.camera.getWorldPosition(target).z);
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
function birdIntersectsObstacle() {
    var bird = sceneElements.sceneGraph.getObjectByName("bird");
    var raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(bird.position.x, bird.position.y, bird.position.z), new THREE.Vector3(-1, 0, 0));
    if (sceneElements.obstaclesGroup.length > 0) {
        for (var i=parseInt(sceneElements.obstaclesGroup[0].name); i<parseInt(sceneElements.obstaclesGroup[sceneElements.obstaclesGroup.length - 1].name); i++) {
            var intersects = raycaster.intersectObjects(sceneElements.obstaclesGroup[0].children, true); // true -> means recursively checking its children
            if (intersects.length > 0 && gameOver) {
                alert("GAME OVER!");
                gameOver = false;
            }
        }
    }  
}

function removePreviousObstacles() {
    var bird = sceneElements.sceneGraph.getObjectByName("bird");
    for (var i=0; i<sceneElements.obstaclesGroup.length; i++) {
        var oldObstacle = sceneElements.obstaclesGroup[0];
        if (Math.abs(bird.position.z - oldObstacle.position.z) > 200) {
            //console.log(oldObstacle);
            sceneElements.sceneGraph.remove(oldObstacle);
            sceneElements.obstaclesGroup.splice(oldObstacle, 1); 
        }
    }
}
function computeFrame(time) {

    birdIntersectsObstacle();
    removePreviousObstacles();

    //sceneElements.camera.position.z -= 0.5;
    sceneElements.control.target = new THREE.Vector3(-Math.pow(10, 10), 0, 0);

    var bird = sceneElements.sceneGraph.getObjectByName("bird");
    bird.position.z -= 0.5;
    
    var target = new THREE.Vector3();
    /*
    console.log(sceneElements.camera.getWorldPosition(target));
    console.log(sceneElements.camera);
    */

    // Adding obstacles loop
    var centerPosition = randomIntFromInterval(20, 60);
    if (sceneElements.centerPositionValues.length >= 2) {
        while (Math.abs(sceneElements.centerPositionValues[sceneElements.centerPositionValues.length - 1] - centerPosition) > 20) {
            centerPosition = randomIntFromInterval(20, 60);
        }
    }
    sceneElements.centerPositionValues.push(centerPosition);
    var obstacle = createObstacle(centerPosition, 10);
    obstacle.position.z = obstaclePosition;
    obstaclePosition -= 50;
    sceneElements.sceneGraph.add(obstacle);
    obstacle.name = obstacleID;
    obstacleID += 1;
    
    // Position-y of bird increases when pressing space
    
    if (space) {
        var initialPosition = bird.position.y;
        if (sceneElements.birdInitialPosition.length > 0 && birdFlag) {
            if (Math.abs(sceneElements.birdInitialPosition[0] - initialPosition) >= 10) {
                //deltaBirdY *= -1; 
                sceneElements.birdInitialPosition = [];
                birdFlag = false;
                //console.log(birdFlag);
            }
        }

        if (birdFlag) {
            sceneElements.birdInitialPosition.push(initialPosition);
            //console.log(sceneElements.birdInitialPosition);
            bird.position.y += 6*deltaBirdY;
        } else if (!birdFlag) {
            bird.position.y -= 3*deltaBirdY;
        }
        

    } else if (!space) {
        bird.position.y -= 3*deltaBirdY;
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