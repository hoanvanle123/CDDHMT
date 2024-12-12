import * as THREE from 'three';
import { config, arcAngles } from '../config.js';
import { Tree } from '../models/Tree.js';
import { getLineMarkings, getCurbsTexture } from './MapTextures.js';
import { getLeftIsland, getMiddleIsland, getRightIsland, getOuterField } from './TrackGeometry.js';

export function setupTrack(scene, mapWidth, mapHeight) {
    const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);
    const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
    const planeMaterial = new THREE.MeshLambertMaterial({
        map: lineMarkingsTexture
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.matrixAutoUpdate = false;
    scene.add(plane);

    // Extruded geometry with curbs
    const islandLeft = getLeftIsland();
    const islandMiddle = getMiddleIsland();
    const islandRight = getRightIsland();
    const outerField = getOuterField(mapWidth, mapHeight);

    const curbsTexture = getCurbsTexture(mapWidth, mapHeight);
    curbsTexture.offset = new THREE.Vector2(0.5, 0.5);
    curbsTexture.repeat.set(1 / mapWidth, 1 / mapHeight);

    const fieldGeometry = new THREE.ExtrudeBufferGeometry(
        [islandLeft, islandRight, islandMiddle, outerField],
        { depth: 6, bevelEnabled: false }
    );

    const fieldMesh = new THREE.Mesh(fieldGeometry, [
        new THREE.MeshLambertMaterial({
            color: !config.curbs && colors.lawnGreen,
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
    const treePositions = [
        { x: arcAngles.centerX * 1.3, y: 0 },
        { x: arcAngles.centerX * 1.3, y: arcAngles.centerX * 1.9 },
        { x: arcAngles.centerX * 0.8, y: arcAngles.centerX * 2 },
        // Add more tree positions...
    ];

    treePositions.forEach(pos => {
        const tree = Tree();
        tree.position.x = pos.x;
        tree.position.y = pos.y;
        scene.add(tree);
    });
}