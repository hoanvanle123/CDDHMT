import * as THREE from 'three';
import { CameraManager } from './Camera.js';
import { createCar } from '../models/Car.js';
import { createTruck } from '../models/Truck.js';
import { renderMap } from '../models/Track.js';
import { checkCollision } from './Physics.js';
import { pickRandom, getVehicleSpeed, positionScoreElement } from '../utils.js';
import { debugConfig, speed, playerAngleInitial, cameraWidth } from '../config.js';

export class Game {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.cameraManager = new CameraManager();
        
        // Game state
        this.ready = false;
        this.score = 0;
        this.lastTimestamp = undefined;
        this.playerAngleMoved = 0;
        this.accelerate = false;
        this.decelerate = false;
        
        // Game objects
        this.playerCar = null;
        this.otherVehicles = [];
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        
        // DOM elements
        this.scoreElement = document.getElementById("score");
        this.buttonsElement = document.getElementById("buttons");
        this.instructionsElement = document.getElementById("instructions");
        this.resultsElement = document.getElementById("results");
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (debugConfig.shadows) this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Setup scene
        this.setupLights();
        this.setupMap();
        this.setupPlayer();
        this.setupControls();
        this.setupEventListeners();

        // Initialize camera
        this.cameraManager.setupCameras(this.scene);

        // Reset game state
        this.reset();

        // Show initial UI
        setTimeout(() => {
            if (this.ready) this.instructionsElement.style.opacity = 1;
            this.buttonsElement.style.opacity = 1;
        }, 4000);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
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
        this.scene.add(dirLight);
    }

    setupMap() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const cameraHeight = cameraWidth / aspectRatio;
        renderMap(cameraWidth, cameraHeight * 2, this.scene, debugConfig);
        positionScoreElement(this.scoreElement, cameraWidth);
    }

    setupPlayer() {
        this.playerCar = createCar();
        this.scene.add(this.playerCar);
    }

    setupControls() {
        const accelerateButton = document.getElementById("accelerate");
        const decelerateButton = document.getElementById("decelerate");
        const switchCameraButton = document.getElementById('switchCamera');
        const toggleHelpersButton = document.getElementById('toggleHelpers');

        // Button event listeners
        accelerateButton.addEventListener("mousedown", () => {
            this.startGame();
            this.accelerate = true;
        });

        decelerateButton.addEventListener("mousedown", () => {
            this.startGame();
            this.decelerate = true;
        });

        accelerateButton.addEventListener("mouseup", () => {
            this.accelerate = false;
        });

        decelerateButton.addEventListener("mouseup", () => {
            this.decelerate = false;
        });

        switchCameraButton.addEventListener('click', () => {
            this.cameraManager.switchCamera();
        });

        toggleHelpersButton.addEventListener('click', () => {
            this.cameraManager.debugMode.toggleHelpers();
        });
    }

    setupEventListeners() {
        // Keyboard controls
        window.addEventListener("keydown", (event) => {
            if (event.key === "ArrowUp") {
                this.startGame();
                this.accelerate = true;
            }
            if (event.key === "ArrowDown") {
                this.decelerate = true;
            }
            if (event.key === "R" || event.key === "r") {
                this.reset();
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "ArrowUp") {
                this.accelerate = false;
            }
            if (event.key === "ArrowDown") {
                this.decelerate = false;
            }
        });

        // Window resize
        window.addEventListener("resize", () => {
            this.handleResize();
        });
    }

    startGame() {
        if (this.ready) {
            this.ready = false;
            this.scoreElement.innerText = 0;
            this.buttonsElement.style.opacity = 1;
            this.instructionsElement.style.opacity = 0;
            this.renderer.setAnimationLoop((timestamp) => this.animation(timestamp));
        }
    }

    reset() {
        // Reset position and score
        this.playerAngleMoved = 0;
        this.score = 0;
        this.scoreElement.innerText = "Press UP";

        // Remove other vehicles
        this.otherVehicles.forEach((vehicle) => {
            if (vehicle.mesh.userData.boundingBox) {
                this.scene.remove(vehicle.mesh.userData.boundingBox);
            }
            this.scene.remove(vehicle.mesh);
        });
        this.otherVehicles = [];

        this.resultsElement.style.display = "none";
        this.lastTimestamp = undefined;

        this.movePlayerCar(0);
        this.renderer.render(this.scene, this.cameraManager.getCurrentCamera());
        this.ready = true;
    }

    movePlayerCar(timeDelta) {
        const playerSpeed = this.getPlayerSpeed();
        this.playerAngleMoved -= playerSpeed * timeDelta;

        const totalPlayerAngle = playerAngleInitial + this.playerAngleMoved;

        const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
        const playerY = Math.sin(totalPlayerAngle) * trackRadius;

        this.playerCar.position.x = playerX;
        this.playerCar.position.y = playerY;

        this.playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
    }

    moveOtherVehicles(timeDelta) {
        this.otherVehicles.forEach((vehicle) => {
            if (vehicle.clockwise) {
                vehicle.angle -= speed * timeDelta * vehicle.speed;
            } else {
                vehicle.angle += speed * timeDelta * vehicle.speed;
            }

            const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
            const vehicleY = Math.sin(vehicle.angle) * trackRadius;
            const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);

            vehicle.mesh.position.x = vehicleX;
            vehicle.mesh.position.y = vehicleY;
            vehicle.mesh.rotation.z = rotation;
        });
    }

    getPlayerSpeed() {
        if (this.accelerate) return speed * 2;
        if (this.decelerate) return speed * 0.5;
        return speed;
    }

    addVehicle() {
        const vehicleTypes = ["car", "truck"];
        const type = pickRandom(vehicleTypes);
        const speed = getVehicleSpeed(type);
        const clockwise = Math.random() >= 0.5;

        const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
        const mesh = type === "car" ? createCar() : createTruck();
        this.scene.add(mesh);

        this.otherVehicles.push({ mesh, type, speed, clockwise, angle });
    }

    animation(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
            return;
        }

        const timeDelta = timestamp - this.lastTimestamp;

        this.movePlayerCar(timeDelta);

        const laps = Math.floor(Math.abs(this.playerAngleMoved) / (Math.PI * 2));

        this.cameraManager.updateDriverCamera(
            this.playerCar,
            playerAngleInitial,
            this.playerAngleMoved
        );

        // Update score if changed
        if (laps !== this.score) {
            this.score = laps;
            this.scoreElement.innerText = this.score;
        }

        // Add new vehicle at start and every 5th lap
        if (this.otherVehicles.length < (laps + 1) / 5) this.addVehicle();

        this.moveOtherVehicles(timeDelta);

        // Check for collisions
        if (checkCollision(this.playerCar, this.otherVehicles, this.scene, debugConfig)) {
            if (this.resultsElement) this.resultsElement.style.display = "flex";
            this.renderer.setAnimationLoop(null); // Stop animation loop
        }

        this.renderer.render(this.scene, this.cameraManager.getCurrentCamera());
        this.lastTimestamp = timestamp;
    }

    handleResize() {
        this.cameraManager.handleResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        positionScoreElement(this.scoreElement, cameraWidth);
        this.renderer.render(this.scene, this.cameraManager.getCurrentCamera());
    }
}