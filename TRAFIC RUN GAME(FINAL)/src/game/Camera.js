import * as THREE from 'three';
import { cameraWidth, cameraHeight } from '../config.js';

export class CameraManager {
    constructor() {
        // Camera instances
        this.topDownCamera = null;
        this.driverCamera = null;
        this.currentCamera = null;

        // Debug helpers
        this.cameraHelper = null;
        this.axesHelper = null;
        this.directionHelper = null;

        this.debugMode = {
            showHelpers: true,
            toggleHelpers: () => {
                this.debugMode.showHelpers = !this.debugMode.showHelpers;
                if (this.cameraHelper) this.cameraHelper.visible = this.debugMode.showHelpers;
                if (this.axesHelper) this.axesHelper.visible = this.debugMode.showHelpers;
                if (this.directionHelper) this.directionHelper.visible = this.debugMode.showHelpers;
            }
        };
    }

    setupCameras(scene) {
        // Set up top-down camera
        this.topDownCamera = new THREE.OrthographicCamera(
            cameraWidth / -2,
            cameraWidth / 2,
            cameraHeight / 2,
            cameraHeight / -2,
            50,
            700
        );
        this.topDownCamera.position.set(0, -210, 300);
        this.topDownCamera.lookAt(0, 0, 0);

        // Set up driver camera
        this.driverCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Use top-down camera as default
        this.currentCamera = this.topDownCamera;

        this.setupDebugHelpers(scene);

        return this.currentCamera;
    }

    setupDebugHelpers(scene) {
        // Axes helper
        this.axesHelper = new THREE.AxesHelper(50);
        scene.add(this.axesHelper);

        // Camera helper
        this.cameraHelper = new THREE.CameraHelper(this.driverCamera);
        scene.add(this.cameraHelper);

        // Direction helper
        const dir = new THREE.Vector3();
        const origin = new THREE.Vector3();
        const length = 50;
        const hex = 0xffff00;
        this.directionHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.add(this.directionHelper);
    }

    updateDriverCamera(playerCar, playerAngleInitial, playerAngleMoved) {
        if (!playerCar) return;

        // Add 90 degrees (PI/2) to angle to rotate camera towards car's front
        const angle = playerAngleInitial + playerAngleMoved - Math.PI/2;
        const heightAboveCar = 15;
        const offsetFromFront = 20;
        
        const x = playerCar.position.x + Math.cos(angle) * offsetFromFront;
        const y = playerCar.position.y + Math.sin(angle) * offsetFromFront;
        
        this.driverCamera.position.set(x, y, heightAboveCar);

        // Calculate look-at point
        const lookAtDistance = 100;
        const lookAtX = playerCar.position.x + Math.cos(angle) * (offsetFromFront + lookAtDistance);
        const lookAtY = playerCar.position.y + Math.sin(angle) * (offsetFromFront + lookAtDistance);
        
        this.driverCamera.lookAt(lookAtX, lookAtY, heightAboveCar);
        this.driverCamera.up.set(0, 0, 1);

        // Update helpers
        if (this.cameraHelper) {
            this.cameraHelper.update();
        }

        if (this.directionHelper) {
            // Update direction helper position
            this.directionHelper.position.set(x, y, heightAboveCar);
            
            // Calculate look direction
            const direction = new THREE.Vector3(
                lookAtX - x,
                lookAtY - y,
                0
            ).normalize();
            
            // Update arrow direction
            this.directionHelper.setDirection(direction);
        }
    }

    switchCamera() {
        this.currentCamera = this.currentCamera === this.topDownCamera ? 
            this.driverCamera : this.topDownCamera;
        
        // Update aspect ratio if needed
        if (this.currentCamera === this.driverCamera) {
            this.driverCamera.aspect = window.innerWidth / window.innerHeight;
            this.driverCamera.updateProjectionMatrix();
        }

        return this.currentCamera;
    }

    getCurrentCamera() {
        return this.currentCamera;
    }

    handleResize() {
        const newAspectRatio = window.innerWidth / window.innerHeight;

        // Update top-down camera
        if (this.topDownCamera) {
            const adjustedCameraHeight = cameraWidth / newAspectRatio;
            this.topDownCamera.top = adjustedCameraHeight / 2;
            this.topDownCamera.bottom = adjustedCameraHeight / -2;
            this.topDownCamera.updateProjectionMatrix();
        }

        // Update driver camera
        if (this.driverCamera) {
            this.driverCamera.aspect = newAspectRatio;
            this.driverCamera.updateProjectionMatrix();
        }
    }
}