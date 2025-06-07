import * as THREE from 'three';
import { UFOManager } from './ufo.js';
import { WeaponSystem } from './weapons.js';
import { EffectsManager } from './effects.js';
import { GameState, UIManager } from './gameState.js';

// Collision Detection utility
class CollisionDetector {
    static checkSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < (radius1 + radius2);
    }
    
    static checkProjectileUFOCollisions(projectiles, ufos) {
        const collisions = [];
        
        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i];
            if (!projectile.isActive()) continue;
            
            for (let j = 0; j < ufos.length; j++) {
                const ufo = ufos[j];
                
                if (this.checkSphereCollision(
                    projectile.getPosition(),
                    projectile.getCollisionRadius(),
                    ufo.getPosition(),
                    ufo.getCollisionRadius()
                )) {
                    collisions.push({
                        projectileIndex: i,
                        ufoIndex: j,
                        position: ufo.getPosition()
                    });
                    break; // One projectile can only hit one UFO
                }
            }
        }
        
        return collisions;
    }
    
    static checkPlaneUFOCollisions(planePosition, planeRadius, ufos) {
        const collisions = [];
        
        for (let i = 0; i < ufos.length; i++) {
            const ufo = ufos[i];
            
            if (this.checkSphereCollision(
                planePosition,
                planeRadius,
                ufo.getPosition(),
                ufo.getCollisionRadius()
            )) {
                collisions.push({
                    ufoIndex: i,
                    position: ufo.getPosition()
                });
            }
        }
        
        return collisions;
    }
}

// Main Combat System class
export class CombatSystem {
    constructor(scene, plane, cityManager, audioManager = null) {
        this.scene = scene;
        this.plane = plane;
        this.cityManager = cityManager;
        this.audioManager = audioManager;
        
        // Initialize combat components
        this.ufoManager = new UFOManager(scene, cityManager);
        this.weaponSystem = new WeaponSystem(scene, plane, audioManager);
        this.effectsManager = new EffectsManager(scene);
        this.gameState = new GameState();
        this.uiManager = new UIManager(this.gameState);
        
        // Combat settings
        this.planeCollisionRadius = 2.0;
        this.damagePerCollision = 25;
        this.invulnerabilityTime = 2.0; // seconds
        this.lastDamageTime = 0;
        
        // Performance optimization
        this.collisionCheckInterval = 0.016; // ~60fps
        this.lastCollisionCheck = 0;
        
        this.setupEventListeners();
        this.addUIStyles();
    }
    
    setupEventListeners() {
        // Shooting input
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                this.weaponSystem.isFiring = true;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (event.key === ' ') {
                this.weaponSystem.isFiring = false;
            }
        });
        
        // Mouse shooting
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.weaponSystem.isFiring = true;
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.weaponSystem.isFiring = false;
            }
        });
    }
    
    addUIStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ui-element {
                position: fixed;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                z-index: 1000;
                pointer-events: none;
            }
            
            #score-display {
                top: 20px;
                left: 20px;
                font-size: 20px;
                font-weight: bold;
            }
            
            #ufo-counter {
                top: 50px;
                left: 20px;
            }
            
            #health-bar {
                bottom: 20px;
                left: 20px;
                width: 200px;
            }
            
            .health-label {
                margin-bottom: 5px;
            }
            
            .health-bar-container {
                width: 100%;
                height: 20px;
                background-color: rgba(255,255,255,0.2);
                border: 2px solid white;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .health-bar-fill {
                height: 100%;
                background-color: #00ff00;
                transition: width 0.3s ease, background-color 0.3s ease;
            }
            
            #crosshair {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                font-weight: bold;
                color: rgba(255,255,255,0.8);
            }
            
            #accuracy-display {
                top: 20px;
                right: 20px;
            }
            
            #time-display {
                top: 50px;
                right: 20px;
            }
            
            #weapon-info {
                bottom: 20px;
                right: 20px;
                background: rgba(0,0,0,0.7);
                padding: 15px;
                border-radius: 8px;
                border: 2px solid rgba(255,255,255,0.3);
                min-width: 200px;
            }
            
            .weapon-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                text-align: center;
            }
            
            .weapon-ammo {
                font-size: 16px;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .weapon-reload-bar {
                margin-bottom: 10px;
            }
            
            .reload-label {
                font-size: 12px;
                margin-bottom: 3px;
                color: #ffff00;
            }
            
            .reload-bar-container {
                width: 100%;
                height: 8px;
                background-color: rgba(255,255,255,0.2);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .reload-bar-fill {
                height: 100%;
                background-color: #ffff00;
                transition: width 0.1s ease;
            }
            
            .weapon-controls {
                font-size: 11px;
                color: rgba(255,255,255,0.7);
                border-top: 1px solid rgba(255,255,255,0.2);
                padding-top: 8px;
                margin-top: 8px;
            }
            
            .weapon-controls div {
                margin: 2px 0;
            }
            
            #combo-display {
                top: 80px;
                right: 20px;
                font-size: 18px;
                font-weight: bold;
                color: #ffff00;
                display: none;
            }
            
            #achievement-notifications {
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
            }
            
            .achievement-notification {
                background-color: rgba(0,0,0,0.8);
                border: 2px solid #ffff00;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 10px;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.5s ease;
            }
            
            .achievement-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .achievement-title {
                font-size: 14px;
                color: #ffff00;
                margin-bottom: 5px;
            }
            
            .achievement-name {
                font-size: 16px;
                font-weight: bold;
            }
            
            #game-over-screen {
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .game-over-content {
                text-align: center;
                max-width: 600px;
                padding: 40px;
                background-color: rgba(0,0,0,0.8);
                border: 3px solid white;
                border-radius: 20px;
            }
            
            .game-over-content h1 {
                font-size: 48px;
                margin-bottom: 30px;
                color: #ffff00;
            }
            
            .final-stats {
                margin-bottom: 30px;
            }
            
            .stat {
                font-size: 18px;
                margin-bottom: 10px;
            }
            
            .achievements-summary {
                margin-bottom: 30px;
            }
            
            .achievements-summary h3 {
                color: #ffff00;
                margin-bottom: 15px;
            }
            
            .achievement {
                font-size: 16px;
                margin-bottom: 5px;
                color: #00ff00;
            }
            
            .restart-prompt {
                font-size: 20px;
                color: #ffff00;
                animation: blink 1.5s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }
        `;
        document.head.appendChild(style);
    }
    
    update(deltaTime, input) {
        // Update game time
        this.gameState.updatePlayTime();
        
        // Update combat systems
        this.ufoManager.update(deltaTime, this.plane.position);
        
        // Track shots fired before updating weapon system
        const shotsBefore = this.weaponSystem.shotsFired;
        this.weaponSystem.update(deltaTime);
        const shotsAfter = this.weaponSystem.shotsFired;
        
        // Record new shots in game state
        if (shotsAfter > shotsBefore) {
            for (let i = 0; i < (shotsAfter - shotsBefore); i++) {
                this.gameState.recordShot();
            }
        }
        
        this.effectsManager.update(deltaTime);
        
        // Check collisions at intervals for performance
        this.lastCollisionCheck += deltaTime;
        if (this.lastCollisionCheck >= this.collisionCheckInterval) {
            this.checkCollisions();
            this.lastCollisionCheck = 0;
        }
        
        // Update UI
        this.uiManager.update();
        const ufoStats = this.ufoManager.getStats();
        this.uiManager.updateUFOCounter(ufoStats.active, ufoStats.totalDestroyed, ufoStats.totalSpawned);
        
        // Update weapon info
        const weaponStats = this.weaponSystem.getStats();
        this.uiManager.updateWeaponInfo(weaponStats);
    }
    
    checkCollisions() {
        const projectiles = this.weaponSystem.getProjectiles();
        const ufos = this.ufoManager.getUFOs();
        
        // Check projectile-UFO collisions
        const projectileCollisions = CollisionDetector.checkProjectileUFOCollisions(projectiles, ufos);
        
        for (const collision of projectileCollisions) {
            this.handleProjectileUFOCollision(collision);
        }
        
        // Check plane-UFO collisions (with invulnerability period)
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastDamageTime > this.invulnerabilityTime) {
            const planeCollisions = CollisionDetector.checkPlaneUFOCollisions(
                this.plane.position,
                this.planeCollisionRadius,
                ufos
            );
            
            if (planeCollisions.length > 0) {
                this.handlePlaneUFOCollision(planeCollisions[0]);
                this.lastDamageTime = currentTime;
            }
        }
    }
    
    handleProjectileUFOCollision(collision) {
        const { projectileIndex, ufoIndex, position } = collision;
        
        // Get projectile to access damage value
        const projectile = this.weaponSystem.getProjectiles()[projectileIndex];
        const damage = projectile.getDamage();
        
        // Destroy projectile
        this.weaponSystem.removeProjectile(projectileIndex);
        
        // Damage UFO with weapon-specific damage
        const ufo = this.ufoManager.getUFOs()[ufoIndex];
        const destroyed = ufo.takeDamage(damage);
        
        // Record hit
        this.weaponSystem.recordHit();
        this.gameState.recordHit();
        
        if (destroyed) {
            // Create explosion (larger for higher damage weapons)
            const explosionSize = 1.0 + (damage * 0.3);
            this.effectsManager.createExplosion(position, explosionSize);
            
            // Play explosion sound
            if (this.audioManager) {
                this.audioManager.playSound('explosion');
            }
            
            // Remove UFO
            this.ufoManager.destroyUFO(ufoIndex);
            
            // Add score (higher for more powerful weapons)
            const baseScore = this.gameState.pointsPerUFO;
            const weaponMultiplier = damage;
            const comboMultiplier = Math.min(this.gameState.stats.currentCombo, 10);
            const totalScore = (baseScore * weaponMultiplier) + (baseScore * comboMultiplier * 0.1);
            this.gameState.addScore(Math.floor(totalScore));
            
            // Check for achievements
            this.checkAchievements();
        } else {
            // Create smaller hit effect (scaled by damage)
            const hitEffectSize = 0.3 + (damage * 0.1);
            this.effectsManager.createExplosion(position, hitEffectSize);
            
            // Small score for hits
            this.gameState.addScore(10 * damage);
        }
    }
    
    handlePlaneUFOCollision(collision) {
        const { ufoIndex, position } = collision;
        
        // Create explosion at collision point
        this.effectsManager.createExplosion(position, 1.5);
        
        // Play explosion sound
        if (this.audioManager) {
            this.audioManager.playSound('explosion');
        }
        
        // Damage player
        this.gameState.takeDamage(this.damagePerCollision);
        
        // Destroy the UFO
        this.ufoManager.destroyUFO(ufoIndex);
        
        // Visual feedback (screen shake could be added here)
        console.log(`Player hit! Health: ${this.gameState.getHealth()}`);
    }
    
    checkAchievements() {
        const achievements = this.gameState.getAchievements();
        const previousAchievements = { ...achievements };
        
        // Check all achievements
        Object.keys(achievements).forEach(key => {
            if (!previousAchievements[key] && achievements[key]) {
                this.uiManager.showAchievement(key);
            }
        });
    }
    

    
    restartGame() {
        // Clean up existing game state
        this.uiManager.hideGameOver();
        
        // Reset all systems
        this.gameState = new GameState();
        this.uiManager.gameState = this.gameState;
        
        // Clear UFOs
        const ufos = this.ufoManager.getUFOs();
        for (let i = ufos.length - 1; i >= 0; i--) {
            this.ufoManager.removeUFO(i);
        }
        
        // Clear projectiles
        const projectiles = this.weaponSystem.getProjectiles();
        for (let i = projectiles.length - 1; i >= 0; i--) {
            this.weaponSystem.removeProjectile(i);
        }
        
        // Reset weapon system stats
        this.weaponSystem.shotsFired = 0;
        this.weaponSystem.shotsHit = 0;
        
        // Reset UFO manager
        this.ufoManager.totalSpawned = 0;
        this.ufoManager.totalDestroyed = 0;
        this.ufoManager.lastSpawnTime = 0;
        
        console.log('Game restarted!');
    }
    
    // Public API for external systems
    getGameState() {
        return this.gameState;
    }
    
    getUIManager() {
        return this.uiManager;
    }
    
    isGameActive() {
        return this.gameState.getGameStatus() === 'playing';
    }
    
    reset() {
        // Reset all combat systems
        this.restartGame();
    }
    
    dispose() {
        // Clean up all systems
        this.uiManager.dispose();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
} 