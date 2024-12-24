import * as THREE from 'three';

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