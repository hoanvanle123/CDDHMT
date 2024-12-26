import * as THREE from 'three';

export function HitZone() {
    const hitZone = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 20, 60, 30),
        new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    hitZone.position.z = 25;
    hitZone.rotation.x = Math.PI / 2;
    

    return hitZone;
}