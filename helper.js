"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // Create the 3D scene
        sceneElements.sceneGraph = new THREE.Scene();


        // Add camera
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        camera.position.set(0, 40, 150);
        sceneElements.camera = camera;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
        sceneElements.sceneGraph.add(ambientLight);

        // Create renderer (with shadow map)
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor('rgb(255, 255, 150)', 1.0);
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        // Add the rendered image in the HTML DOM
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);

        // Control for the camera
        sceneElements.control = new THREE.OrbitControls(camera, renderer.domElement);
        sceneElements.control.screenSpacePanning = true;
        sceneElements.control.target = new THREE.Vector3(0, 0, -Math.pow(10, 10));


    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};