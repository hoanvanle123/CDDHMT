import * as THREE from 'three';

export class BoundingBox {
    constructor(centerX, centerY, width, height, rotation = 0) {
        this.center = { x: centerX, y: centerY };
        this.width = width;
        this.height = height;
        this.rotation = rotation;
    }

    getCorners() {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const hw = this.width / 2;
        const hh = this.height / 2;

        return [
            {
                x: this.center.x + cos * hw - sin * hh,
                y: this.center.y + sin * hw + cos * hh
            },
            {
                x: this.center.x - cos * hw - sin * hh,
                y: this.center.y - sin * hw + cos * hh
            },
            {
                x: this.center.x - cos * hw + sin * hh,
                y: this.center.y - sin * hw - cos * hh
            },
            {
                x: this.center.x + cos * hw + sin * hh,
                y: this.center.y + sin * hw - cos * hh
            }
        ];
    }

    intersects(other) {
        const box1Corners = this.getCorners();
        const box2Corners = other.getCorners();

        return !this.hasSeperatingAxis(box1Corners, box2Corners) &&
               !this.hasSeperatingAxis(box2Corners, box1Corners);
    }

    hasSeperatingAxis(corners1, corners2) {
        for (let i = 0; i < corners1.length; i++) {
            const a = corners1[i];
            const b = corners1[(i + 1) % corners1.length];
            
            const normal = {
                x: b.y - a.y,
                y: a.x - b.x
            };

            let minA = Infinity, maxA = -Infinity;
            let minB = Infinity, maxB = -Infinity;

            corners1.forEach(corner => {
                const proj = normal.x * corner.x + normal.y * corner.y;
                minA = Math.min(minA, proj);
                maxA = Math.max(maxA, proj);
            });

            corners2.forEach(corner => {
                const proj = normal.x * corner.x + normal.y * corner.y;
                minB = Math.min(minB, proj);
                maxB = Math.max(maxB, proj);
            });

            if (maxA < minB || maxB < minA) {
                return true;
            }
        }
        return false;
    }

    // Debug method to visualize bounding box
    draw(scene) {
        const corners = this.getCorners();
        const geometry = new THREE.BufferGeometry();
        
        // Create box edges
        const vertices = [];
        for (let i = 0; i < corners.length; i++) {
            const current = corners[i];
            const next = corners[(i + 1) % corners.length];
            vertices.push(current.x, current.y, 0);
            vertices.push(next.x, next.y, 0);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const lineSegments = new THREE.LineSegments(geometry, material);
        lineSegments.position.z = 20; // Place box slightly above the road
        scene.add(lineSegments);
        return lineSegments;
    }
}

export function checkCollision(playerCar, otherVehicles, scene, config) {
    // Create bounding box for player car
    const playerBox = new BoundingBox(
        playerCar.position.x,
        playerCar.position.y,
        30,  // player car width
        60,  // player car length
        playerCar.rotation.z + Math.PI/2
    );

    // Debug: Draw player's bounding box
    if (config.showHitZones) {
        if (playerCar.userData.boundingBox) {
            scene.remove(playerCar.userData.boundingBox);
        }
        playerCar.userData.boundingBox = playerBox.draw(scene);
    }

    const collision = otherVehicles.some(vehicle => {
        // Create bounding box for other vehicles
        const vehicleBox = new BoundingBox(
            vehicle.mesh.position.x,
            vehicle.mesh.position.y,
            vehicle.type === 'truck' ? 35 : 30,  // width based on vehicle type
            vehicle.type === 'truck' ? 100 : 60,  // length based on vehicle type
            vehicle.angle
        );

        // Debug: Draw vehicle's bounding box
        if (config.showHitZones) {
            if (vehicle.mesh.userData.boundingBox) {
                scene.remove(vehicle.mesh.userData.boundingBox);
            }
            vehicle.mesh.userData.boundingBox = vehicleBox.draw(scene);
        }

        // Check for collision
        return playerBox.intersects(vehicleBox);
    });

    return collision;
}