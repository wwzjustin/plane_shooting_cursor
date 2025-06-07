import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// InputManager class for keyboard input handling
export class InputManager {
    constructor() {
        this.keys = {};
        this.cameraTogglePressed = false;
        
        // Add event listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    getInput() {
        // Normalize inputs to -1 to 1 range
        let pitch = 0;
        let roll = 0;
        let throttle = 0;
        let cameraToggle = false;
        let shooting = false;
        
        // Pitch control (W/S)
        if (this.keys['w']) pitch += 1;
        if (this.keys['s']) pitch -= 1;
        
        // Roll control (A/D)
        if (this.keys['a']) roll -= 1;
        if (this.keys['d']) roll += 1;
        
        // Throttle control (Q/E)
        if (this.keys['q']) throttle -= 1;
        if (this.keys['e']) throttle += 1;
        
        // Shooting control (Space)
        if (this.keys[' ']) shooting = true;
        
        // Camera toggle (C) - only trigger once per press
        if (this.keys['c'] && !this.cameraTogglePressed) {
            cameraToggle = true;
            this.cameraTogglePressed = true;
        } else if (!this.keys['c']) {
            this.cameraTogglePressed = false;
        }
        
        return { pitch, roll, throttle, cameraToggle, shooting };
    }
}

// FlightControls class for physics calculations
export class FlightControls {
    constructor() {
        // Flight state
        this.speed = 30; // Initial speed
        this.pitch = -0.174; // Initial nose-down attitude (10°)
        this.roll = 0;
        this.yaw = 0;
        
        // Position and velocity
        this.position = new THREE.Vector3(-20, 20, -20);
        this.velocity = new THREE.Vector3();
        
        // Control sensitivity
        this.pitchSensitivity = 0.8;
        this.turnSensitivity = 1.5;
        this.rollSensitivity = 2.0;
        
        // Limits and constants
        this.autoLevelingRate = 0.02;
        this.maxBankAngle = 0.785; // 45°
        this.maxPitchAngle = 1.047; // 60°
        this.minSpeed = 10;
        this.maxSpeed = 50;
        
        // Working quaternion
        this.quaternion = new THREE.Quaternion();
        this.euler = new THREE.Euler();
    }
    
    update(input, deltaTime) {
        // Apply pitch input
        if (input.pitch !== 0) {
            this.pitch += input.pitch * this.pitchSensitivity * deltaTime;
            this.pitch = THREE.MathUtils.clamp(this.pitch, -this.maxPitchAngle, this.maxPitchAngle);
        }
        
        // Apply roll input
        if (input.roll !== 0) {
            this.roll += input.roll * this.rollSensitivity * deltaTime;
            this.roll = THREE.MathUtils.clamp(this.roll, -this.maxBankAngle, this.maxBankAngle);
        }
        
        // Calculate yaw from roll (bank-proportional turning with negative coupling)
        this.yaw += -this.roll * this.turnSensitivity * deltaTime;
        
        // Auto-leveling when no input
        if (input.pitch === 0) {
            this.pitch = THREE.MathUtils.lerp(this.pitch, 0, this.autoLevelingRate);
        }
        if (input.roll === 0) {
            this.roll = THREE.MathUtils.lerp(this.roll, 0, this.autoLevelingRate);
        }
        
        // Apply speed control
        if (input.throttle !== 0) {
            this.speed += input.throttle * 20 * deltaTime; // 20 units/sec change rate
            this.speed = THREE.MathUtils.clamp(this.speed, this.minSpeed, this.maxSpeed);
        }
        
        // Calculate forward velocity based on orientation and speed
        this.euler.set(this.pitch, this.yaw, this.roll, 'YXZ');
        this.quaternion.setFromEuler(this.euler);
        
        // Forward vector in local space (negative Z is forward)
        const forward = new THREE.Vector3(0, 0, -this.speed);
        forward.applyQuaternion(this.quaternion);
        
        // Update position
        this.velocity.copy(forward);
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
    
    getQuaternion() {
        return this.quaternion.clone();
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getSpeed() {
        return this.speed;
    }
    
    reset() {
        // Reset to initial state
        this.speed = 30;
        this.pitch = -0.174; // Initial nose-down attitude (10°)
        this.roll = 0;
        this.yaw = 0;
        this.position.set(-20, 20, -20);
        this.velocity.set(0, 0, 0);
    }
}

// CameraController class for camera management
export class CameraController {
    constructor(camera, plane) {
        this.camera = camera;
        this.plane = plane;
        this.isFollowMode = true;
        
        // Create OrbitControls for free camera mode
        this.orbitControls = new OrbitControls(camera, document.getElementById('game-container'));
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.enabled = false; // Start disabled
        
        // Camera follow settings
        this.followOffset = new THREE.Vector3(0, 2, 8);
        this.lerpFactor = 0.1;
        
        // Working vectors
        this.desiredPosition = new THREE.Vector3();
        this.lookAtTarget = new THREE.Vector3();
    }
    
    update(deltaTime) {
        if (this.isFollowMode) {
            // Follow mode: camera follows plane with fixed offset
            
            // Calculate desired camera position relative to plane
            this.desiredPosition.copy(this.followOffset);
            this.desiredPosition.applyQuaternion(this.plane.quaternion);
            this.desiredPosition.add(this.plane.position);
            
            // Smooth camera movement
            this.camera.position.lerp(this.desiredPosition, this.lerpFactor);
            
            // Look at plane
            this.lookAtTarget.copy(this.plane.position);
            this.camera.lookAt(this.lookAtTarget);
        } else {
            // Free mode: use OrbitControls
            this.orbitControls.target.copy(this.plane.position);
            this.orbitControls.update();
        }
    }
    
    toggleMode() {
        this.isFollowMode = !this.isFollowMode;
        
        if (this.isFollowMode) {
            // Switching to follow mode
            this.orbitControls.enabled = false;
        } else {
            // Switching to free mode
            this.orbitControls.enabled = true;
            this.orbitControls.target.copy(this.plane.position);
        }
    }
} 