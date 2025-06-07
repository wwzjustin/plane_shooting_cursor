import * as THREE from 'three';

// Game State class for tracking game progress and statistics
export class GameState {
    constructor() {
        this.score = 0;
        this.ufosDestroyed = 0;
        this.totalUFOsSpawned = 0;
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.gameStartTime = Date.now();
        this.gameEndTime = null;
        this.gameStatus = 'playing'; // 'playing', 'won', 'lost', 'paused'
        this.level = 1;
        this.pointsPerUFO = 100;
        this.accuracyBonus = 0;
        this.timeBonus = 0;
        
        // Statistics
        this.stats = {
            shotsFired: 0,
            shotsHit: 0,
            accuracy: 0,
            playTime: 0,
            maxCombo: 0,
            currentCombo: 0,
            fastestKill: Infinity,
            longestSurvival: 0
        };
        
        // Achievements
        this.achievements = {
            firstKill: false,
            sharpshooter: false, // 90% accuracy with 50+ shots
            survivor: false, // Survive 5 minutes
            destroyer: false, // Destroy 100 UFOs
            perfectRound: false // Complete level without taking damage
        };
    }
    
    // Score management
    addScore(points, reason = 'ufo_destroyed') {
        this.score += points;
        
        if (reason === 'ufo_destroyed') {
            this.ufosDestroyed++;
            this.stats.currentCombo++;
            this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.currentCombo);
            
            // Check for first kill achievement
            if (this.ufosDestroyed === 1) {
                this.unlockAchievement('firstKill');
            }
            
            // Check for destroyer achievement
            if (this.ufosDestroyed >= 100) {
                this.unlockAchievement('destroyer');
            }
        }
        
        return this.score;
    }
    
    resetCombo() {
        this.stats.currentCombo = 0;
    }
    
    // Health management
    takeDamage(damage) {
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        this.resetCombo(); // Reset combo on taking damage
        
        if (this.playerHealth <= 0) {
            this.gameStatus = 'lost';
            this.gameEndTime = Date.now();
        }
        
        return this.playerHealth;
    }
    
    heal(amount) {
        this.playerHealth = Math.min(this.maxPlayerHealth, this.playerHealth + amount);
        return this.playerHealth;
    }
    
    // Weapon statistics
    recordShot() {
        this.stats.shotsFired++;
        this.updateAccuracy();
    }
    
    recordHit() {
        this.stats.shotsHit++;
        this.updateAccuracy();
        
        // Check for sharpshooter achievement
        if (this.stats.accuracy >= 90 && this.stats.shotsFired >= 50) {
            this.unlockAchievement('sharpshooter');
        }
    }
    
    updateAccuracy() {
        this.stats.accuracy = this.stats.shotsFired > 0 ? 
            (this.stats.shotsHit / this.stats.shotsFired) * 100 : 0;
    }
    
    // Time management
    updatePlayTime() {
        if (this.gameStatus === 'playing') {
            this.stats.playTime = (Date.now() - this.gameStartTime) / 1000;
            
            // Check for survivor achievement
            if (this.stats.playTime >= 300) { // 5 minutes
                this.unlockAchievement('survivor');
            }
        }
    }
    
    // Achievement system
    unlockAchievement(achievementKey) {
        if (!this.achievements[achievementKey]) {
            this.achievements[achievementKey] = true;
            return true; // Achievement unlocked
        }
        return false; // Already unlocked
    }
    
    // Game state management
    pauseGame() {
        if (this.gameStatus === 'playing') {
            this.gameStatus = 'paused';
        }
    }
    
    resumeGame() {
        if (this.gameStatus === 'paused') {
            this.gameStatus = 'playing';
        }
    }
    
    endGame(won = false) {
        this.gameStatus = won ? 'won' : 'lost';
        this.gameEndTime = Date.now();
        
        // Calculate bonuses
        this.calculateBonuses();
        
        // Check for perfect round achievement
        if (won && this.playerHealth === this.maxPlayerHealth) {
            this.unlockAchievement('perfectRound');
        }
    }
    
    calculateBonuses() {
        // Accuracy bonus
        this.accuracyBonus = Math.floor(this.stats.accuracy * 10);
        
        // Time bonus (faster completion = more points)
        const timeInMinutes = this.stats.playTime / 60;
        this.timeBonus = Math.max(0, Math.floor((10 - timeInMinutes) * 50));
        
        // Add bonuses to score
        this.score += this.accuracyBonus + this.timeBonus;
    }
    
    // Getters for UI
    getScore() {
        return this.score;
    }
    
    getHealth() {
        return this.playerHealth;
    }
    
    getHealthPercentage() {
        return (this.playerHealth / this.maxPlayerHealth) * 100;
    }
    
    getAccuracy() {
        return Math.round(this.stats.accuracy * 10) / 10; // Round to 1 decimal
    }
    
    getPlayTime() {
        return this.stats.playTime;
    }
    
    getFormattedPlayTime() {
        const minutes = Math.floor(this.stats.playTime / 60);
        const seconds = Math.floor(this.stats.playTime % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    getGameStatus() {
        return this.gameStatus;
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    getAchievements() {
        return { ...this.achievements };
    }
}

// UI Manager class for handling game UI elements
export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.crosshairVisible = true;
        this.uiVisible = true;
        
        this.createUIElements();
        this.setupEventListeners();
    }
    
    createUIElements() {
        // Score display
        this.elements.score = document.createElement('div');
        this.elements.score.id = 'score-display';
        this.elements.score.className = 'ui-element';
        this.elements.score.innerHTML = 'Score: 0';
        document.body.appendChild(this.elements.score);
        
        // UFO counter
        this.elements.ufoCounter = document.createElement('div');
        this.elements.ufoCounter.id = 'ufo-counter';
        this.elements.ufoCounter.className = 'ui-element';
        this.elements.ufoCounter.innerHTML = 'UFOs: 0';
        document.body.appendChild(this.elements.ufoCounter);
        
        // Health bar
        this.elements.healthBar = document.createElement('div');
        this.elements.healthBar.id = 'health-bar';
        this.elements.healthBar.className = 'ui-element';
        this.elements.healthBar.innerHTML = `
            <div class="health-label">Health</div>
            <div class="health-bar-container">
                <div class="health-bar-fill" id="health-bar-fill"></div>
            </div>
        `;
        document.body.appendChild(this.elements.healthBar);
        
        // Crosshair
        this.elements.crosshair = document.createElement('div');
        this.elements.crosshair.id = 'crosshair';
        this.elements.crosshair.className = 'ui-element';
        this.elements.crosshair.innerHTML = '+';
        document.body.appendChild(this.elements.crosshair);
        
        // Accuracy display
        this.elements.accuracy = document.createElement('div');
        this.elements.accuracy.id = 'accuracy-display';
        this.elements.accuracy.className = 'ui-element';
        this.elements.accuracy.innerHTML = 'Accuracy: 0%';
        document.body.appendChild(this.elements.accuracy);
        
        // Time display
        this.elements.time = document.createElement('div');
        this.elements.time.id = 'time-display';
        this.elements.time.className = 'ui-element';
        this.elements.time.innerHTML = 'Time: 0:00';
        document.body.appendChild(this.elements.time);
        
        // Combo display
        this.elements.combo = document.createElement('div');
        this.elements.combo.id = 'combo-display';
        this.elements.combo.className = 'ui-element';
        this.elements.combo.innerHTML = '';
        document.body.appendChild(this.elements.combo);
        
        // Achievement notifications
        this.elements.achievements = document.createElement('div');
        this.elements.achievements.id = 'achievement-notifications';
        this.elements.achievements.className = 'ui-element';
        document.body.appendChild(this.elements.achievements);
        
        // Weapon information display
        this.elements.weaponInfo = document.createElement('div');
        this.elements.weaponInfo.id = 'weapon-info';
        this.elements.weaponInfo.className = 'ui-element';
        this.elements.weaponInfo.innerHTML = `
            <div class="weapon-header">
                <div class="weapon-name">Machine Gun</div>
                <div class="weapon-description">Fast firing, low damage</div>
            </div>
            <div class="weapon-ammo">Ammo: 30/30</div>
            <div class="weapon-reload-bar" id="weapon-reload-bar" style="display: none;">
                <div class="reload-label">Reloading...</div>
                <div class="reload-bar-container">
                    <div class="reload-bar-fill" id="reload-bar-fill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.elements.weaponInfo);
        
        // Weapon selection panel
        this.elements.weaponSelection = document.createElement('div');
        this.elements.weaponSelection.id = 'weapon-selection';
        this.elements.weaponSelection.className = 'ui-element';
        this.elements.weaponSelection.innerHTML = `
            <div class="weapon-selection-title">WEAPONS</div>
            <div class="weapon-option" data-weapon="0">
                <span class="weapon-key">1</span>
                <span class="weapon-info">
                    <span class="weapon-option-name">Machine Gun</span>
                    <span class="weapon-stats">DMG:1 | ROF:Fast | Ammo:30</span>
                </span>
            </div>
            <div class="weapon-option" data-weapon="1">
                <span class="weapon-key">2</span>
                <span class="weapon-info">
                    <span class="weapon-option-name">Cannon</span>
                    <span class="weapon-stats">DMG:3 | ROF:Slow | Ammo:8</span>
                </span>
            </div>
            <div class="weapon-option" data-weapon="2">
                <span class="weapon-key">3</span>
                <span class="weapon-info">
                    <span class="weapon-option-name">Plasma Gun</span>
                    <span class="weapon-stats">DMG:2 | ROF:Med | Ammo:15</span>
                </span>
            </div>
            <div class="weapon-option" data-weapon="3">
                <span class="weapon-key">4</span>
                <span class="weapon-info">
                    <span class="weapon-option-name">Rocket Launcher</span>
                    <span class="weapon-stats">DMG:5 | ROF:V.Slow | Ammo:4</span>
                </span>
            </div>
            <div class="weapon-controls">
                <div><strong>Controls:</strong></div>
                <div>• 1-4: Select Weapon</div>
                <div>• R: Manual Reload</div>
                <div>• Ctrl+Scroll: Cycle Weapons</div>
                <div>• Space/Click: Fire</div>
            </div>
        `;
        document.body.appendChild(this.elements.weaponSelection);
    }
    
    setupEventListeners() {
        // Tab key to toggle UI visibility
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                this.toggleUI();
            }
        });
    }
    
    update() {
        if (!this.uiVisible) return;
        
        // Update score
        this.elements.score.innerHTML = `Score: ${this.gameState.getScore().toLocaleString()}`;
        
        // Update health bar
        const healthPercentage = this.gameState.getHealthPercentage();
        const healthFill = document.getElementById('health-bar-fill');
        if (healthFill) {
            healthFill.style.width = `${healthPercentage}%`;
            
            // Color based on health level
            if (healthPercentage > 60) {
                healthFill.style.backgroundColor = '#00ff00';
            } else if (healthPercentage > 30) {
                healthFill.style.backgroundColor = '#ffff00';
            } else {
                healthFill.style.backgroundColor = '#ff0000';
            }
        }
        
        // Update accuracy
        this.elements.accuracy.innerHTML = `Accuracy: ${this.gameState.getAccuracy()}%`;
        
        // Update time
        this.elements.time.innerHTML = `Time: ${this.gameState.getFormattedPlayTime()}`;
        
        // Update combo
        const combo = this.gameState.stats.currentCombo;
        if (combo > 1) {
            this.elements.combo.innerHTML = `Combo: ${combo}x`;
            this.elements.combo.style.display = 'block';
        } else {
            this.elements.combo.style.display = 'none';
        }
    }
    
    updateUFOCounter(active, destroyed, total) {
        if (this.uiVisible) {
            this.elements.ufoCounter.innerHTML = `UFOs: ${active} | Destroyed: ${destroyed}`;
        }
    }
    
    updateWeaponInfo(weaponStats) {
        if (!this.uiVisible) return;
        
        const { currentWeapon, currentAmmo, isReloading, reloadProgress } = weaponStats;
        
        // Update current weapon display
        const weaponNameElement = this.elements.weaponInfo.querySelector('.weapon-name');
        const weaponDescElement = this.elements.weaponInfo.querySelector('.weapon-description');
        if (weaponNameElement && weaponDescElement) {
            weaponNameElement.innerHTML = currentWeapon;
            weaponNameElement.style.color = this.getWeaponColor(currentWeapon);
            weaponDescElement.innerHTML = this.getWeaponDescription(currentWeapon);
        }
        
        // Update ammo display
        const weaponAmmoElement = this.elements.weaponInfo.querySelector('.weapon-ammo');
        if (weaponAmmoElement) {
            const maxAmmo = this.getWeaponMaxAmmo(currentWeapon);
            weaponAmmoElement.innerHTML = `Ammo: ${currentAmmo}/${maxAmmo}`;
            
            // Color code ammo based on level
            if (currentAmmo === 0) {
                weaponAmmoElement.style.color = '#ff0000';
            } else if (currentAmmo <= maxAmmo * 0.3) {
                weaponAmmoElement.style.color = '#ffff00';
            } else {
                weaponAmmoElement.style.color = '#ffffff';
            }
        }
        
        // Update reload bar
        const reloadBarElement = document.getElementById('weapon-reload-bar');
        const reloadFillElement = document.getElementById('reload-bar-fill');
        
        if (reloadBarElement && reloadFillElement) {
            if (isReloading) {
                reloadBarElement.style.display = 'block';
                reloadFillElement.style.width = `${reloadProgress * 100}%`;
            } else {
                reloadBarElement.style.display = 'none';
            }
        }
        
        // Highlight current weapon in selection panel
        const weaponOptions = this.elements.weaponSelection.querySelectorAll('.weapon-option');
        const currentWeaponIndex = this.getWeaponIndex(currentWeapon);
        
        weaponOptions.forEach((option, index) => {
            if (index === currentWeaponIndex) {
                option.classList.add('active');
                option.style.backgroundColor = 'rgba(255,255,255,0.2)';
                option.style.borderLeftColor = this.getWeaponColor(currentWeapon);
            } else {
                option.classList.remove('active');
                option.style.backgroundColor = 'transparent';
                option.style.borderLeftColor = 'transparent';
            }
        });
    }
    
    getWeaponColor(weaponName) {
        const colors = {
            'Machine Gun': '#ffff00',
            'Cannon': '#ff4400',
            'Plasma Gun': '#00ffff',
            'Rocket Launcher': '#ff0000'
        };
        return colors[weaponName] || '#ffffff';
    }
    
    getWeaponMaxAmmo(weaponName) {
        const maxAmmo = {
            'Machine Gun': 30,
            'Cannon': 8,
            'Plasma Gun': 15,
            'Rocket Launcher': 4
        };
        return maxAmmo[weaponName] || 30;
    }
    
    getWeaponDescription(weaponName) {
        const descriptions = {
            'Machine Gun': 'Fast firing, low damage',
            'Cannon': 'Slow firing, high damage',
            'Plasma Gun': 'Energy weapon, no gravity',
            'Rocket Launcher': 'Devastating damage, very slow'
        };
        return descriptions[weaponName] || 'Unknown weapon';
    }
    
    getWeaponIndex(weaponName) {
        const indices = {
            'Machine Gun': 0,
            'Cannon': 1,
            'Plasma Gun': 2,
            'Rocket Launcher': 3
        };
        return indices[weaponName] || 0;
    }
    
    showAchievement(achievementName) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${this.getAchievementDisplayName(achievementName)}</div>
        `;
        
        this.elements.achievements.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    getAchievementDisplayName(key) {
        const names = {
            firstKill: 'First Blood',
            sharpshooter: 'Sharpshooter',
            survivor: 'Survivor',
            destroyer: 'UFO Destroyer',
            perfectRound: 'Perfect Round'
        };
        return names[key] || key;
    }
    
    toggleUI() {
        this.uiVisible = !this.uiVisible;
        
        Object.values(this.elements).forEach(element => {
            if (element.id !== 'crosshair') { // Keep crosshair always visible
                element.style.display = this.uiVisible ? 'block' : 'none';
            }
        });
    }
    
    toggleCrosshair() {
        this.crosshairVisible = !this.crosshairVisible;
        this.elements.crosshair.style.display = this.crosshairVisible ? 'block' : 'none';
    }
    
    showGameOver(won = false) {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'game-over-screen';
        gameOverDiv.className = 'ui-element';
        
        const stats = this.gameState.getStats();
        const achievements = this.gameState.getAchievements();
        const unlockedAchievements = Object.keys(achievements).filter(key => achievements[key]);
        
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h1>${won ? 'Victory!' : 'Game Over'}</h1>
                <div class="final-stats">
                    <div class="stat">Final Score: ${this.gameState.getScore().toLocaleString()}</div>
                    <div class="stat">UFOs Destroyed: ${this.gameState.ufosDestroyed}</div>
                    <div class="stat">Accuracy: ${this.gameState.getAccuracy()}%</div>
                    <div class="stat">Play Time: ${this.gameState.getFormattedPlayTime()}</div>
                    <div class="stat">Max Combo: ${stats.maxCombo}x</div>
                </div>
                <div class="achievements-summary">
                    <h3>Achievements Unlocked: ${unlockedAchievements.length}/5</h3>
                    ${unlockedAchievements.map(key => 
                        `<div class="achievement">${this.getAchievementDisplayName(key)}</div>`
                    ).join('')}
                </div>
                <div class="restart-prompt">Press R to restart or ESC to quit</div>
            </div>
        `;
        
        document.body.appendChild(gameOverDiv);
    }
    
    hideGameOver() {
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
    }
    
    dispose() {
        // Remove all UI elements
        Object.values(this.elements).forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
} 