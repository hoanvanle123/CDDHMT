import { config } from '../config.js';
import { getDistance, getHitZonePosition } from '../utils.js';

export function hitDetection(gameState, playerCar) {
    const playerHitZone1 = getHitZonePosition(
        playerCar.position,
        gameSettings.playerAngleInitial + gameState.playerAngleMoved,
        true,
        15
    );

    const playerHitZone2 = getHitZonePosition(
        playerCar.position,
        gameSettings.playerAngleInitial + gameState.playerAngleMoved,
        true,
        -15
    );

    if (config.showHitZones) {
        playerCar.userData.hitZone1.position.x = playerHitZone1.x;
        playerCar.userData.hitZone1.position.y = playerHitZone1.y;
        playerCar.userData.hitZone2.position.x = playerHitZone2.x;
        playerCar.userData.hitZone2.position.y = playerHitZone2.y;
    }

    const hit = gameState.otherVehicles.some((vehicle) => {
        if (vehicle.type === "car") {
            return detectCarCollision(vehicle, playerHitZone1, playerHitZone2);
        }
        if (vehicle.type === "truck") {
            return detectTruckCollision(vehicle, playerHitZone1, playerHitZone2);
        }
        return false;
    });

    return hit;
}

function detectCarCollision(vehicle, playerHitZone1, playerHitZone2) {
    const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        15
    );

    const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -15
    );

    if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;
        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;
    }

    // The player hits another vehicle
    if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
    if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;

    // Another vehicle hits the player
    return getDistance(playerHitZone2, vehicleHitZone1) < 40;
}

function detectTruckCollision(vehicle, playerHitZone1, playerHitZone2) {
    const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        35
    );

    const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        0
    );

    const vehicleHitZone3 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -35
    );

    if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;
        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;
        vehicle.mesh.userData.hitZone3.position.x = vehicleHitZone3.x;
        vehicle.mesh.userData.hitZone3.position.y = vehicleHitZone3.y;
    }

    // The player hits another vehicle
    if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
    if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
    if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;

    // Another vehicle hits the player
    return getDistance(playerHitZone2, vehicleHitZone1) < 40;
}