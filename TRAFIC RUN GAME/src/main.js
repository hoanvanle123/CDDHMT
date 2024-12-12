import * as THREE from 'three';
import { config, gameSettings, trackDimensions } from './config.js';
import { Car } from './models/Car.js';
import { Truck } from './models/Truck.js';
import { setupTrack } from './scene/Track.js';
import { initializeGameState, updateGameState } from './game/GameState.js';
import { setupControls } from './game/Controls.js';

let camera, scene, renderer;
let playerCar;
const gameState = initializeGameState();

function initialize() {
    // Set up camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraWidth = 960;
    const cameraHeight = cameraWidth / aspectRatio;

    camera = new THREE.OrthographicCamera(
        cameraWidth / -2,
        cameraWidth / 2,
        cameraHeight / 2,
        cameraHeight / -2,
        50,
        700
    );

    camera.position.set(0, -210, 300);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, -300, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -400;
    dirLight.shadow.camera.right = 350;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -300;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 800;
    scene.add(dirLight);

    // Set up renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (config.shadows) renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Initialize game elements
    playerCar = Car();
    scene.add(playerCar);

    setupTrack(scene, cameraWidth, cameraHeight * 2);
    setupControls(gameState, startGame, reset);
    
    // Handle window resizing
    window.addEventListener("resize", onWindowResize);
    
    reset();
}

function startGame() {
    if (gameState.ready) {
        gameState.ready = false;
        gameState.scoreElement.innerText = 0;
        gameState.buttonsElement.style.opacity = 1;
        gameState.instructionsElement.style.opacity = 0;
        renderer.setAnimationLoop(animation);
    }
}

function reset() {
    gameState.reset();
    gameState.otherVehicles.forEach(vehicle => {
        scene.remove(vehicle.mesh);
        if (vehicle.mesh.userData.hitZone1) scene.remove(vehicle.mesh.userData.hitZone1);
        if (vehicle.mesh.userData.hitZone2) scene.remove(vehicle.mesh.userData.hitZone2);
        if (vehicle.mesh.userData.hitZone3) scene.remove(vehicle.mesh.userData.hitZone3);
    });
    gameState.otherVehicles = [];
    movePlayerCar(0);
    renderer.render(scene, camera);
}

function animation(timestamp) {
    if (!gameState.lastTimestamp) {
        gameState.lastTimestamp = timestamp;
        return;
    }

    const timeDelta = timestamp - gameState.lastTimestamp;

    movePlayerCar(timeDelta);
    updateGameState(gameState, scene, timeDelta);

    renderer.render(scene, camera);
    gameState.lastTimestamp = timestamp;
}

function movePlayerCar(timeDelta) {
    const playerSpeed = gameState.getPlayerSpeed();
    gameState.playerAngleMoved -= playerSpeed * timeDelta;

    const totalPlayerAngle = gameSettings.playerAngleInitial + gameState.playerAngleMoved;

    const playerX = Math.cos(totalPlayerAngle) * trackDimensions.radius - arcAngles.centerX;
    const playerY = Math.sin(totalPlayerAngle) * trackDimensions.radius;

    playerCar.position.x = playerX;
    playerCar.position.y = playerY;
    playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function onWindowResize() {
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const adjustedCameraHeight = cameraWidth / newAspectRatio;

    camera.top = adjustedCameraHeight / 2;
    camera.bottom = adjustedCameraHeight / -2;
    camera.updateProjectionMatrix();

    gameState.positionScoreElement();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

initialize();