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
    initialBackgroundColor: null,
    flyingSaucerLevitationObjects: null,
    flyingSaucerLights: null,
    circlesPath: null,
    actualScore: null,
    flyingSaucersCanAppearNow: false,
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
        var line1 = addLineSegment(geometry, 0xfe1493, 50);
        var line2 = addLineSegment(geometry, 0xfe1493, 50);
        line2.rotation.y = Math.PI;

        star.add(line1);
        star.add(line2);
    }
    
    return star;
}

function addLineSegment(geometry, color, lineWidth) {
    var edgesGeometry = new THREE.EdgesGeometry(geometry);
    var material = new THREE.LineBasicMaterial({color: color, linewidth: lineWidth});
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

function createCircle(radius, color=0xffffff, withLineSegments=false, lineWidth=0) {
    var circle = new THREE.Group();

    var geometry = new THREE.CircleGeometry(radius, 50);
    var material = new THREE.MeshBasicMaterial({color: color});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI/2;
    circle.add(mesh);

    if (withLineSegments) {
        var line1 = addLineSegment(geometry, 0xffbf00, lineWidth);
        line1.rotation.y = Math.PI/2;
        circle.add(line1);
    }
    
    return circle;
}

function createMoon(size) {
    var shape = new THREE.Shape();
    shape.moveTo(4, 0.5);
    shape.bezierCurveTo(2.5, 0, 0, 2, 4, 4.5);
    shape.bezierCurveTo(3, 3, 2, 2, 4, 0.5);

    var extrudeSettings = {steps: 2, depth: 0.1, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 10};
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: randomColor()});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(size, size, size);
    mesh.rotation.y = Math.PI/2;
    return mesh;
}

function createStarWithMoons(size) {
    var group = new THREE.Group();

    for (var i=0; i<1; i++) {
        var moon = createMoon();
        moon.rotation.y = -Math.PI/2;
        group.add(moon);
    }

    return group;
}

function createFlyingSaucerLevitatingComponent(size) {
    var radius = size, tubeRadius =  0.15, radialSegments =  30, tubularSegments = 100;  
    var geometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
    var material = new THREE.MeshBasicMaterial({color: 0x7fffd4});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI/2;
    return mesh;
}

function createFlyingSaucer() {
    var group = new THREE.Group();

    // blue glass -- where we can see an E.T.
    var glassGeometry = new THREE.SphereGeometry(4, 30, 30);
    var glassMaterial = new THREE.MeshBasicMaterial({color: 0xadd8e6});
    var glass = new THREE.Mesh(glassGeometry, glassMaterial);

    // disc - the inferior component of the flying saucer
    var radius = 5, tubeRadius =  1.75, radialSegments =  9, tubularSegments = 24;  
    var discGeometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
    var discMaterial = new THREE.MeshBasicMaterial({color: 0xaaff00});
    var disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI/2;
    disc.position.y = -2;

    var discLine = addLineSegment(discGeometry, 0x000000, 1);
    discLine.rotation.x = Math.PI/2;
    discLine.position.y = -2;

    // little lights - blue circles -- that will change its color to glowing-yellow
    var lights = new THREE.Group();
    lights.name = "lights";
    for (var i=0; i<5; i++) {
        if (i == 0) { // the first-one has already the light turned on
            var light = createCircle(0.5, 0xffbf00, true, 3);
        } else {
            var light = createCircle(0.5, 0xc70039, true, 3);
        }

        light.position.set(1, -2.5*Math.sin(i*Math.PI/4.3) - 10, -2.5*Math.cos(i*Math.PI/4.3));
        lights.add(light);
    }

    lights.scale.set(1, 0.5, 1.5);
    lights.position.y = 2;
    lights.rotation.z = 1;


    // levitation component
    var levitate = new THREE.Group();
    levitate.name = "levitate";
    for (var i=4; i>0; i--) {
        var levitateComponent = createFlyingSaucerLevitatingComponent(i/1.5);
        levitateComponent.position.set(12, 2.3*i - 4, 0);
        levitateComponent.visible = false;
        levitate.add(levitateComponent);
    }
    levitate.scale.z = 1.4;
    levitate.position.y = -11;
    levitate.rotation.z = 0.3;

    group.add(glass);
    group.add(disc);
    group.add(discLine);
    group.rotation.z = -0.5;
    group.add(lights);
    group.add(levitate);

    group.scale.set(0.8, 0.8, 0.8);
    return group;
}

function createCirclesPath() {
    var group = new THREE.Group();

    sceneElements.circlesPath = [];

    for (var i=-40; i<40; i+=2) {
        var circle = createCircle(0.5);
        circle.position.set(0, i, 20*Math.cos(0.2*i));
        group.add(circle);
        sceneElements.circlesPath.unshift(circle);
        circle.visible = false;
    }
    return group;
}

function createPlanet(color) {
    var group = new THREE.Group();

    // the planet itself including the line segments
    var radius = 25, widthSegments = 17, heightSegments = 17;
    
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    var material = new THREE.MeshBasicMaterial({color: color});
    var mesh = new THREE.Mesh(geometry, material);

    var lines = addLineSegment(geometry, 0xdaf7a6, 3.5);

    // add ring around the planet
    var radius =  30, tubeRadius =  0.03, radialSegments = 30, tubularSegments = 100;  

    var torusGeometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
    var torusMaterial = new THREE.MeshBasicMaterial({color: 0xfff300});
    var ring1 = new THREE.Mesh(torusGeometry, torusMaterial);
    ring1.position.x = 10;
    ring1.rotation.z = Math.PI/2;
    var ring2 = new THREE.Mesh(torusGeometry, torusMaterial);
    ring2.position.x = 10;
    ring2.rotation.x = Math.PI/2;

    group.add(mesh);
    group.add(lines);
    group.add(ring1);
    group.add(ring2);
    return group;
}

function createBackground() {
    var group = new THREE.Group();

    var planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0x000821});
    sceneElements.initialBackgroundColor = planeMaterial.color; // store it for later --> so that I can change the background color to its original color and repeat the cycle
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.y = Math.PI/2;
    plane.name = "plane";
    group.add(plane);

    // create the path with circles that each flying saucer will follow
    var path = createCirclesPath();
    // path.position.y = -35;
    group.add(path);

    // creating flying saucers
    for (var i=0; i<4; i++) {
        var flyingSaucer = createFlyingSaucer();
        flyingSaucer.name = "flyingSaucer" + (i+1);
        var levitate = flyingSaucer.children[4];
        levitate.name = "levitate" + (i+1);
        sceneElements.flyingSaucerLevitationObjects[levitate.name] = levitate;

        var lights = flyingSaucer.children[3];
        lights.name = "lights" + (i+1);
        sceneElements.flyingSaucerLights[lights.name] = lights;

        flyingSaucer.position.set(-1, 78, 0);
        group.add(flyingSaucer);
    }
    // creating particles
    for (var i=0; i<250; i++) {
        /*
        var particle = createStarWithMoons(randomFromInterval(0.002, 0.02));
        var particle = createMoon(10);
        particle.position.set(0, randomFromInterval(-20, 20), randomFromInterval(-100, 100));
        group.add(particle);
        sceneElements.backgroundObjects.push(particle);
        particle.name = "particle" + i;
        */

        var star = createStar(randomFromInterval(0.002, 0.2), false);
        var random = randomIntFromInterval(0, 3);
        star.scale.set(random/10, random/10, random/10);
        star.rotation.z = Math.PI/2;
        star.position.set(0, randomFromInterval(-50, 50), randomFromInterval(-200, 200));
        group.add(star);
        sceneElements.backgroundObjects.push(star);

        if (i > 125) {
            // particle.visible = false;
            star.visible = false;
        }
    }

    // adding the planets
    var planet1 = createPlanet(0xf08000);
    planet1.position.set(-30, -10, 70);
    planet1.scale.set(1.4, 2.5, 1.4);
    planet1.name = "planet1";
    group.add(planet1);

    var planet2 = createPlanet(0x20b2aa);
    planet2.position.set(-30, -10, -70);
    planet2.scale.set(1.4, 2.5, 1.4);
    planet2.name = "planet2";
    group.add(planet2);

    return group;
}

// function that returns a random hexa code corresponding to a color
function randomColor() {
    return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); 
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

    // Initialize dict that will store the levitating components of each flying saucer --> to make a little animation
    sceneElements.flyingSaucerLevitationObjects = {};

    // Initialize dict that will store the lights of each flying saucer
    sceneElements.flyingSaucerLights = {};

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

    // Initialize variable that will store the actual score
    sceneElements.actualScore = 0;
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
    var centerPosition = randomIntFromInterval(25, 60);
    if (sceneElements.centerPositionValues.length >= 2) {
        while (Math.abs(sceneElements.centerPositionValues[sceneElements.centerPositionValues.length - 1] - centerPosition) > 20) {
            centerPosition = randomIntFromInterval(25, 60);
        }
    }
    sceneElements.centerPositionValues.push(centerPosition);
    var obstacle = createObstacle(centerPosition, 15);
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

function increaseScore() {
    var score = document.getElementById("score").textContent;
    score = parseInt(score);
    score += 1;

    sceneElements.actualScore = score; // update current score

    score = score.toString();
    var scoreLength = score.toString().length;
    var missingZeros = 3 - scoreLength;
    
    for (var i = 0; i < missingZeros; i++) {
        score = "0" + score;
    }
    document.getElementById("score").textContent=score;
}

function roundToOneDecimalPlace(number) {
    return Math.round(number * 10) / 10;
} 

function checkIfRocketSurpassedObstacle() {
    var rocket = sceneElements.sceneGraph.getObjectByName("rocket");
    sceneElements.obstaclesGroup.forEach(obstacle => {
        if (roundToOneDecimalPlace(rocket.position.z) == roundToOneDecimalPlace(obstacle.position.z)) {
            increaseScore();
        }
    });
}

function randomElementFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function updateBackgroundColor() {
    var plane = sceneElements.sceneGraph.getObjectByName("plane");
    var color = plane.material.color;

    var r = color.r, g = color.g, b = color.b;

    /*
    var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); 
    color.set(randomColor);
    */


    var rgbArray = [];
    rgbArray.push(r);
    rgbArray.push(g);
    rgbArray.push(b);

    var randomRGB = randomElementFromArray(rgbArray);

    var flagsArray = [0, 1];
    /*
    console.log("R: " + r.toString());
    console.log("G: " + g.toString());
    console.log("B: " + b.toString());
    */

    if (r <= 0.4) {
        r += 0.0005;
    } else if (r > 0.4 && b <= 0.4) {
        b += 0.0005;
    } else if (b > 0.4 && g <= 0.02) {
        g += 0.005;
        alert("g");
    } else {
        r = sceneElements.initialBackgroundColor.r;
        g = sceneElements.initialBackgroundColor.g;
        b = sceneElements.initialBackgroundColor.b;
    }

    color.setRGB(r, g, b);
    // console.log(color.r, color.g, color.b);

}

function rotateParticles() {
    for (var i=0; i<250; i++) {
        var particle = sceneElements.sceneGraph.getObjectByName("particle" + i);
        particle.rotation.x += Math.random();
    }
}

function checkIfObjectisVisible(object) {
    return object.visible == true;
}
function turnObjectInvisible(object) {
    object.visible = false;
}

function animateAllLevitationFlyingSaucers() {
    for (var [key, group] of Object.entries(sceneElements.flyingSaucerLevitationObjects)) {
        animateLevitationFlyingSaucer(group);
    }      
}

function animateLevitationFlyingSaucer(group) {
    var levitateComponents = group.children;
    for (var i=0; i<levitateComponents.length; i++) {
        if (i != 0 && i != levitateComponents.length - 1) {
            if (levitateComponents[i-1].visible && !levitateComponents[i].visible) {
                // console.log("middle being turned on!");
                levitateComponents[i].visible = true;
                return;
            }
        } else if (i == 0) {
            if (!levitateComponents[0].visible) {
                // console.log("1st being turned on!");
                levitateComponents[0].visible = true;
                return;
            }
        } else {
            if (!levitateComponents[levitateComponents.length - 1].visible) {
                // console.log("last being turned on!");
                levitateComponents[levitateComponents.length - 1].visible = true;
                return;
            } else {
                // console.log("reset!");
                levitateComponents.forEach(component => {
                    component.visible = false;
                });
                return;
            }
        }       
    }
}

function animateAllFlyingSaucerLights() {
    for (var [key, group] of Object.entries(sceneElements.flyingSaucerLights)) {
        animateFlyingSaucerLights(group);
    }
}

function animateFlyingSaucerLights(group) {
    var normalColor = new THREE.Color(0xc70039).getHexString();
    var switchedOnColor = new THREE.Color(0xffbf00).getHexString();
    var lights = group.children;
    
    // console.log(normalColor);
    // console.log(lights[0].children[0].material.color.getHexString());
    for (var i=0; i<lights.length; i++) {
        var actualColor = lights[i].children[0].material.color.getHexString();
        if (i != 0 && i != lights.length - 1) {
            var previousColor = lights[i - 1].children[0].material.color.getHexString();
            if (actualColor == normalColor && previousColor == switchedOnColor) {
                // console.log("turning on a light in the middle");
                lights[i].children[0].material.color.setHex(0xffbf00);
                lights[i - 1].children[0].material.color.setHex(0xc70039);
                return;
            }
        } else if (i == lights.length - 1) {
            var previousColor = lights[i - 1].children[0].material.color.getHexString();
            if (actualColor == normalColor && previousColor == switchedOnColor) {
                // console.log("turning on in the last");
                lights[i].children[0].material.color.setHex(0xffbf00);
                lights[i - 1].children[0].material.color.setHex(0xc70039);
                return;
            } 
        } else { // i = 0
            var lastLightColor = lights[lights.length - 1].children[0].material.color.getHexString();
            if (actualColor == normalColor && lastLightColor == switchedOnColor) {
                lights[lights.length - 1].children[0].material.color.setHex(0xc70039);
                lights[0].children[0].material.color.setHex(0xffbf00);
                // console.log("turning on the first one");
                return;
            }
            
        }
    }
}

function moveFlyingSaucerToPosition(flyingSaucer, circle) {
    var dir = new THREE.Vector3(); // create once an reuse it
    var v2 = new THREE.Vector3(circle.position.x, circle.position.y, circle.position.z);
    var v1 = new THREE.Vector3(flyingSaucer.position.x, flyingSaucer.position.y, flyingSaucer.position.z);
    dir.subVectors(v2, v1);
    flyingSaucer.position.y += dir.y;
    flyingSaucer.position.z += dir.z;
}

var circleIndex = 0;
var circleIndexArray = [0, 0, 0, 0];

function animateAllFlyingSaucerMovement() {
    for (var i=0; i<4; i++) {
        if (i == 0) {
            var firstFlyingSaucer = sceneElements.sceneGraph.getObjectByName("flyingSaucer1");
            animateFlyingSaucerMovement(firstFlyingSaucer);
        } else {
            var actualFlyingSaucer = sceneElements.sceneGraph.getObjectByName("flyingSaucer" + (i+1));
            var previousFlyingSaucerIndex = circleIndexArray[i-1];
            var actualFlyingSaucerIndex = circleIndexArray[i];
            if (Math.abs(actualFlyingSaucerIndex - previousFlyingSaucerIndex) >= 5) {
                animateFlyingSaucerMovement(actualFlyingSaucer);
            } else {
                // console.log("previous: " + previousFlyingSaucerIndex);
                // console.log("actual: " + actualFlyingSaucerIndex);
            }
        }
    }
    if (circleIndexArray.filter(index => index == sceneElements.circlesPath.length + 10).length == circleIndexArray.length) {
        // console.log("set to false, cant move");
        sceneElements.flyingSaucersCanAppearNow = false;
        return;
    }
    // console.log(circleIndexArray.filter(index => index == sceneElements.circlesPath.length + 10));
}

function animateFlyingSaucerMovement(flyingSaucer) {
    var flyingSaucerName = flyingSaucer.name;
    var flyingSaucerID = parseInt(flyingSaucerName[flyingSaucerName.length - 1]) - 1;
    var circleIndex = circleIndexArray[flyingSaucerID];
    // HERE
    if (circleIndex <= sceneElements.circlesPath.length - 1) {
        var circle = sceneElements.circlesPath[circleIndex];
        moveFlyingSaucerToPosition(flyingSaucer, circle);
        if (flyingSaucer.position.y == circle.position.y && flyingSaucer.position.z == flyingSaucer.position.z) {
            // console.log("reached a new position!! " + flyingSaucer.position.y + " " + flyingSaucer.position.z);
            circleIndexArray[flyingSaucerID] += 1;
            return;
        }
    } else {
        var lastCircleFromPath = sceneElements.circlesPath[sceneElements.circlesPath.length - 1];
        flyingSaucer.position.y = lastCircleFromPath.position.y;
        flyingSaucer.position.z = lastCircleFromPath.position.z;
        circleIndexArray[flyingSaucerID] = sceneElements.circlesPath.length + 10; // 50
        // circleIndexArray[flyingSaucerID] = 0;
        return;
    }
    
}

var animateLevitateCounter = 0;
function computeFrame(time) {

    //updateBackgroundColor();

    rocketIntersectsObstacle();
    removePreviousObstacles();
    animateBackground();
    checkIfRocketSurpassedObstacle();
    // rotateParticles();

    if (animateLevitateCounter % 20 == 0) {
        animateAllLevitationFlyingSaucers();
        animateAllFlyingSaucerLights();
    } 

    if (sceneElements.actualScore % 7 == 0 && sceneElements.actualScore != 0) {
        sceneElements.flyingSaucersCanAppearNow = true;
    }
    
    if (sceneElements.flyingSaucersCanAppearNow) {
        if (animateLevitateCounter % 5 == 0) {
            if (circleIndexArray.filter(index => index == sceneElements.circlesPath.length + 10).length == circleIndexArray.length) {
                circleIndexArray = [0, 0, 0, 0];
            }
            animateAllFlyingSaucerMovement();
        }
    }
    animateLevitateCounter += 1;

    sceneElements.camera.position.z -= 0.5;
    sceneElements.control.target = new THREE.Vector3(-Math.pow(10, 10), 0, 0);

    var rocket = sceneElements.sceneGraph.getObjectByName("rocket");
    rocket.position.z -= 0.5;

    var background = sceneElements.sceneGraph.getObjectByName("background");
    background.position.z -= 0.5;

    // Add first couple of obstacles (the rest will be added while removing the old ones)
    if (index < 4) {
        var centerPosition = randomIntFromInterval(25, 60);
        if (sceneElements.centerPositionValues.length >= 2) {
            while (Math.abs(sceneElements.centerPositionValues[sceneElements.centerPositionValues.length - 1] - centerPosition) > 20) {
                centerPosition = randomIntFromInterval(25, 60);
            }
        }
        sceneElements.centerPositionValues.push(centerPosition);
        var obstacle = createObstacle(centerPosition, 15);
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

    for (var i=0; i<2; i++) {
        var actualPlanet = sceneElements.sceneGraph.getObjectByName("planet" + (i+1));
        var rand = randomFromInterval(0, 1)/100;

        // planet animation
        if (i == 0) {
            actualPlanet.rotation.y += rand
            actualPlanet.rotation.z -= rand;
        } else {
            actualPlanet.rotation.y -= rand;
            actualPlanet.rotation.z += rand;
        }
        actualPlanet.rotation.x += rand;
        
        actualPlanet.children[1].material.color.set(randomColor());

        // rings animation
        var ring1 = actualPlanet.children[2];
        var ring2 = actualPlanet.children[3];

        ring1.rotation.x += 0.00001;
        ring1.rotation.y -= 0.00002;

        ring2.rotation.y += 0.00002;
        ring2.rotation.z -= 0.00001;    
    }

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
} 