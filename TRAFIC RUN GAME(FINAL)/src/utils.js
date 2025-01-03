import * as THREE from 'three';


// Helper function to pick a random element from an array
export function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Calculate distance between two coordinates
export function getDistance(coordinate1, coordinate2) {
    const horizontalDistance = coordinate2.x - coordinate1.x;
    const verticalDistance = coordinate2.y - coordinate1.y;
    return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

// Vehicle related helpers
export function getVehicleSpeed(type) {
    const minimumSpeed = type === "car" ? 1 : 0.6;
    const maximumSpeed = type === "car" ? 2 : 1.5;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
}

// Car texture helpers
export function getCarFrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 64, 32);

    context.fillStyle = "#666666";
    context.fillRect(8, 8, 48, 24);

    return new THREE.CanvasTexture(canvas);
}

export function getCarSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 32);

    context.fillStyle = "#666666";
    context.fillRect(10, 8, 38, 24);
    context.fillRect(58, 8, 60, 24);

    return new THREE.CanvasTexture(canvas);
}

// Truck texture helpers
export function getTruckFrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);

    context.fillStyle = "#666666";
    context.fillRect(0, 5, 32, 10);

    return new THREE.CanvasTexture(canvas);
}

export function getTruckSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);

    context.fillStyle = "#666666";
    context.fillRect(17, 5, 15, 10);

    return new THREE.CanvasTexture(canvas);
}

// DOM element positioning
export function positionScoreElement(scoreElement, arcCenterX, cameraWidth) {
    const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
    scoreElement.style.cssText = `
        left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
        top: ${window.innerHeight / 2}px
    `;
}

// Debug camera helpers
export const debugCamera = {
    showHelpers: true,
    toggleHelpers: function() {
        this.showHelpers = !this.showHelpers;
        if (cameraHelper) cameraHelper.visible = this.showHelpers;
        if (axesHelper) axesHelper.visible = this.showHelpers;
        if (directionHelper) directionHelper.visible = this.showHelpers;
    }
};