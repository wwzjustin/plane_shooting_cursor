# 3D Plane Game - Product Requirements Document

## 1. Requirements

### Core Gameplay
- **Player Control**: Control a 3D plane flying over a city environment
- **Combat System**: Shoot projectiles to destroy UFOs hovering over the city
- **Enemy Behavior**: UFOs should hover and move around the city as targets
- **Collision Detection**: Accurate hit detection between projectiles and UFOs
- **Visual Feedback**: Explosion effects when UFOs are destroyed
- **Win/Lose Conditions**: Clear victory and defeat states

### User Interface
- **Start Screen**: Initial game menu to begin playing
- **Victory Screen**: Displayed when all UFOs are destroyed
- **Lose Screen**: Displayed when game over conditions are met
- **Simple Controls**: Intuitive keyboard/mouse controls for plane movement and shooting

### Audio Experience
- **Background Music**: Atmospheric music during gameplay
- **Sound Effects**: Audio feedback for shooting, explosions, and other game events
- **Audio Controls**: Basic volume control or mute functionality

### Visual Requirements
- **3D Environment**: Immersive 3D city landscape
- **Realistic Plane Model**: Detailed aircraft that responds to player input
- **UFO Models**: Distinctive alien spacecraft designs
- **Particle Effects**: Explosion and shooting effects
- **Smooth Performance**: 60 FPS target on modern browsers

## 2. Tech Stack

### Core Technologies
- **Three.js**: 3D graphics rendering and scene management
- **JavaScript (ES6+)**: Primary programming language
- **HTML5**: Game container and UI structure
- **CSS3**: Styling for UI elements and screens

### Development Tools
- **Vite**: Build tool and development server
- **Node.js**: Development environment and package management
- **npm**: Package manager for dependencies

### Asset Management
- **GLTF/GLB**: 3D model format for plane and UFO models
- **Web Audio API**: Sound and music playback
- **Texture Loading**: Image assets for materials and UI

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebGL Support**: Required for Three.js rendering
- **Responsive Design**: Adaptable to different screen sizes

## 3. Milestones

### Milestone 1: Create Detailed Plane Model ✅ COMPLETED
**Goal**: Implement a highly detailed and realistic 3D plane model with professional appearance

**Deliverables**:
- ✅ **Detailed Fuselage**: Multi-section fuselage with nose cone, main body, and tapered tail section
- ✅ **Cockpit Features**: Transparent canopy with metal frame and realistic proportions
- ✅ **Realistic Wings**: Tapered wing design with wing root, wing tips, leading edge details, and functional ailerons
- ✅ **Detailed Tail Assembly**: Vertical stabilizer with rudder, horizontal stabilizers with elevators
- ✅ **Engine System**: Detailed engine cowling with cooling fins, propeller hub, and spinner cone
- ✅ **Advanced Propeller**: Realistic airfoil-shaped blades using extruded geometry for authentic appearance
- ✅ **Landing Gear**: Retractable landing gear system with detailed struts and wheels (main and nose gear)
- ✅ **Navigation Lights**: Red/green wingtip lights and white tail strobe light for realism
- ✅ **Engine Details**: Exhaust pipes with subtle emissive glow effects
- ✅ **Professional Materials**: Multiple material types with proper shininess, specular highlights, and transparency
- ✅ **Optimized Performance**: Scaled appropriately for game performance while maintaining visual quality

**Success Criteria**:
- ✅ Plane model exhibits professional aircraft appearance with realistic proportions
- ✅ All components are properly positioned and scaled relative to each other
- ✅ Materials provide appropriate visual feedback with lighting
- ✅ Model maintains smooth performance in the game environment
- ✅ Propeller animation works correctly with the detailed blade geometry
- ✅ Navigation lights enhance visual realism during flight

**Technical Implementation**:
- **Modular Design**: Organized into logical component groups (fuselage, wings, tail, engine, landing gear)
- **Advanced Geometry**: Uses ExtrudeGeometry for propeller blades, SphereGeometry for canopy, ConeGeometry for nose
- **Material System**: Six distinct materials (fuselage, wing, metal, glass, propeller, engine) with proper lighting properties
- **Performance Optimization**: 0.8x scale factor maintains compatibility with existing flight physics
- **Component Naming**: Named groups for propeller animation and potential future landing gear retraction

### Milestone 2: Build City Environment
**Goal**: Create an immersive 3D city landscape for the game setting

**Deliverables**:
- Design and implement a city layout with buildings
- Add ground/terrain for the city base
- Implement proper lighting for the urban environment
- Add basic textures and materials to buildings
- Optimize performance for smooth rendering

**Success Criteria**:
- City environment is visually appealing and immersive
- Buildings have varied heights and layouts
- Performance remains smooth with full city rendered
- Lighting creates appropriate atmosphere

### Milestone 3: Set Up Plane Controls
**Goal**: Implement responsive and intuitive plane movement controls

**Deliverables**:
- Keyboard controls for plane movement (WASD or arrow keys)
- Mouse controls for camera/view direction
- Smooth plane physics and movement mechanics
- Camera system that follows the plane appropriately
- Boundary system to keep plane within game area

Flight controls:
- W/S: Pitch control (±60° limit) with auto-centering
- A/D: Roll control with natural yaw coupling (IMPORTANT: use negative sign in yaw calculation: yaw += -roll * sensitivity * deltaTime)
- Q/E: Speed control (10-50 units range)
- Input normalization (-1 to 1) with sensitivity parameters (pitch=0.8, turn=1.5, roll=2.0)

Physics model:
- Quaternion-based rotation (YXZ order) for natural aircraft movement
- Bank-proportional turning with 45° maximum bank angle
- Auto-leveling system when no inputs are detected
- Delta time scaling for consistent physics regardless of frame rate
- Forward movement based on current orientation and speed

Camera system:
- Positioned behind and above plane using quaternion offset
- Smoothly follows plane using lerp-based transitions
- Maintains proper orientation during all maneuvers
- Toggle between follow-cam and free orbit mode ('C' key)

UI overlay:
- Control reference at bottom left (key mappings)
- Visual speed indicator with color-coded feedback
- Responsive and clean visual style

Initial setup:
- Position plane above and outside city, approaching inward
- Set initial airspeed to 30 units
- Start with slight nose-down attitude for natural descent approach

**Success Criteria**:
- Plane responds smoothly to player input
- Controls feel intuitive and responsive
- Camera provides good gameplay perspective
- Plane movement feels realistic and engaging

### Milestone 4: Add UFOs, Shooting, and Explosions ✅ ENHANCED
**Goal**: Implement advanced combat mechanics with multiple weapon systems and strategic enemy placement

**Deliverables**:
- ✅ **Multiple Weapon Types**: Four distinct weapons with unique characteristics:
  - **Machine Gun**: Fast firing (0.1s), low damage (1), 30 rounds, 2s reload
  - **Cannon**: Slow firing (0.8s), high damage (3), 8 rounds, 4s reload  
  - **Plasma Gun**: Energy weapon (0.3s), medium damage (2), 15 rounds, 3s reload, no gravity
  - **Rocket Launcher**: Very slow (1.5s), devastating damage (5), 4 rounds, 6s reload
- ✅ **Weapon Switching System**: Number keys (1-4), Ctrl+scroll wheel, full ammo on switch
- ✅ **Reload Mechanics**: Manual reload (R key), automatic reload when empty, visual progress bar
- ✅ **Enhanced Projectile System**: Weapon-specific visuals, damage values, and physics
- ✅ **Strategic UFO Placement**: Spawn 80-200 units from player (balanced for visibility and challenge)
- ✅ **Damage-Based Scoring**: Higher damage weapons provide more points per kill
- ✅ **Visual Weapon Feedback**: Weapon-specific muzzle flashes, projectile trails, explosion sizes
- ✅ **Comprehensive Weapon UI**: Real-time weapon info, ammo counter, reload progress, detailed weapon selection panel with controls guide

**Success Criteria**:
- ✅ Four distinct weapons each feel unique and serve different tactical purposes
- ✅ Weapon switching is intuitive and responsive
- ✅ Reload system adds strategic depth to combat
- ✅ UFOs spawn at challenging but fair distances
- ✅ Scoring system rewards skillful weapon selection
- ✅ Visual feedback clearly communicates weapon states and effects
- ✅ UI provides all necessary weapon information without cluttering the screen

### Milestone 5: Add Music, Sound Effects, and Game Screens
**Goal**: Complete the game experience with audio and UI polish

**Deliverables**:
- Implement start screen with game title and play button
- Add victory screen for successful completion
- Create lose screen for game over scenarios
- Integrate background music during gameplay
- Add sound effects for shooting, explosions, and UI interactions
- Implement basic game state management
- Add restart functionality

**Success Criteria**:
- Complete game flow from start to finish
- Audio enhances the gaming experience
- All screens are functional and visually appealing
- Game can be replayed without refresh
- Professional presentation and user experience

## Development Notes

- Keep the scope simple and focused on core gameplay
- Prioritize performance and browser compatibility
- Use placeholder assets initially, polish later
- Test frequently on target browsers
- Maintain clean, modular code structure
- Document any external dependencies or assets used 