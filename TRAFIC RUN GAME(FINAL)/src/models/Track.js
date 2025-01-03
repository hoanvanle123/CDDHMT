import * as THREE from 'three';
import { 
    trackColor, lawnGreen, edgeColor,
    arcCenterX, innerTrackRadius, outerTrackRadius,
    arcAngle1, arcAngle2, arcAngle3, arcAngle4
} from '../config.js';
import { createTree } from './Tree.js';

// Get line markings texture for the track
function getLineMarkings(mapWidth, mapHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = trackColor;
    context.fillRect(0, 0, mapWidth, mapHeight);

    context.lineWidth = 2;
    context.strokeStyle = "#E0FFFF";
    context.setLineDash([10, 14]);

    // Left circle
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Right circle
    context.beginPath();
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    return new THREE.CanvasTexture(canvas);
}

// Get curbs texture
function getCurbsTexture(mapWidth, mapHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = lawnGreen;
    context.fillRect(0, 0, mapWidth, mapHeight);

    // Extra big
    context.lineWidth = 65;
    context.strokeStyle = "#A2FF75";
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        arcAngle1,
        -arcAngle1
    );
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        Math.PI + arcAngle2,
        Math.PI - arcAngle2,
        true
    );
    context.stroke();

    context.beginPath();
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        Math.PI + arcAngle1,
        Math.PI - arcAngle1
    );
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        arcAngle2,
        -arcAngle2,
        true
    );
    context.stroke();

    // Extra small
    context.lineWidth = 60;
    context.strokeStyle = lawnGreen;
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        arcAngle1,
        -arcAngle1
    );
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        Math.PI + arcAngle2,
        Math.PI - arcAngle2,
        true
    );
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        Math.PI + arcAngle1,
        Math.PI - arcAngle1
    );
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        arcAngle2,
        -arcAngle2,
        true
    );
    context.stroke();

    // Base
    context.lineWidth = 6;
    context.strokeStyle = edgeColor;

    // Draw outer circles
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    context.beginPath();
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        outerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    // Draw inner circles
    context.beginPath();
    context.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    context.beginPath();
    context.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        innerTrackRadius,
        0,
        Math.PI * 2
    );
    context.stroke();

    return new THREE.CanvasTexture(canvas);
}
function getLeftIsland() {
    const islandLeft = new THREE.Shape();

    islandLeft.absarc(
        -arcCenterX,
        0,
        innerTrackRadius,
        arcAngle1,
        -arcAngle1,
        false
    );

    islandLeft.absarc(
        arcCenterX,
        0,
        outerTrackRadius,
        Math.PI + arcAngle2,
        Math.PI - arcAngle2,
        true
    );

    return islandLeft;
}

function getMiddleIsland() {
    const islandMiddle = new THREE.Shape();

    islandMiddle.absarc(
        -arcCenterX,
        0,
        innerTrackRadius,
        arcAngle3,
        -arcAngle3,
        true
    );

    islandMiddle.absarc(
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI + arcAngle3,
        Math.PI - arcAngle3,
        true
    );

    return islandMiddle;
}

function getRightIsland() {
    const islandRight = new THREE.Shape();

    islandRight.absarc(
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI - arcAngle1,
        Math.PI + arcAngle1,
        true
    );

    islandRight.absarc(
        -arcCenterX,
        0,
        outerTrackRadius,
        -arcAngle2,
        arcAngle2,
        false
    );

    return islandRight;
}

function getOuterField(mapWidth, mapHeight) {
    const field = new THREE.Shape();

    field.moveTo(-mapWidth / 2, -mapHeight / 2);
    field.lineTo(0, -mapHeight / 2);

    field.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true);

    field.absarc(
        arcCenterX,
        0,
        outerTrackRadius,
        Math.PI - arcAngle4,
        Math.PI + arcAngle4,
        true
    );

    field.lineTo(0, -mapHeight / 2);
    field.lineTo(mapWidth / 2, -mapHeight / 2);
    field.lineTo(mapWidth / 2, mapHeight / 2);
    field.lineTo(-mapWidth / 2, mapHeight / 2);

    return field;
}

export function renderMap(mapWidth, mapHeight, scene, config) {
    const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

    const planeGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    const planeMaterial = new THREE.MeshLambertMaterial({
        map: lineMarkingsTexture
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.matrixAutoUpdate = false;
    scene.add(plane);

    const islandLeft = getLeftIsland();
    const islandMiddle = getMiddleIsland();
    const islandRight = getRightIsland();
    const outerField = getOuterField(mapWidth, mapHeight);

    // Mapping curb textures
    const curbsTexture = getCurbsTexture(mapWidth, mapHeight);
    curbsTexture.offset = new THREE.Vector2(0.5, 0.5);
    curbsTexture.repeat.set(1 / mapWidth, 1 / mapHeight);

    const fieldGeometry = new THREE.ExtrudeGeometry(
        [islandLeft, islandRight, islandMiddle, outerField],
        { depth: 6, bevelEnabled: false }
    );

    const fieldMesh = new THREE.Mesh(fieldGeometry, [
        new THREE.MeshLambertMaterial({
            color: !config.curbs && lawnGreen,
            map: config.curbs && curbsTexture
        }),
        new THREE.MeshLambertMaterial({ color: 0x23311c })
    ]);
    fieldMesh.receiveShadow = true;
    fieldMesh.matrixAutoUpdate = false;
    scene.add(fieldMesh);

    if (config.trees) {
        addTrees(scene);
    }
}

function addTrees(scene) {
    const trees = [
        { x: 1.3, y: 0 },
        { x: 1.3, y: 1.9 },
        { x: 0.8, y: 2 },
        { x: 1.8, y: 2 },
        { x: -1, y: 2 },
        { x: -2, y: 1.8 },
        { x: 0.8, y: -2 },
        { x: 1.8, y: -2 },
        { x: -1, y: -2 },
        { x: -2, y: -1.8 },
        { x: 0.6, y: -2.3 },
        { x: 1.5, y: -2.4 },
        { x: -0.7, y: -2.4 },
        { x: -1.5, y: -1.8 }
    ];

    trees.forEach(({ x, y }) => {
        const tree = createTree();
        tree.position.x = arcCenterX * x;
        tree.position.y = arcCenterX * y;
        scene.add(tree);
    });
}