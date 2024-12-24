import * as THREE from 'three';
import { colors } from '../config.js';
import { pickRandom } from '../utils.js';

const treeTrunkGeometry = new THREE.BoxGeometry(15, 15, 30);
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
    color: colors.treeTrunk
});
const treeCrownMaterial = new THREE.MeshLambertMaterial({
    color: colors.treeCrown
});

export function Tree() {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
    trunk.position.z = 10;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.matrixAutoUpdate = false;
    tree.add(trunk);

    const treeHeights = [45, 60, 75];
    const height = pickRandom(treeHeights);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(height / 2, 30, 30),
        treeCrownMaterial
    );
    crown.position.z = height / 2 + 30;
    crown.castShadow = true;
    crown.receiveShadow = false;
    tree.add(crown);

    return tree;
}