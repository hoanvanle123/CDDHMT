import * as THREE from 'three';
import { colors, trackDimensions, arcAngles } from '../config.js';

export function getLineMarkings(mapWidth, mapHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = colors.trackColor;
    context.fillRect(0, 0, mapWidth, mapHeight);

    context.lineWidth = 2;
    context.strokeStyle = "#E0FFFF";
    context.setLineDash([10, 14]);

    // Left circle
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.radius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Right circle
    context.beginPath();
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.radius,
        0,
        Math.PI * 2
    );
    context.stroke();

    return new THREE.CanvasTexture(canvas);
}

export function getCurbsTexture(mapWidth, mapHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = colors.lawnGreen;
    context.fillRect(0, 0, mapWidth, mapHeight);

    // Extra big
    context.lineWidth = 65;
    context.strokeStyle = "#A2FF75";
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        arcAngles.angle1,
        -arcAngles.angle1
    );
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        Math.PI + arcAngles.angle2,
        Math.PI - arcAngles.angle2,
        true
    );
    context.stroke();

    context.beginPath();
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        Math.PI + arcAngles.angle1,
        Math.PI - arcAngles.angle1
    );
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        arcAngles.angle2,
        -arcAngles.angle2,
        true
    );
    context.stroke();

    // Extra small
    context.lineWidth = 60;
    context.strokeStyle = colors.lawnGreen;
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        arcAngles.angle1,
        -arcAngles.angle1
    );
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        Math.PI + arcAngles.angle2,
        Math.PI - arcAngles.angle2,
        true
    );
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        Math.PI + arcAngles.angle1,
        Math.PI - arcAngles.angle1
    );
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        arcAngles.angle2,
        -arcAngles.angle2,
        true
    );
    context.stroke();

    // Base
    context.lineWidth = 6;
    context.strokeStyle = colors.edgeColor;

    // Outer circle left
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Outer circle right
    context.beginPath();
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.outerRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Inner circle left
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Inner circle right
    context.beginPath();
    context.arc(
        mapWidth / 2 + arcAngles.centerX,
        mapHeight / 2,
        trackDimensions.innerRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    return new THREE.CanvasTexture(canvas);
}