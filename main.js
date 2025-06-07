import * as THREE from 'three';
import { createPlane } from './plane.js';
import { InfiniteCity } from './city.js';
import { FlightControls, CameraController, InputManager } from './controls.js';
import { CombatSystem } from './combat/index.js';
import { AudioManager } from './audio/audioManager.js';

// Global variables
let scene, camera, renderer, plane, animationId;
let inputManager, flightControls, cameraController, infiniteCity, combatSystem;
let audioManager;
const clock = new THREE.Clock();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 17, 8); // Initial position, will be controlled by CameraController

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Create infinite city environment
    infiniteCity = new InfiniteCity(scene);

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create and add plane
    plane = createPlane();
    scene.add(plane);

    // Initialize controls
    inputManager = new InputManager();
    flightControls = new FlightControls();
    cameraController = new CameraController(camera, plane);

    // Set initial plane position and rotation
    plane.position.copy(flightControls.getPosition());
    plane.quaternion.copy(flightControls.getQuaternion());

    // Initialize audio manager
    audioManager = new AudioManager();

    // Initialize combat system with audio manager
    combatSystem = new CombatSystem(scene, plane, infiniteCity, audioManager);

    // Add window resize event listener
    window.addEventListener('resize', onWindowResize);

    // Add user interaction listener to start audio
    const startAudio = () => {
        audioManager.playBackgroundMusic();
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    // Get delta time for frame-rate independent physics
    const deltaTime = clock.getDelta();

    // Get input from input manager
    const input = inputManager.getInput();

    // Update flight controls
    flightControls.update(input, deltaTime);

    // Apply flight physics to plane
    plane.position.copy(flightControls.getPosition());
    plane.quaternion.copy(flightControls.getQuaternion());

    // Update camera
    cameraController.update(deltaTime);

    // Handle camera toggle
    if (input.cameraToggle) {
        cameraController.toggleMode();
    }

    // Update infinite city based on plane position
    infiniteCity.update(flightControls.getPosition());

    // Update combat system
    combatSystem.update(deltaTime, input);

    // Rotate propeller
    const propeller = plane.getObjectByName('propeller');
    if (propeller) {
        propeller.rotation.z += 0.3;
    }

    renderer.render(scene, camera);
}

// Initialize and start the game directly
init();
animate(); 