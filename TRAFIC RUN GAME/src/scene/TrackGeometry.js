import * as THREE from 'three';
import { trackDimensions, arcAngles } from '../config.js';

export function getLeftIsland() {
    const islandLeft = new THREE.Shape();

    islandLeft.absarc(
        -arcAngles.centerX,
        0,
        trackDimensions.innerRadius,
        arcAngles.angle1,
        -arcAngles.angle1,
        false
    );

    islandLeft.absarc(
        arcAngles.centerX,
        0,
        trackDimensions.outerRadius,
        Math.PI + arcAngles.angle2,
        Math.PI - arcAngles.angle2,
        true
    );

    return islandLeft;
}

export function getMiddleIsland() {
    const islandMiddle = new THREE.Shape();

    islandMiddle.absarc(
        -arcAngles.centerX,
        0,
        trackDimensions.innerRadius,
        arcAngles.angle3,
        -arcAngles.angle3,
        true
    );

    islandMiddle.absarc(
        arcAngles.centerX,
        0,
        trackDimensions.innerRadius,
        Math.PI + arcAngles.angle3,
        Math.PI - arcAngles.angle3,
        true
    );

    return islandMiddle;
}

export function getRightIsland() {
    const islandRight = new THREE.Shape();

    islandRight.absarc(
        arcAngles.centerX,
        0,
        trackDimensions.innerRadius,
        Math.PI - arcAngles.angle1,
        Math.PI + arcAngles.angle1,
        true
    );

    islandRight.absarc(
        -arcAngles.centerX,
        0,
        trackDimensions.outerRadius,
        -arcAngles.angle2,
        arcAngles.angle2,
        false
    );

    return islandRight;
}

export function getOuterField(mapWidth, mapHeight) {
    const field = new THREE.Shape();

    field.moveTo(-mapWidth / 2, -mapHeight / 2);
    field.lineTo(0, -mapHeight / 2);

    field.absarc(
        -arcAngles.centerX,
        0,
        trackDimensions.outerRadius,
        -arcAngles.angle4,
        arcAngles.angle4,
        true
    );

    field.absarc(
        arcAngles.centerX,
        0,
        trackDimensions.outerRadius,
        Math.PI - arcAngles.angle4,
        Math.PI + arcAngles.angle4,
        true
    );

    field.lineTo(0, -mapHeight / 2);
    field.lineTo(mapWidth / 2, -mapHeight / 2);
    field.lineTo(mapWidth / 2, mapHeight / 2);
    field.lineTo(-mapWidth / 2, mapHeight / 2);

    return field;
}