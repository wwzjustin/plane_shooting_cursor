import * as THREE from 'three';

export function createPlane() {
    // Create plane group to hold all components
    const plane = new THREE.Group();

    // Materials
    const fuselageMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2c3e50,
        shininess: 30,
        specular: 0x111111
    });
    const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x34495e,
        shininess: 20,
        specular: 0x222222
    });
    const metalMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x7f8c8d,
        shininess: 100,
        specular: 0x444444
    });
    const glassMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,
        transparent: true,
        opacity: 0.3,
        shininess: 100
    });
    const propellerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 50
    });
    const engineMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a,
        shininess: 80
    });

    // Create detailed fuselage with multiple sections
    const fuselageGroup = new THREE.Group();
    
    // Main fuselage body
    const fuselageGeometry = new THREE.CylinderGeometry(0.35, 0.25, 3.5, 16);
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    fuselageGroup.add(fuselage);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(0.35, 1.2, 16);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(0, 0, -2.35);
    fuselageGroup.add(nose);

    // Tail section
    const tailGeometry = new THREE.CylinderGeometry(0.25, 0.15, 1.0, 12);
    const tail = new THREE.Mesh(tailGeometry, fuselageMaterial);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(0, 0, 2.25);
    fuselageGroup.add(tail);

    // Cockpit canopy
    const canopyGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeometry, glassMaterial);
    canopy.position.set(0, 0.1, -0.8);
    canopy.scale.set(1, 0.8, 1.5);
    fuselageGroup.add(canopy);

    // Cockpit frame
    const frameGeometry = new THREE.TorusGeometry(0.4, 0.02, 8, 16, Math.PI);
    const frame = new THREE.Mesh(frameGeometry, metalMaterial);
    frame.position.set(0, 0.1, -0.8);
    frame.rotation.x = Math.PI / 2;
    fuselageGroup.add(frame);

    plane.add(fuselageGroup);

    // Create detailed main wings with airfoil shape
    const wingGroup = new THREE.Group();
    
    // Wing root (thicker part)
    const wingRootGeometry = new THREE.BoxGeometry(2.5, 0.25, 1.2);
    const wingRoot = new THREE.Mesh(wingRootGeometry, wingMaterial);
    wingGroup.add(wingRoot);

    // Wing tips (thinner, tapered)
    const wingTipGeometry = new THREE.BoxGeometry(1.8, 0.15, 0.8);
    
    const leftWingTip = new THREE.Mesh(wingTipGeometry, wingMaterial);
    leftWingTip.position.set(-2.15, 0, 0);
    wingGroup.add(leftWingTip);
    
    const rightWingTip = new THREE.Mesh(wingTipGeometry, wingMaterial);
    rightWingTip.position.set(2.15, 0, 0);
    wingGroup.add(rightWingTip);

    // Wing leading edge details
    const leadingEdgeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 6, 8);
    const leadingEdge = new THREE.Mesh(leadingEdgeGeometry, metalMaterial);
    leadingEdge.rotation.z = Math.PI / 2;
    leadingEdge.position.set(0, 0.05, -0.6);
    wingGroup.add(leadingEdge);

    // Ailerons
    const aileronGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.3);
    
    const leftAileron = new THREE.Mesh(aileronGeometry, wingMaterial);
    leftAileron.position.set(-2.5, -0.05, 0.3);
    wingGroup.add(leftAileron);
    
    const rightAileron = new THREE.Mesh(aileronGeometry, wingMaterial);
    rightAileron.position.set(2.5, -0.05, 0.3);
    wingGroup.add(rightAileron);

    wingGroup.position.set(0, -0.1, 0.2);
    plane.add(wingGroup);

    // Create detailed tail assembly
    const tailGroup = new THREE.Group();

    // Vertical stabilizer (rudder)
    const verticalStabilizerGeometry = new THREE.BoxGeometry(0.12, 1.8, 1.0);
    const verticalStabilizer = new THREE.Mesh(verticalStabilizerGeometry, wingMaterial);
    verticalStabilizer.position.set(0, 0.6, 0);
    tailGroup.add(verticalStabilizer);

    // Rudder detail
    const rudderGeometry = new THREE.BoxGeometry(0.08, 1.2, 0.4);
    const rudder = new THREE.Mesh(rudderGeometry, wingMaterial);
    rudder.position.set(0, 0.6, 0.3);
    tailGroup.add(rudder);

    // Horizontal stabilizers (elevators)
    const horizontalStabilizerGeometry = new THREE.BoxGeometry(2.2, 0.12, 0.7);
    const horizontalStabilizer = new THREE.Mesh(horizontalStabilizerGeometry, wingMaterial);
    horizontalStabilizer.position.set(0, 0.1, 0);
    tailGroup.add(horizontalStabilizer);

    // Elevators
    const elevatorGeometry = new THREE.BoxGeometry(1.8, 0.08, 0.25);
    const elevator = new THREE.Mesh(elevatorGeometry, wingMaterial);
    elevator.position.set(0, 0.05, 0.225);
    tailGroup.add(elevator);

    tailGroup.position.set(0, 0, 2.0);
    plane.add(tailGroup);

    // Create detailed engine and propeller assembly
    const engineGroup = new THREE.Group();

    // Engine cowling
    const engineGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.8, 12);
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.rotation.z = Math.PI / 2;
    engineGroup.add(engine);

    // Engine cooling fins
    for (let i = 0; i < 8; i++) {
        const finGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.6);
        const fin = new THREE.Mesh(finGeometry, metalMaterial);
        const angle = (i / 8) * Math.PI * 2;
        fin.position.set(0, Math.cos(angle) * 0.42, Math.sin(angle) * 0.42);
        fin.rotation.z = angle;
        engineGroup.add(fin);
    }

    // Propeller hub (more detailed)
    const propellerHubGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.25, 12);
    const propellerHub = new THREE.Mesh(propellerHubGeometry, metalMaterial);
    propellerHub.rotation.z = Math.PI / 2;
    propellerHub.position.set(0, 0, -0.525);
    engineGroup.add(propellerHub);

    // Spinner cone
    const spinnerGeometry = new THREE.ConeGeometry(0.18, 0.3, 12);
    const spinner = new THREE.Mesh(spinnerGeometry, metalMaterial);
    spinner.rotation.z = -Math.PI / 2;
    spinner.position.set(0, 0, -0.775);
    engineGroup.add(spinner);

    engineGroup.position.set(0, 0, -2.5);
    plane.add(engineGroup);

    // Create detailed propeller group for rotating blades
    const propellerGroup = new THREE.Group();
    propellerGroup.name = 'propeller';

    // Create more realistic propeller blades with airfoil shape
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(1.5, 0.1);
    bladeShape.lineTo(1.4, 0.05);
    bladeShape.lineTo(0.1, -0.02);
    bladeShape.lineTo(0, 0);

    const extrudeSettings = {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.01,
        bevelThickness: 0.01
    };

    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    
    // Create three propeller blades
    for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(bladeGeometry, propellerMaterial);
        blade.rotation.z = (i * 120) * Math.PI / 180;
        blade.position.set(0, 0, -0.04);
        propellerGroup.add(blade);
    }

    propellerGroup.position.set(0, 0, -2.65);
    plane.add(propellerGroup);

    // Create retractable landing gear
    const landingGearGroup = new THREE.Group();
    landingGearGroup.name = 'landingGear';

    // Main landing gear struts
    const strutGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    const strutMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });

    // Left main gear
    const leftStrutGroup = new THREE.Group();
    const leftStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    leftStrut.position.set(0, -0.3, 0);
    leftStrutGroup.add(leftStrut);

    // Left wheel
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftWheel.rotation.z = Math.PI / 2;
    leftWheel.position.set(0, -0.6, 0);
    leftStrutGroup.add(leftWheel);

    leftStrutGroup.position.set(-1.2, 0, 0.5);
    landingGearGroup.add(leftStrutGroup);

    // Right main gear
    const rightStrutGroup = leftStrutGroup.clone();
    rightStrutGroup.position.set(1.2, 0, 0.5);
    landingGearGroup.add(rightStrutGroup);

    // Nose gear
    const noseStrutGroup = new THREE.Group();
    const noseStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    noseStrut.position.set(0, -0.25, 0);
    noseStrutGroup.add(noseStrut);

    const noseWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, -0.5, 0);
    noseWheel.scale.set(0.8, 0.8, 0.8);
    noseStrutGroup.add(noseWheel);

    noseStrutGroup.position.set(0, 0, -1.8);
    landingGearGroup.add(noseStrutGroup);

    plane.add(landingGearGroup);

    // Add navigation lights
    const navLightGroup = new THREE.Group();

    // Red light (left wing tip)
    const redLightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const redLightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });
    const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);
    redLight.position.set(-3.0, 0, 0.2);
    navLightGroup.add(redLight);

    // Green light (right wing tip)
    const greenLightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
    });
    const greenLight = new THREE.Mesh(redLightGeometry, greenLightMaterial);
    greenLight.position.set(3.0, 0, 0.2);
    navLightGroup.add(greenLight);

    // White strobe light (tail)
    const whiteLightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.3
    });
    const whiteLight = new THREE.Mesh(redLightGeometry, whiteLightMaterial);
    whiteLight.position.set(0, 0.8, 2.0);
    navLightGroup.add(whiteLight);

    plane.add(navLightGroup);

    // Add exhaust pipes
    const exhaustGroup = new THREE.Group();
    
    for (let i = 0; i < 4; i++) {
        const exhaustGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8);
        const exhaustMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0x220000,
            emissiveIntensity: 0.1
        });
        const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaust.rotation.z = Math.PI / 2;
        
        const angle = (i / 4) * Math.PI * 2;
        exhaust.position.set(0, Math.cos(angle) * 0.25, Math.sin(angle) * 0.25);
        exhaustGroup.add(exhaust);
    }
    
    exhaustGroup.position.set(0, 0, -2.0);
    plane.add(exhaustGroup);

    // Scale the entire plane to maintain compatibility with existing code
    plane.scale.setScalar(0.8);

    return plane;
} 