"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  
    renderer: null,
    rocketInitialPosition: null,
    centerPositionValues: null,
    obstaclesGroup: null,
    backgroundObjects: null,
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

// function that will return an obstacle already made of 2 stars that only has the centering position and the height of the hole between the two poles
function createObstacle(centerPosition, holeHeight) {

    var obstacle = new THREE.Group();
    
    // first, let's create the star at the bottom
    var star1Height = centerPosition - holeHeight/2;
    var star1 = createStar(star1Height, true);
    star1.position.y = star1Height/2;

    // now, the second star at the top
    // let's define a maximum value for the height of an obstacle (conjunction of two stars) --> 500 of height

    var star2Height = 500 - holeHeight - star1Height;
    var star2 = createStar(star2Height, true);
    star2.position.y = star2Height/2 + holeHeight + star1Height;

    obstacle.add(star1);
    obstacle.add(star2);

    sceneElements.obstaclesGroup.push(obstacle);
    return obstacle;
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

function createRocketTube() {
    var radius =  0.4, tubeRadius =  0.5, radialSegments = 8, tubularSegments = 100, p =  1, q = 20;  

    var geometry = new THREE.TorusKnotGeometry(radius, tubeRadius, tubularSegments, radialSegments, p, q);
    var material = new THREE.MeshBasicMaterial({color: 0x606060});
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createRocketFire() {
    var group = new THREE.Group();

    var shape = new THREE.Shape();
    shape.moveTo(4, 0);
    shape.bezierCurveTo(5, -2, 3, -5, 0, -8);
    shape.bezierCurveTo(-3, -5, -5, -2, -4, 0);
    shape.lineTo(4, 0);

    var extrudeSettings = {steps: 2, depth: 0.3, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var outsideMaterial = new THREE.MeshBasicMaterial({color: 0xf28c28});
    var outsideMesh = new THREE.Mesh(geometry, outsideMaterial);

    var insideMaterial = new THREE.MeshBasicMaterial({color: 0xffd700});
    var insideMesh = new THREE.Mesh(geometry, insideMaterial);

    insideMesh.scale.set(0.7, 0.7, 0.7);
    insideMesh.position.set(0, 0.1, 0.5);

    group.add(outsideMesh);
    group.add(insideMesh);
    return group;
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

    var tube = createRocketTube();
    tube.rotation.x = Math.PI/2;
    tube.position.y = -1.2;

    var fire = createRocketFire();
    fire.visible = false;
    fire.scale.set(0.2, 0.6, 0.2);
    fire.position.y = -1.8;
    fire.name = "fire";

    rocket.add(head);
    rocket.add(tail);
    rocket.add(window);
    rocket.add(wing1);
    rocket.add(wing2);
    rocket.add(tube);
    rocket.add(fire);

    return rocket;
}

function createCircle(radius) {
    var geometry = new THREE.CircleGeometry(radius, 50);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI/2;
    return mesh;
}
function createBackground() {
    var group = new THREE.Group();

    var planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0x000821});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.y = Math.PI/2;

    // creating particles
    for (var i=0; i<250; i++) {
        var particle = createCircle(randomFromInterval(0, 0.02));
        particle.position.set(0, randomFromInterval(-50, 50), randomFromInterval(-200, 200));
        group.add(particle);
        sceneElements.backgroundObjects.push(particle);

        var star = createStar(randomFromInterval(0, 0.2), false);
        var random = randomIntFromInterval(0, 3);
        star.scale.set(random/10, random/10, random/10);
        star.rotation.z = Math.PI/2;
        star.position.set(0, randomFromInterval(-50, 50), randomFromInterval(-200, 200));
        group.add(star);
        sceneElements.backgroundObjects.push(star);

        if (i > 125) {
            particle.visible = false;
            star.visible = false;
        }


    }

    group.add(plane);
    return group;
}
// function to return a random integer between two values
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
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

    // Create background
    // Initialize array that will store all objects from the background (circles, stars, ...)
    sceneElements.backgroundObjects = [];
    var background = createBackground();
    background.name = "background";
    background.position.set(-20, sceneElements.camera.position.y, sceneElements.camera.position.z);
    sceneElements.sceneGraph.add(background);

    // create rocket/player
    var rocket = createRocket();
    rocket.scale.set(0.7, 0.7, 0.7);
    rocket.position.set(0, sceneElements.camera.position.y, sceneElements.camera.position.z);
    rocket.rotation.y = Math.PI/2;
    rocket.rotation.z = -Math.PI/2;
    sceneElements.sceneGraph.add(rocket);
    rocket.name = "rocket";

    //var obstacle1 = createObstacle(40, 20);
    //sceneElements.sceneGraph.add(obstacle1);

    // Initialize rocket initial position array
    sceneElements.rocketInitialPosition = [];

    // Initialize values of the center of each obstacle's hole
    sceneElements.centerPositionValues = [];

    // Initialize array that will store each obstacle
    sceneElements.obstaclesGroup = [];
}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;

var deltaRocketY = 0.2;

var rocketFlag = true;

var times = 0;

var obstaclePosition = sceneElements.camera.position.z - 100;

var obstaclePositionLater = -100;

var obstacleID = 1;

var gameOver = true;

var index = 0;

var animateBackgroundCounter = 0;

function createNewObstacle() {
    var centerPosition = randomIntFromInterval(20, 60);
    if (sceneElements.centerPositionValues.length >= 2) {
        while (Math.abs(sceneElements.centerPositionValues[sceneElements.centerPositionValues.length - 1] - centerPosition) > 20) {
            centerPosition = randomIntFromInterval(20, 60);
        }
    }
    sceneElements.centerPositionValues.push(centerPosition);
    var obstacle = createObstacle(centerPosition, 10);
    obstacle.position.z = obstaclePositionLater;
    obstaclePositionLater -= 50;
    sceneElements.sceneGraph.add(obstacle);
    obstacle.name = obstacleID;
    obstacleID += 1;
}


function rocketIntersectsObstacle() {
    var rocket = sceneElements.sceneGraph.getObjectByName("rocket");
    var raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(rocket.position.x, rocket.position.y, rocket.position.z), new THREE.Vector3(-1, 0, 0));
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
    var rocket = sceneElements.sceneGraph.getObjectByName("rocket");
    for (var i=0; i<sceneElements.obstaclesGroup.length; i++) {
        var oldObstacle = sceneElements.obstaclesGroup[i];
        if (oldObstacle.position.z > rocket.position.z && Math.abs(rocket.position.z - oldObstacle.position.z) > 140) {
            sceneElements.sceneGraph.remove(oldObstacle);
            sceneElements.obstaclesGroup.splice(oldObstacle, 1); 
            createNewObstacle();
        }
    }
}

var scaleCounter = 0;

function animateRocketFire() {
    var fire = sceneElements.sceneGraph.getObjectByName("fire");
    fire.visible = true;
    if (scaleCounter % 2  == 0) {
        fire.scale.set(0.25, 0.8, 0.25);
    } else {
        fire.scale.set(0.2, 0.6, 0.2);
    }
    scaleCounter++;
}

function animateBackground() {
    for (var i=0; i<sceneElements.backgroundObjects.length; i++) {
        if (sceneElements.backgroundObjects[i].visible && animateBackgroundCounter % 2 == 0) {
            sceneElements.backgroundObjects[i].visible = false;
            animateBackgroundCounter += 1;
        } else if (!sceneElements.backgroundObjects[i].visible && animateBackgroundCounter % 2 != 0) {
            sceneElements.backgroundObjects[i].visible = true;
            animateBackgroundCounter += 1;
        }
    }
}

function computeFrame(time) {

    rocketIntersectsObstacle();
    removePreviousObstacles();
    animateBackground();

    sceneElements.camera.position.z -= 0.5;
    sceneElements.control.target = new THREE.Vector3(-Math.pow(10, 10), 0, 0);

    var rocket = sceneElements.sceneGraph.getObjectByName("rocket");
    rocket.position.z -= 0.5;

    var background = sceneElements.sceneGraph.getObjectByName("background");
    background.position.z -= 0.5;

    // Add first couple of obstacles (the rest will be added while removing the old ones)
    if (index < 4) {
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
        index += 1;
    }
    
    // Position-y of rocket increases when pressing space
    if (space) {
        var initialPosition = rocket.position.y;
        if (sceneElements.rocketInitialPosition.length > 0 && rocketFlag) {
            if (Math.abs(sceneElements.rocketInitialPosition[0] - initialPosition) >= 10) {
                //deltarocketY *= -1; 
                sceneElements.rocketInitialPosition = [];
                rocketFlag = false;
            }
        }

        if (rocketFlag) { // rocket going up, need to show the fire
            sceneElements.rocketInitialPosition.push(initialPosition);

            animateRocketFire();

            rocket.position.y += 6*deltaRocketY;
        } else if (!rocketFlag) {
            sceneElements.sceneGraph.getObjectByName("fire").visible = false;
            rocket.position.y -= 3*deltaRocketY;
        }
        

    } else if (!space) {
        rocket.position.y -= 3*deltaRocketY;
        rocketFlag = true;
    }

    

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
} 