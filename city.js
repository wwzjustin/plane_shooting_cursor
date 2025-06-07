import * as THREE from 'three';

// Infinite city system
export class InfiniteCity {
    constructor(scene) {
        this.scene = scene;
        this.buildings = new Map(); // Store buildings by grid coordinates
        this.streets = new Map(); // Store streets by grid coordinates
        this.lastPlayerChunk = { x: 0, z: 0 };
        this.chunkSize = 4; // Size of each building block
        this.renderDistance = 15; // Number of chunks to render around player
        
        // Create materials once
        this.buildingMaterials = [
            new THREE.MeshPhongMaterial({ color: 0x808080 }), // Residential - light gray
            new THREE.MeshPhongMaterial({ color: 0x607080 }), // Commercial - blue-gray
            new THREE.MeshPhongMaterial({ color: 0x606060 }), // Office - dark gray
            new THREE.MeshPhongMaterial({ color: 0x705050 })  // Industrial - brown-gray
        ];
        
        this.streetMaterial = new THREE.MeshPhongMaterial({ color: 0x505050 });
        this.groundMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
        
        // Create base ground plane (large but finite)
        const baseGroundGeometry = new THREE.PlaneGeometry(1000, 1000);
        this.baseGround = new THREE.Mesh(baseGroundGeometry, this.groundMaterial);
        this.baseGround.rotation.x = -Math.PI / 2;
        this.baseGround.position.set(0, -2, 0);
        this.scene.add(this.baseGround);
    }
    
    // Convert world position to chunk coordinates
    worldToChunk(x, z) {
        return {
            x: Math.floor(x / this.chunkSize),
            z: Math.floor(z / this.chunkSize)
        };
    }
    
    // Convert chunk coordinates to world position
    chunkToWorld(chunkX, chunkZ) {
        return {
            x: chunkX * this.chunkSize,
            z: chunkZ * this.chunkSize
        };
    }
    
    // Generate a deterministic random number based on coordinates
    seededRandom(x, z, seed = 0) {
        const hash = ((x * 73856093) ^ (z * 19349663) ^ (seed * 83492791)) >>> 0;
        return (hash % 1000) / 1000;
    }
    
    // Create a building at specific chunk coordinates
    createBuilding(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        
        // Skip if building already exists
        if (this.buildings.has(key)) return;
        
        // Skip central area (around origin)
        if (Math.abs(chunkX) <= 1 && Math.abs(chunkZ) <= 1) return;
        
        const worldPos = this.chunkToWorld(chunkX, chunkZ);
        
        // Generate deterministic random height
        const heightRandom = this.seededRandom(chunkX, chunkZ, 1);
        const height = 3 + heightRandom * 9; // 3 to 12
        
        // Generate deterministic material
        const materialRandom = this.seededRandom(chunkX, chunkZ, 2);
        const materialIndex = Math.floor(materialRandom * 4);
        
        // Create building
        const buildingGeometry = new THREE.BoxGeometry(3, height, 3);
        const building = new THREE.Mesh(buildingGeometry, this.buildingMaterials[materialIndex]);
        building.position.set(worldPos.x, height / 2 - 2, worldPos.z);
        
        this.scene.add(building);
        this.buildings.set(key, building);
    }
    
    // Create streets around a chunk
    createStreets(chunkX, chunkZ) {
        const hStreetKey = `h_${chunkX},${chunkZ}`;
        const vStreetKey = `v_${chunkX},${chunkZ}`;
        
        const worldPos = this.chunkToWorld(chunkX, chunkZ);
        
        // Create horizontal street
        if (!this.streets.has(hStreetKey)) {
            const hStreetGeometry = new THREE.PlaneGeometry(this.chunkSize, 1);
            const hStreet = new THREE.Mesh(hStreetGeometry, this.streetMaterial);
            hStreet.rotation.x = -Math.PI / 2;
            hStreet.position.set(worldPos.x, -1.99, worldPos.z + this.chunkSize / 2);
            this.scene.add(hStreet);
            this.streets.set(hStreetKey, hStreet);
        }
        
        // Create vertical street
        if (!this.streets.has(vStreetKey)) {
            const vStreetGeometry = new THREE.PlaneGeometry(1, this.chunkSize);
            const vStreet = new THREE.Mesh(vStreetGeometry, this.streetMaterial);
            vStreet.rotation.x = -Math.PI / 2;
            vStreet.position.set(worldPos.x + this.chunkSize / 2, -1.99, worldPos.z);
            this.scene.add(vStreet);
            this.streets.set(vStreetKey, vStreet);
        }
    }
    
    // Remove buildings and streets that are too far away
    cleanup(playerChunk) {
        // Remove distant buildings
        for (const [key, building] of this.buildings) {
            const [chunkX, chunkZ] = key.split(',').map(Number);
            const distance = Math.max(
                Math.abs(chunkX - playerChunk.x),
                Math.abs(chunkZ - playerChunk.z)
            );
            
            if (distance > this.renderDistance + 5) { // Extra buffer before cleanup
                this.scene.remove(building);
                building.geometry.dispose();
                this.buildings.delete(key);
            }
        }
        
        // Remove distant streets
        for (const [key, street] of this.streets) {
            const coordPart = key.substring(2); // Remove "h_" or "v_" prefix
            const [chunkX, chunkZ] = coordPart.split(',').map(Number);
            const distance = Math.max(
                Math.abs(chunkX - playerChunk.x),
                Math.abs(chunkZ - playerChunk.z)
            );
            
            if (distance > this.renderDistance + 5) {
                this.scene.remove(street);
                street.geometry.dispose();
                this.streets.delete(key);
            }
        }
    }
    
    // Update city based on player position
    update(playerPosition) {
        const playerChunk = this.worldToChunk(playerPosition.x, playerPosition.z);
        
        // Only update if player moved to a different chunk
        if (playerChunk.x === this.lastPlayerChunk.x && playerChunk.z === this.lastPlayerChunk.z) {
            return;
        }
        
        // Generate buildings and streets around player
        for (let x = playerChunk.x - this.renderDistance; x <= playerChunk.x + this.renderDistance; x++) {
            for (let z = playerChunk.z - this.renderDistance; z <= playerChunk.z + this.renderDistance; z++) {
                this.createBuilding(x, z);
                this.createStreets(x, z);
            }
        }
        
        // Clean up distant chunks
        this.cleanup(playerChunk);
        
        this.lastPlayerChunk = playerChunk;
    }
}

// Legacy function for backward compatibility
export function createCity() {
    // This function is no longer used but kept for compatibility
    return new THREE.Group();
} 