import * as THREE from 'three';
import { colors, config } from '../config.js';
import { pickRandom } from '../utils.js';
import { getTruckFrontTexture, getTruckSideTexture } from '../textures/TruckTextures.js';
import { Wheel } from './Wheel.js';
import { HitZone } from './HitZone.js';

export function Truck() {
    const truck = new THREE.Group();
    const color = pickRandom(colors.vehicle);

    const base = new THREE.Mesh(
        new THREE.BoxBufferGeometry(100, 25, 5),
        new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
    );
    base.position.z = 10;
    truck.add(base);

    const cargo = new THREE.Mesh(
        new THREE.BoxBufferGeometry(75, 35, 40),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    cargo.position.x = -15;
    cargo.position.z = 30;
    cargo.castShadow = true;
    cargo.receiveShadow = true;
    truck.add(cargo);

    const truckFrontTexture = getTruckFrontTexture();
    truckFrontTexture.center = new THREE.Vector2(0.5, 0.5);
    truckFrontTexture.rotation = Math.PI / 2;

    const truckLeftTexture = getTruckSideTexture();
    truckLeftTexture.flipY = false;

    const truckRightTexture = getTruckSideTexture();

    const cabin = new THREE.Mesh(
        new THREE.BoxBufferGeometry(25, 30, 30),
        [
            new THREE.MeshLambertMaterial({ color, map: truckFrontTexture }),
            new THREE.MeshLambertMaterial({ color }),
            new THREE.MeshLambertMaterial({ color, map: truckLeftTexture }),
            new THREE.MeshLambertMaterial({ color, map: truckRightTexture }),
            new THREE.MeshLambertMaterial({ color }),
            new THREE.MeshLambertMaterial({ color })
        ]
    );
    cabin.position.x = 40;
    cabin.position.z = 20;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truck.add(cabin);

    const backWheel = Wheel();
    backWheel.position.x = -30;
    truck.add(backWheel);

    const middleWheel = Wheel();
    middleWheel.position.x = 10;
    truck.add(middleWheel);

    const frontWheel = Wheel();
    frontWheel.position.x = 38;
    truck.add(frontWheel);

    if (config.showHitZones) {
        truck.userData.hitZone1 = HitZone();
        truck.userData.hitZone2 = HitZone();
        truck.userData.hitZone3 = HitZone();
    }

    return truck;
}