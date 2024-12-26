import { gameSettings, trackDimensions, arcAngles, cameraGlobalSettings } from '../config.js';
import { getVehicleSpeed } from '../utils.js';
import { Car } from '../models/Car.js';
import { Truck } from '../models/Truck.js';
import { pickRandom } from '../utils.js';
import { hitDetection } from './Collision.js';



class GameState {
    constructor() {
        this.ready = false;
        this.score = 0;
        this.accelerate = false;
        this.decelerate = false;
        this.playerAngleMoved = 0;
        this.lastTimestamp = undefined;
        this.otherVehicles = [];

        // DOM elements
        this.scoreElement = document.getElementById("score");
        this.buttonsElement = document.getElementById("buttons");
        this.instructionsElement = document.getElementById("instructions");
        this.resultsElement = document.getElementById("results");
    }

    reset() {
        this.playerAngleMoved = 0;
        this.score = 0;
        this.scoreElement.innerText = "Press UP";
        this.resultsElement.style.display = "none";
        this.lastTimestamp = undefined;
        this.ready = true;
    }

    getPlayerSpeed() {
        if (this.accelerate) return gameSettings.speed * 2;
        if (this.decelerate) return gameSettings.speed * 0.5;
        return gameSettings.speed;
    }

    positionScoreElement() {
        const arcCenterXinPixels = (arcAngles.centerX / cameraGlobalSettings.cameraWidth) * window.innerWidth;
        this.scoreElement.style.cssText = `left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px; top: ${window.innerHeight / 2}px;`;
    }
}

export function initializeGameState() {
    return new GameState();
}

export function updateGameState(gameState, scene, timeDelta) {
    const laps = Math.floor(Math.abs(gameState.playerAngleMoved) / (Math.PI * 2));

    // Update score if it changed
    if (laps !== gameState.score) {
        gameState.score = laps;
        gameState.scoreElement.innerText = laps;
    }

    // Add a new vehicle at the beginning and with every 5th lap
    if (gameState.otherVehicles.length < (laps + 1) / 5) {
        addVehicle(gameState, scene);
    }

    moveOtherVehicles(gameState, timeDelta);
    
    if (hitDetection(gameState, scene)) {
        gameState.resultsElement.style.display = "flex";
        gameState.resultsElement.innerText = "Game Over!";
        //renderer.setAnimationLoop(null); // Dừng vòng lặp render

        return false;
    }
    
    return true;
}

function addVehicle(gameState, scene) {
    const vehicleTypes = ["car", "truck"];
    const type = pickRandom(vehicleTypes);
    const speed = getVehicleSpeed(type);
    const clockwise = Math.random() >= 0.5;
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    
    const mesh = type === "car" ? Car() : Truck();
    scene.add(mesh);
    
    gameState.otherVehicles.push({ mesh, type, speed, clockwise, angle });
}

function moveOtherVehicles(gameState, timeDelta) {
    gameState.otherVehicles.forEach((vehicle) => {
        if (vehicle.clockwise) {
            vehicle.angle -= gameSettings.speed * timeDelta * vehicle.speed;
        } else {
            vehicle.angle += gameSettings.speed * timeDelta * vehicle.speed;
        }

        const vehicleX = Math.cos(vehicle.angle) * trackDimensions.radius + arcAngles.centerX;
        const vehicleY = Math.sin(vehicle.angle) * trackDimensions.radius;
        const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
        
        vehicle.mesh.position.x = vehicleX;
        vehicle.mesh.position.y = vehicleY;
        vehicle.mesh.rotation.z = rotation;
    });
}
