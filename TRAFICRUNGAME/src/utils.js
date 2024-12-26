export function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function getDistance(coordinate1, coordinate2) {
    const horizontalDistance = coordinate2.x - coordinate1.x;
    const verticalDistance = coordinate2.y - coordinate1.y;
    return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

export function getHitZonePosition(center, angle, clockwise, distance) {
    const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
    return {
      x: center.x + Math.cos(directionAngle) * distance,
      y: center.y + Math.sin(directionAngle) * distance
    };
}
export function getVehicleSpeed(type) {
    const speeds = {
        car: { min: 1, max: 2 },
        truck: { min: 0.6, max: 1.5 }
    };
    
    const { min, max } = speeds[type];
    return min + Math.random() * (max - min);
}