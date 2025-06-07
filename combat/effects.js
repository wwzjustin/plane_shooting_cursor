import * as THREE from 'three';

// Explosion Effect class
export class ExplosionEffect {
    constructor(position, scale = 1) {
        this.position = position.clone();
        this.scale = scale;
        this.age = 0;
        this.maxAge = 2; // 2 seconds duration
        this.active = true;
        this.systems = [];
        
        this.createExplosion();
    }
    
    createExplosion() {
        // Primary explosion particles
        this.createPrimaryExplosion();
        
        // Secondary explosion particles
        this.createSecondaryExplosion();
        
        // Flash effect
        this.createFlashEffect();
        
        // Debris system
        this.createDebrisSystem();
        
        // Smoke trail
        this.createSmokeTrail();
    }
    
    createPrimaryExplosion() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = Math.random() * 2 * this.scale;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = this.position.x + x * 0.1;
            positions[i * 3 + 1] = this.position.y + y * 0.1;
            positions[i * 3 + 2] = this.position.z + z * 0.1;
            
            // Velocity outward from explosion center
            const velocity = new THREE.Vector3(x, y, z).normalize().multiplyScalar(15 + Math.random() * 25);
            velocities.push(velocity);
            
            // Orange to red gradient
            const colorMix = Math.random();
            colors[i * 3] = 1.0; // Red
            colors[i * 3 + 1] = 0.3 + colorMix * 0.7; // Green
            colors[i * 3 + 2] = 0.0; // Blue
            
            sizes[i] = 0.5 + Math.random() * 1.0;
        }
        
        this.primaryGeometry = new THREE.BufferGeometry();
        this.primaryGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.primaryGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.primaryGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const primaryMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 1.0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vOpacity;
                uniform float time;
                uniform float opacity;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity * (1.0 - time * 0.5);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + time * 2.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = (1.0 - distance * 2.0) * vOpacity;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.primaryParticles = new THREE.Points(this.primaryGeometry, primaryMaterial);
        this.primaryVelocities = velocities;
        this.systems.push({
            particles: this.primaryParticles,
            velocities: velocities,
            type: 'primary'
        });
    }
    
    createSecondaryExplosion() {
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Smaller, slower particles
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = Math.random() * 1.5 * this.scale;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = this.position.x;
            positions[i * 3 + 1] = this.position.y;
            positions[i * 3 + 2] = this.position.z;
            
            const velocity = new THREE.Vector3(x, y, z).normalize().multiplyScalar(5 + Math.random() * 10);
            velocities.push(velocity);
        }
        
        this.secondaryGeometry = new THREE.BufferGeometry();
        this.secondaryGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const secondaryMaterial = new THREE.PointsMaterial({
            color: 0x444444,
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.secondaryParticles = new THREE.Points(this.secondaryGeometry, secondaryMaterial);
        this.systems.push({
            particles: this.secondaryParticles,
            velocities: velocities,
            type: 'secondary'
        });
    }
    
    createFlashEffect() {
        const flashGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        
        this.flash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.flash.position.copy(this.position);
        this.systems.push({
            particles: this.flash,
            type: 'flash'
        });
    }
    
    createDebrisSystem() {
        const debrisCount = 20;
        this.debris = [];
        
        for (let i = 0; i < debrisCount; i++) {
            const debrisGeometry = new THREE.BoxGeometry(
                0.1 + Math.random() * 0.2,
                0.1 + Math.random() * 0.2,
                0.1 + Math.random() * 0.2
            );
            const debrisMaterial = new THREE.MeshPhongMaterial({
                color: 0x666666,
                shininess: 30
            });
            
            const debrisPiece = new THREE.Mesh(debrisGeometry, debrisMaterial);
            debrisPiece.position.copy(this.position);
            
            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                Math.random() * 15 + 5,
                (Math.random() - 0.5) * 20
            );
            
            // Random angular velocity
            const angularVelocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            this.debris.push({
                mesh: debrisPiece,
                velocity: velocity,
                angularVelocity: angularVelocity,
                age: 0
            });
            
            this.systems.push({
                particles: debrisPiece,
                type: 'debris'
            });
        }
    }
    
    createSmokeTrail() {
        const smokeCount = 50;
        const positions = new Float32Array(smokeCount * 3);
        const velocities = [];
        const sizes = new Float32Array(smokeCount);
        
        for (let i = 0; i < smokeCount; i++) {
            positions[i * 3] = this.position.x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = this.position.y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = this.position.z + (Math.random() - 0.5) * 2;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 2
            );
            velocities.push(velocity);
            
            sizes[i] = 0.5 + Math.random() * 1.0;
        }
        
        this.smokeGeometry = new THREE.BufferGeometry();
        this.smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.smokeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const smokeMaterial = new THREE.PointsMaterial({
            color: 0x555555,
            size: 1.0,
            transparent: true,
            opacity: 0.6,
            map: this.createSmokeTexture()
        });
        
        this.smoke = new THREE.Points(this.smokeGeometry, smokeMaterial);
        this.smokeVelocities = velocities;
        this.systems.push({
            particles: this.smoke,
            velocities: velocities,
            type: 'smoke'
        });
    }
    
    createSmokeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.age += deltaTime;
        
        if (this.age > this.maxAge) {
            this.active = false;
            return;
        }
        
        const progress = this.age / this.maxAge;
        
        // Update primary explosion
        if (this.primaryParticles) {
            const positions = this.primaryGeometry.attributes.position.array;
            for (let i = 0; i < this.primaryVelocities.length; i++) {
                positions[i * 3] += this.primaryVelocities[i].x * deltaTime;
                positions[i * 3 + 1] += this.primaryVelocities[i].y * deltaTime;
                positions[i * 3 + 2] += this.primaryVelocities[i].z * deltaTime;
                
                // Apply gravity to debris
                this.primaryVelocities[i].y -= 9.8 * deltaTime;
            }
            this.primaryGeometry.attributes.position.needsUpdate = true;
            this.primaryParticles.material.uniforms.time.value = progress;
            this.primaryParticles.material.uniforms.opacity.value = 1 - progress;
        }
        
        // Update secondary explosion
        if (this.secondaryParticles) {
            const positions = this.secondaryGeometry.attributes.position.array;
            const velocities = this.systems.find(s => s.type === 'secondary').velocities;
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3] += velocities[i].x * deltaTime;
                positions[i * 3 + 1] += velocities[i].y * deltaTime;
                positions[i * 3 + 2] += velocities[i].z * deltaTime;
            }
            this.secondaryGeometry.attributes.position.needsUpdate = true;
            this.secondaryParticles.material.opacity = (1 - progress) * 0.8;
        }
        
        // Update flash effect
        if (this.flash) {
            const flashProgress = Math.min(progress * 10, 1); // Flash fades quickly
            this.flash.scale.setScalar(1 + flashProgress * 10);
            this.flash.material.opacity = 1 - flashProgress;
        }
        
        // Update debris
        for (const debris of this.debris) {
            debris.age += deltaTime;
            
            // Update position
            debris.mesh.position.add(debris.velocity.clone().multiplyScalar(deltaTime));
            
            // Apply gravity
            debris.velocity.y -= 9.8 * deltaTime;
            
            // Update rotation
            debris.mesh.rotation.x += debris.angularVelocity.x * deltaTime;
            debris.mesh.rotation.y += debris.angularVelocity.y * deltaTime;
            debris.mesh.rotation.z += debris.angularVelocity.z * deltaTime;
            
            // Fade out
            debris.mesh.material.opacity = Math.max(0, 1 - debris.age / this.maxAge);
        }
        
        // Update smoke
        if (this.smoke) {
            const positions = this.smokeGeometry.attributes.position.array;
            for (let i = 0; i < this.smokeVelocities.length; i++) {
                positions[i * 3] += this.smokeVelocities[i].x * deltaTime;
                positions[i * 3 + 1] += this.smokeVelocities[i].y * deltaTime;
                positions[i * 3 + 2] += this.smokeVelocities[i].z * deltaTime;
            }
            this.smokeGeometry.attributes.position.needsUpdate = true;
            this.smoke.material.opacity = (1 - progress) * 0.6;
        }
    }
    
    isActive() {
        return this.active;
    }
    
    getParticleSystems() {
        return this.systems.map(s => s.particles);
    }
    
    dispose() {
        // Dispose of all geometries and materials
        this.systems.forEach(system => {
            if (system.particles.geometry) system.particles.geometry.dispose();
            if (system.particles.material) {
                if (Array.isArray(system.particles.material)) {
                    system.particles.material.forEach(material => material.dispose());
                } else {
                    system.particles.material.dispose();
                }
            }
        });
        
        this.debris.forEach(debris => {
            if (debris.mesh.geometry) debris.mesh.geometry.dispose();
            if (debris.mesh.material) debris.mesh.material.dispose();
        });
    }
}

// Effects Manager class
export class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.explosions = [];
    }
    
    createExplosion(position, scale = 1) {
        const explosion = new ExplosionEffect(position, scale);
        
        // Add all particle systems to scene
        explosion.getParticleSystems().forEach(system => {
            this.scene.add(system);
        });
        
        this.explosions.push(explosion);
        return explosion;
    }
    
    update(deltaTime) {
        // Update all active explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.update(deltaTime);
            
            if (!explosion.isActive()) {
                this.removeExplosion(i);
            }
        }
    }
    
    removeExplosion(index) {
        if (index >= 0 && index < this.explosions.length) {
            const explosion = this.explosions[index];
            
            // Remove all particle systems from scene
            explosion.getParticleSystems().forEach(system => {
                this.scene.remove(system);
            });
            
            // Dispose of resources
            explosion.dispose();
            
            this.explosions.splice(index, 1);
        }
    }
    
    getActiveExplosions() {
        return this.explosions.length;
    }
} 