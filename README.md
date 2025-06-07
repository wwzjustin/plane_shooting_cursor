# 3D Plane Game ✈️

A thrilling 3D aerial combat game built with Three.js featuring immersive flight physics, multi-weapon combat system, and dynamic audio.

## 🎮 Play the Game

**[Play Now on GitHub Pages](https://wwzjustin.github.io/plane_shooting_cursor/)**

## 🚀 Features

### Flight System
- **Realistic Flight Physics**: Quaternion-based rotation with natural aircraft movement
- **Intuitive Controls**: WASD for pitch/roll, QE for speed control
- **Dynamic Camera**: Follow-cam and free orbit modes
- **Smooth Performance**: 60 FPS target with frame-rate independent physics

### Combat System
- **4 Unique Weapons**:
  - **Machine Gun**: Fast firing, low damage (30 rounds)
  - **Cannon**: Slow firing, high damage (8 rounds)
  - **Plasma Gun**: Energy weapon, precise (15 rounds)
  - **Rocket Launcher**: Devastating, explosive (4 rounds)
- **Advanced UFO AI**: Multiple movement patterns and behaviors
- **Spectacular Effects**: Explosions, muzzle flashes, particle systems
- **Strategic Gameplay**: Weapon switching, manual reload, ammo management

### Audio Experience
- **Immersive Background Music**: "Bullets in the Sky" soundtrack
- **Dynamic Sound Effects**: Weapon-specific audio, explosions, UI feedback
- **Professional Audio**: Web Audio API implementation

### Visual Features
- **Detailed Aircraft Model**: Professional-grade plane with realistic components
- **Infinite City Environment**: Procedurally generated urban landscape
- **Advanced Lighting**: Ambient and directional lighting systems
- **Particle Effects**: Explosions, tracers, and muzzle flashes

## 🎯 Controls

### Flight Controls
- **W/S**: Pitch Up/Down
- **A/D**: Roll Left/Right
- **Q/E**: Speed Down/Up
- **C**: Toggle Camera View

### Combat Controls
- **Space/Click**: Fire Weapons
- **1-4**: Select Weapon Type
- **R**: Manual Reload
- **Ctrl+Scroll**: Cycle Weapons
- **TAB**: Toggle UI

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Local Development
```bash
# Clone the repository
git clone https://github.com/wwzjustin/plane_shooting_cursor.git
cd plane_shooting_cursor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Project Structure
```
3d-plane-game/
├── index.html          # Main HTML file
├── main.js             # Game initialization and main loop
├── style.css           # Game styling
├── plane.js            # Aircraft model and components
├── city.js             # Infinite city environment
├── controls.js         # Flight controls and input handling
├── audio/
│   └── audioManager.js # Audio system management
├── combat/
│   ├── index.js        # Combat system coordinator
│   ├── weapons.js      # Weapon system and projectiles
│   ├── ufo.js          # UFO models and AI
│   ├── effects.js      # Explosion and particle effects
│   └── gameState.js    # Game state and UI management
└── docs/
    └── Bullets in the Sky.mp3  # Background music
```

## 🎨 Technical Highlights

### Performance Optimizations
- **Object Pooling**: Efficient projectile management
- **Collision Detection**: Optimized sphere-based collision system
- **Frame-Rate Independence**: Delta time-based physics
- **Asset Management**: Proper resource loading and cleanup

### Modern Web Technologies
- **Three.js**: 3D graphics rendering
- **Web Audio API**: Professional audio management
- **ES6 Modules**: Clean, modular code architecture
- **Vite**: Fast development and optimized builds

### Browser Compatibility
- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design for different screen sizes

## 📝 Game Mechanics

### Objective
Pilot your aircraft through an infinite city environment while engaging UFOs in aerial combat. Use different weapons strategically to maximize your score and survival time.

### Scoring System
- Base points per UFO destroyed
- Weapon damage multipliers
- Combo bonuses for consecutive hits
- Accuracy and time bonuses

### Weapon Strategy
- **Machine Gun**: Best for sustained fire and multiple targets
- **Cannon**: High damage for tough enemies
- **Plasma Gun**: Precise shots with no bullet drop
- **Rocket Launcher**: Maximum damage but limited ammo

## 🏆 Achievements
- **First Blood**: Destroy your first UFO
- **Sharpshooter**: Achieve 90% accuracy
- **Survivor**: Survive for 5 minutes
- **Destroyer**: Destroy 100 UFOs
- **Perfect Round**: Complete without taking damage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js community for the excellent 3D library
- Background music: "Bullets in the Sky"
- Inspiration from classic aerial combat games

---

**Enjoy the skies, pilot! ✈️🎮** 