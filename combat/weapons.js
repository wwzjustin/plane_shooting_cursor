import * as THREE from 'three';

// Weapon Type Definitions
export const WeaponTypes = {
    MACHINE_GUN: {
        name: 'Machine Gun',
        fireRate: 0.1, // seconds between shots
        reloadTime: 2.0, // seconds to reload
        magazineSize: 30,
        damage: 1,
        projectileSpeed: 120,
        projectileColor: 0xffff00,
        spread: 0.02, // accuracy spread
        sound: 'machinegun',
        description: 'Fast firing, low damage'
    },
    CANNON: {
        name: 'Cannon',
        fireRate: 0.8, // slower firing
        reloadTime: 4.0, // longer reload
        magazineSize: 8,
        damage: 3,
        projectileSpeed: 100,
        projectileColor: 0xff4400,
        spread: 0.01, // more accurate
        sound: 'cannon',
        description: 'Slow firing, high damage'
    },
    PLASMA: {
        name: 'Plasma Gun',
        fireRate: 0.3,
        reloadTime: 3.0,
        magazineSize: 15,
        damage: 2,
        projectileSpeed: 150,
        projectileColor: 0x00ffff,
        spread: 0.005, // very accurate
        sound: 'plasma',
        description: 'Energy weapon, precise'
    },
    ROCKET: {
        name: 'Rocket Launcher',
        fireRate: 1.5, // very slow
        reloadTime: 6.0, // very long reload
        magazineSize: 4,
        damage: 5,
        projectileSpeed: 80,
        projectileColor: 0xff0000,
        spread: 0.03, // less accurate
        sound: 'rocket',
        description: 'Explosive, devastating'
    }
};

// Enhanced Projectile class with weapon-specific properties
export class Projectile {
    constructor(position, direction, weaponType, speed = null) {
        this.weaponType = weaponType;
        this.position = position.clone();
        this.speed = speed || weaponType.projectileSpeed;
        this.velocity = direction.clone().normalize().multiplyScalar(this.speed);
        this.age = 0;
        this.maxAge = 8; // Extended flight time
        this.collisionRadius = weaponType.name === 'Rocket Launcher' ? 0.3 : 0.1;
        this.gravity = weaponType.name === 'Plasma Gun' ? 0 : -15; // Plasma ignores gravity
        this.active = true;
        this.damage = weaponType.damage;
        
        this.createModel();
        this.createTracer();
    }
    
    createModel() {
        let geometry, material;
        
        switch (this.weaponType.name) {
            case 'Machine Gun':
                geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6);
                material = new THREE.MeshBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    emissive: this.weaponType.projectileColor,
                    emissiveIntensity: 0.3
                });
                break;
                
            case 'Cannon':
                geometry = new THREE.SphereGeometry(0.08, 8, 8);
                material = new THREE.MeshBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    emissive: this.weaponType.projectileColor,
                    emissiveIntensity: 0.5
                });
                break;
                
            case 'Plasma Gun':
                geometry = new THREE.SphereGeometry(0.06, 12, 12);
                material = new THREE.MeshBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    emissive: this.weaponType.projectileColor,
                    emissiveIntensity: 0.8,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            case 'Rocket Launcher':
                geometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
                material = new THREE.MeshBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    emissive: this.weaponType.projectileColor,
                    emissiveIntensity: 0.4
                });
                break;
                
            default:
                geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
                material = new THREE.MeshBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    emissive: this.weaponType.projectileColor,
            emissiveIntensity: 0.5
        });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Orient projectile in direction of travel
        const direction = this.velocity.clone().normalize();
        this.mesh.lookAt(this.position.clone().add(direction));
        if (this.weaponType.name !== 'Plasma Gun') {
        this.mesh.rotateX(Math.PI / 2); // Align with cylinder axis
        }
    }
    
    createTracer() {
        const tracerPoints = [
            this.position.clone(),
            this.position.clone()
        ];
        this.tracerGeometry = new THREE.BufferGeometry().setFromPoints(tracerPoints);
        
        let tracerMaterial;
        switch (this.weaponType.name) {
            case 'Plasma Gun':
                tracerMaterial = new THREE.LineBasicMaterial({ 
                    color: this.weaponType.projectileColor,
                    transparent: true,
                    opacity: 1.0,
                    linewidth: 3
                });
                break;
            case 'Rocket Launcher':
                tracerMaterial = new THREE.LineBasicMaterial({ 
                    color: 0xff8800,
                    transparent: true,
                    opacity: 0.9,
                    linewidth: 4
                });
                break;
            default:
                tracerMaterial = new THREE.LineBasicMaterial({ 
                    color: this.weaponType.projectileColor,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        }
        
        this.tracerLine = new THREE.Line(this.tracerGeometry, tracerMaterial);
        this.tracerHistory = [this.position.clone()];
        this.maxTracerLength = this.weaponType.name === 'Plasma Gun' ? 15 : 10;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.age += deltaTime;
        
        // Check if projectile has expired
        if (this.age > this.maxAge) {
            this.active = false;
            return;
        }
        
        // Apply gravity to velocity (except plasma)
        if (this.gravity !== 0) {
        this.velocity.y += this.gravity * deltaTime;
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Update mesh position and orientation
        this.mesh.position.copy(this.position);
        const direction = this.velocity.clone().normalize();
        this.mesh.lookAt(this.position.clone().add(direction));
        if (this.weaponType.name !== 'Plasma Gun') {
        this.mesh.rotateX(Math.PI / 2);
        }
        
        // Update tracer trail
        this.tracerHistory.push(this.position.clone());
        if (this.tracerHistory.length > this.maxTracerLength) {
            this.tracerHistory.shift();
        }
        
        // Update tracer geometry
        this.tracerGeometry.setFromPoints(this.tracerHistory);
        this.tracerGeometry.attributes.position.needsUpdate = true;
        
        // Fade tracer over time
        const fadeAmount = Math.max(0, 1 - (this.age / this.maxAge));
        this.tracerLine.material.opacity = (this.weaponType.name === 'Plasma Gun' ? 1.0 : 0.8) * fadeAmount;
        
        // Check if projectile hit ground
        if (this.position.y < -2) {
            this.active = false;
        }
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getCollisionRadius() {
        return this.collisionRadius;
    }
    
    getDamage() {
        return this.damage;
    }
    
    isActive() {
        return this.active;
    }
    
    destroy() {
        this.active = false;
    }
    
    dispose() {
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.tracerGeometry) this.tracerGeometry.dispose();
        if (this.tracerLine.material) this.tracerLine.material.dispose();
    }
}

// Enhanced Muzzle Flash with weapon-specific effects
export class MuzzleFlash {
    constructor(position, direction, weaponType) {
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.weaponType = weaponType;
        this.age = 0;
        this.maxAge = weaponType.name === 'Rocket Launcher' ? 0.3 : 0.1;
        this.active = true;
        
        this.createEffect();
    }
    
    createEffect() {
        const particleCount = this.weaponType.name === 'Rocket Launcher' ? 40 : 20;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            const spread = this.weaponType.name === 'Plasma Gun' ? 0.1 : 0.3;
            const speed = this.weaponType.name === 'Rocket Launcher' ? 30 : 15;
            
            const velocity = new THREE.Vector3(
                this.direction.x + (Math.random() - 0.5) * spread,
                this.direction.y + (Math.random() - 0.5) * spread,
                this.direction.z + (Math.random() - 0.5) * spread
            ).normalize().multiplyScalar(speed + Math.random() * speed);
            
            velocities.push(velocity);
            
            positions[i * 3] = this.position.x;
            positions[i * 3 + 1] = this.position.y;
            positions[i * 3 + 2] = this.position.z;
        }
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        let color, size;
        switch (this.weaponType.name) {
            case 'Plasma Gun':
                color = 0x00ffff;
                size = 0.15;
                break;
            case 'Rocket Launcher':
                color = 0xff4400;
                size = 0.3;
                break;
            case 'Cannon':
                color = 0xff8800;
                size = 0.25;
                break;
            default:
                color = 0xffaa00;
                size = 0.2;
        }
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(this.geometry, material);
        this.velocities = velocities;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.age += deltaTime;
        
        if (this.age > this.maxAge) {
            this.active = false;
            return;
        }
        
        // Update particle positions
        const positions = this.geometry.attributes.position.array;
        for (let i = 0; i < this.velocities.length; i++) {
            positions[i * 3] += this.velocities[i].x * deltaTime;
            positions[i * 3 + 1] += this.velocities[i].y * deltaTime;
            positions[i * 3 + 2] += this.velocities[i].z * deltaTime;
        }
        this.geometry.attributes.position.needsUpdate = true;
        
        // Fade out over time
        const fadeAmount = 1 - (this.age / this.maxAge);
        this.particles.material.opacity = fadeAmount;
    }
    
    isActive() {
        return this.active;
    }
    
    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.particles.material) this.particles.material.dispose();
    }
}

// Enhanced Weapon System with multiple weapon types
export class WeaponSystem {
    constructor(scene, plane, audioManager = null) {
        this.scene = scene;
        this.plane = plane;
        this.audioManager = audioManager;
        
        // Weapon management
        this.currentWeaponIndex = 0;
        this.weapons = Object.values(WeaponTypes);
        this.currentWeapon = this.weapons[this.currentWeaponIndex];
        
        // Firing state
        this.isFiring = false;
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        this.currentAmmo = this.currentWeapon.magazineSize;
        
        // Projectile management
        this.projectiles = [];
        this.muzzleFlashes = [];
        this.projectilePool = [];
        this.poolSize = 200;
        
        // Statistics
        this.shotsFired = 0;
        this.shotsHit = 0;
        
        this.initializePool();
        this.setupWeaponSwitching();
    }
    
    setupWeaponSwitching() {
        document.addEventListener('keydown', (event) => {
            // Number keys 1-4 for weapon switching
            if (event.key >= '1' && event.key <= '4') {
                const weaponIndex = parseInt(event.key) - 1;
                if (weaponIndex < this.weapons.length) {
                    this.switchWeapon(weaponIndex);
                }
            }
            
            // R key for manual reload
            if (event.key === 'r' || event.key === 'R') {
                if (!this.isReloading && this.currentAmmo < this.currentWeapon.magazineSize) {
                    this.startReload();
                }
            }
        });
        
        // Mouse wheel for weapon switching
        document.addEventListener('wheel', (event) => {
            if (event.ctrlKey) { // Only when Ctrl is held
                event.preventDefault();
                if (event.deltaY > 0) {
                    this.switchToNextWeapon();
                } else {
                    this.switchToPreviousWeapon();
                }
            }
        });
    }
    
    switchWeapon(index) {
        if (index === this.currentWeaponIndex || this.isReloading) return;
        
        this.currentWeaponIndex = index;
        this.currentWeapon = this.weapons[this.currentWeaponIndex];
        this.currentAmmo = this.currentWeapon.magazineSize; // Full ammo on switch
        this.isReloading = false;
        
        // Play weapon switch sound
        if (this.audioManager) {
            this.audioManager.playSound('weaponSwitch');
        }
        
        console.log(`Switched to ${this.currentWeapon.name}`);
    }
    
    switchToNextWeapon() {
        const nextIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        this.switchWeapon(nextIndex);
    }
    
    switchToPreviousWeapon() {
        const prevIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
        this.switchWeapon(prevIndex);
    }
    
    startReload() {
        if (this.isReloading) return;
        
        this.isReloading = true;
        this.reloadStartTime = Date.now() / 1000;
        
        // Play reload sound
        if (this.audioManager) {
            this.audioManager.playSound('reload');
        }
        
        console.log(`Reloading ${this.currentWeapon.name}...`);
    }
    
    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.projectilePool.push(null);
        }
    }
    
    getProjectileFromPool() {
        for (let i = 0; i < this.projectilePool.length; i++) {
            if (this.projectilePool[i] === null) {
                return i;
            }
        }
        return -1; // Pool full
    }
    
    update(deltaTime) {
        const currentTime = Date.now() / 1000;
        
        // Handle reloading
        if (this.isReloading) {
            if (currentTime - this.reloadStartTime >= this.currentWeapon.reloadTime) {
                this.isReloading = false;
                this.currentAmmo = this.currentWeapon.magazineSize;
                console.log(`${this.currentWeapon.name} reloaded!`);
            }
        }
        
        // Handle firing
        if (this.isFiring && !this.isReloading) {
            if (currentTime - this.lastFireTime >= this.currentWeapon.fireRate) {
                if (this.currentAmmo > 0) {
            this.fire();
                    this.lastFireTime = currentTime;
                } else {
                    this.startReload();
                }
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            if (!projectile.isActive()) {
                this.removeProjectile(i);
            }
        }
        
        // Update muzzle flashes
        for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
            const flash = this.muzzleFlashes[i];
            flash.update(deltaTime);
            
            if (!flash.isActive()) {
                this.removeMuzzleFlash(i);
            }
        }
    }
    
    fire() {
        // Get firing position and direction from plane
        const planePosition = this.plane.position.clone();
        const planeQuaternion = this.plane.quaternion.clone();
        
        // Calculate muzzle position (front of plane)
        const muzzleOffset = new THREE.Vector3(0, 0, -3);
        muzzleOffset.applyQuaternion(planeQuaternion);
        const muzzlePosition = planePosition.clone().add(muzzleOffset);
        
        // Calculate firing direction with weapon spread
        const baseDirection = new THREE.Vector3(0, 0, -1);
        baseDirection.applyQuaternion(planeQuaternion);
        
        // Apply weapon spread
        const spread = this.currentWeapon.spread;
        const spreadDirection = baseDirection.clone();
        spreadDirection.x += (Math.random() - 0.5) * spread;
        spreadDirection.y += (Math.random() - 0.5) * spread;
        spreadDirection.z += (Math.random() - 0.5) * spread;
        spreadDirection.normalize();
        
        // Create projectile
        const projectile = new Projectile(muzzlePosition, spreadDirection, this.currentWeapon);
        this.projectiles.push(projectile);
        this.scene.add(projectile.mesh);
        this.scene.add(projectile.tracerLine);
        
        // Create muzzle flash
        const muzzleFlash = new MuzzleFlash(muzzlePosition, baseDirection, this.currentWeapon);
        this.muzzleFlashes.push(muzzleFlash);
        this.scene.add(muzzleFlash.particles);
        
        // Play shooting sound
        if (this.audioManager) {
            this.audioManager.playSound('shoot');
        }
        
        // Update ammo and stats
        this.currentAmmo--;
        this.shotsFired++;
    }
    
    removeProjectile(index) {
        if (index >= 0 && index < this.projectiles.length) {
            const projectile = this.projectiles[index];
            this.scene.remove(projectile.mesh);
            this.scene.remove(projectile.tracerLine);
            projectile.dispose();
            this.projectiles.splice(index, 1);
        }
    }
    
    removeMuzzleFlash(index) {
        if (index >= 0 && index < this.muzzleFlashes.length) {
            const flash = this.muzzleFlashes[index];
            this.scene.remove(flash.particles);
            flash.dispose();
            this.muzzleFlashes.splice(index, 1);
        }
    }
    
    getProjectiles() {
        return this.projectiles;
    }
    
    getCurrentWeapon() {
        return this.currentWeapon;
    }
    
    getCurrentAmmo() {
        return this.currentAmmo;
    }
    
    isCurrentlyReloading() {
        return this.isReloading;
    }
    
    getReloadProgress() {
        if (!this.isReloading) return 1.0;
        const currentTime = Date.now() / 1000;
        const elapsed = currentTime - this.reloadStartTime;
        return Math.min(elapsed / this.currentWeapon.reloadTime, 1.0);
    }
    
    recordShot() {
        this.shotsFired++;
    }
    
    recordHit() {
        this.shotsHit++;
    }
    
    getAccuracy() {
        return this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;
    }
    
    getStats() {
        return {
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            accuracy: this.getAccuracy(),
            currentWeapon: this.currentWeapon.name,
            currentAmmo: this.currentAmmo,
            isReloading: this.isReloading,
            reloadProgress: this.getReloadProgress()
        };
    }
} 