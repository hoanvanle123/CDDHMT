import * as THREE from 'three';
import { colors } from '../config.js';  // Đảm bảo đường dẫn đúng
import { pickRandom } from '../utils.js';
import { getCarFrontTexture, getCarSideTexture } from '../textures/CarTextures.js';
import { Wheel } from './Wheel.js';
import { HitZone } from './HitZone.js';
import { config } from '../config.js';  // Đảm bảo nhập khẩu config đúng

export function Car() {
    const car = new THREE.Group();
    const color = pickRandom(colors.vehicle);

    const main = new THREE.Mesh(
        new THREE.BoxGeometry(60, 30, 15),
        new THREE.MeshLambertMaterial({ color })
    );
    main.position.z = 12;
    main.castShadow = true;
    main.receiveShadow = true;
    car.add(main);

    const carFrontTexture = getCarFrontTexture();
    carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
    carFrontTexture.rotation = Math.PI / 2;

    const carBackTexture = getCarFrontTexture();
    carBackTexture.center = new THREE.Vector2(0.5, 0.5);
    carBackTexture.rotation = -Math.PI / 2;

    const carLeftSideTexture = getCarSideTexture();
    carLeftSideTexture.flipY = false;

    const carRightSideTexture = getCarSideTexture();

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(33, 24, 12),
        [
            new THREE.MeshLambertMaterial({ map: carFrontTexture }),
            new THREE.MeshLambertMaterial({ map: carBackTexture }),
            new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
            new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
            new THREE.MeshLambertMaterial({ color: 0xffffff }), // top
            new THREE.MeshLambertMaterial({ color: 0xffffff }) // bottom
        ]
    );
    cabin.position.x = -6;
    cabin.position.z = 25.5;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    car.add(cabin);

    const backWheel = Wheel();
    backWheel.position.x = -18;
    car.add(backWheel);

    const frontWheel = Wheel();
    frontWheel.position.x = 18;
    car.add(frontWheel);

    if (config.showHitZones) {  // Kiểm tra config.showHitZones
        car.userData.hitZone1 = HitZone();
        car.userData.hitZone2 = HitZone();
    }

    return car;
}
