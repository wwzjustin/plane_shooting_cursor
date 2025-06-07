import * as THREE from 'three';

// UFO class for individual UFO objects
export class UFO {
    constructor(position) {
        this.group = new THREE.Group();
        this.health = 3;
        this.maxHealth = 3;
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.behavior = null;
        this.age = 0;
        this.collisionRadius = 2.5;
        
        this.createModel();
        this.group.position.copy(this.position);
    }
    
    createModel() {
        // Main saucer body - flattened sphere
        const saucerGeometry = new THREE.SphereGeometry(2, 32, 16);
        saucerGeometry.scale(1, 0.4, 1); // Flatten the sphere
        const saucerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xc0c0c0,
            shininess: 100,
            specular: 0x444444
        });
        const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial);
        this.group.add(saucer);
        
        // Top dome - dark glass
        const domeGeometry = new THREE.SphereGeometry(1.2, 24, 12);
        const domeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x001122,
            transparent: true,
            opacity: 0.7,
            shininess: 200
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = 0.5;
        this.group.add(dome);
        
        // Bottom section with landing lights
        const bottomGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 24);
        const bottomMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x808080,
            shininess: 50
        });
        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottom.position.y = -0.5;
        this.group.add(bottom);
        
        // Landing lights around bottom edge
        const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const lightMaterial = new THREE.MeshPhongMaterial({ 
                color: lightColors[i],
                emissive: lightColors[i],
                emissiveIntensity: 0.3
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                Math.cos(angle) * 1.6,
                -0.6,
                Math.sin(angle) * 1.6
            );
            this.group.add(light);
        }
        
        // Antenna on top
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 1.2;
        this.group.add(antenna);
        
        // Antenna tip
        const tipGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const tipMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.y = 1.6;
        this.group.add(tip);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0088ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(glow);
    }
    
    setBehavior(behavior) {
        this.behavior = behavior;
        this.behavior.init(this);
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.behavior) {
            this.behavior.update(this, deltaTime);
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.group.position.copy(this.position);
        
        // Rotate UFO slowly
        this.group.rotation.y += 0.5 * deltaTime;
        
        // Animate landing lights
        const lights = this.group.children.slice(3, 9); // Landing lights
        lights.forEach((light, index) => {
            const intensity = 0.3 + 0.2 * Math.sin(this.age * 3 + index);
            light.material.emissiveIntensity = intensity;
        });
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        
        // Visual damage feedback
        if (this.health <= 0) {
            return true; // UFO destroyed
        } else {
            // Flash red when hit
            this.group.children.forEach(child => {
                if (child.material && child.material.color) {
                    const originalColor = child.material.color.clone();
                    child.material.color.setHex(0xff0000);
                    setTimeout(() => {
                        child.material.color.copy(originalColor);
                    }, 100);
                }
            });
        }
        return false;
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getCollisionRadius() {
        return this.collisionRadius;
    }
}

// UFO Behavior Classes
export class CircularBehavior {
    constructor(radius = 8, speed = 2) {
        this.radius = radius;
        this.speed = speed;
        this.angle = 0;
        this.center = new THREE.Vector3();
    }
    
    init(ufo) {
        this.center.copy(ufo.position);
        this.angle = Math.random() * Math.PI * 2;
    }
    
    update(ufo, deltaTime) {
        this.angle += this.speed * deltaTime;
        
        const x = this.center.x + Math.cos(this.angle) * this.radius;
        const z = this.center.z + Math.sin(this.angle) * this.radius;
        const y = this.center.y + Math.sin(ufo.age * 0.5) * 2; // Vertical bobbing
        
        ufo.position.set(x, y, z);
    }
}

export class FigureEightBehavior {
    constructor(width = 12, height = 8, speed = 1.5) {
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.t = 0;
        this.center = new THREE.Vector3();
    }
    
    init(ufo) {
        this.center.copy(ufo.position);
        this.t = Math.random() * Math.PI * 2;
    }
    
    update(ufo, deltaTime) {
        this.t += this.speed * deltaTime;
        
        // Figure-8 parametric equations
        const x = this.center.x + (this.width / 2) * Math.sin(this.t);
        const z = this.center.z + (this.height / 2) * Math.sin(this.t * 2);
        const y = this.center.y + Math.sin(ufo.age * 0.5) * 2; // Vertical bobbing
        
        ufo.position.set(x, y, z);
    }
}

// UFO Manager class
export class UFOManager {
    constructor(scene, cityManager) {
        this.scene = scene;
        this.cityManager = cityManager;
        this.ufos = [];
        this.maxUFOs = 15;
        this.spawnRate = 3; // seconds between spawns
        this.lastSpawnTime = 0;
        this.totalSpawned = 0;
        this.totalDestroyed = 0;
    }
    
    update(deltaTime, playerPosition) {
        // Update existing UFOs
        for (let i = this.ufos.length - 1; i >= 0; i--) {
            const ufo = this.ufos[i];
            ufo.update(deltaTime);
            
            // Remove UFOs that are too far from player
            const distance = ufo.position.distanceTo(playerPosition);
            if (distance > 200) {
                this.removeUFO(i);
            }
        }
        
        // Spawn new UFOs
        this.lastSpawnTime += deltaTime;
        if (this.lastSpawnTime >= this.spawnRate && this.ufos.length < this.maxUFOs) {
            this.spawnUFO(playerPosition);
            this.lastSpawnTime = 0;
        }
    }
    
    spawnUFO(playerPosition) {
        // Find a random position at a reasonable distance from the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120; // 80-200 units from player (visible but challenging)
        const height = 15 + Math.random() * 20; // 15-35 units high
        
        const spawnPosition = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * distance,
            height,
            playerPosition.z + Math.sin(angle) * distance
        );
        
        const ufo = new UFO(spawnPosition);
        
        // Assign random behavior
        const behaviors = [
            new CircularBehavior(8, 2),
            new FigureEightBehavior(12, 8, 1.5),
            new CircularBehavior(6, 3), // Smaller, faster circle
            new FigureEightBehavior(8, 6, 2) // Smaller, faster figure-8
        ];
        
        const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        ufo.setBehavior(randomBehavior);
        
        this.ufos.push(ufo);
        this.scene.add(ufo.group);
        this.totalSpawned++;
    }
    
    removeUFO(index) {
        if (index >= 0 && index < this.ufos.length) {
            const ufo = this.ufos[index];
            this.scene.remove(ufo.group);
            
            // Dispose of geometries and materials
            ufo.group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            
            this.ufos.splice(index, 1);
        }
    }
    
    destroyUFO(index) {
        if (index >= 0 && index < this.ufos.length) {
            this.totalDestroyed++;
            this.removeUFO(index);
            return true;
        }
        return false;
    }
    
    getUFOs() {
        return this.ufos;
    }
    
    getStats() {
        return {
            active: this.ufos.length,
            totalSpawned: this.totalSpawned,
            totalDestroyed: this.totalDestroyed,
            remaining: this.totalSpawned - this.totalDestroyed
        };
    }
} 