import * as THREE from 'three';
window.focus(); // Capture keys right away (by default focus is on editor)

// Helper functions
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getDistance(coordinate1, coordinate2) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}
const debugCamera = {
  showHelpers: true,
  toggleHelpers: function() {
      this.showHelpers = !this.showHelpers;
      if (cameraHelper) cameraHelper.visible = this.showHelpers;
      if (axesHelper) axesHelper.visible = this.showHelpers;
      if (directionHelper) directionHelper.visible = this.showHelpers;
  }
};
// Constants
const vehicleColors = [
  0xa52523,
  0xef2d56,
  0x0ad3ff,
  0xff9f1c
];

const lawnGreen = "#67C240";
const trackColor = "#546E90";
const edgeColor = "#725F48";
const treeCrownColor = 0x498c2c;
const treeTrunkColor = 0x4b3f2f;
//change camera
let currentCamera;
let topDownCamera; // camera góc nhìn từ trên xuống (camera hiện tại)
let driverCamera; // camera góc nhìn từ đầu xe
let cameraHelper;
let axesHelper;
let directionHelper;
// Geometries
const wheelGeometry = new THREE.BoxGeometry(12, 33, 12);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const treeTrunkGeometry = new THREE.BoxGeometry(15, 15, 30);
const treeTrunkMaterial = new THREE.MeshLambertMaterial({ color: treeTrunkColor });
const treeCrownMaterial = new THREE.MeshLambertMaterial({ color: treeCrownColor });
class BoundingBox {
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

  // Debug method để vẽ bounding box
  draw(scene) {
      const corners = this.getCorners();
      const geometry = new THREE.BufferGeometry();
      
      // Tạo các cạnh của box
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
      lineSegments.position.z = 20; // Đặt box cao hơn mặt đường một chút
      scene.add(lineSegments);
      return lineSegments;
  }
}
// Config
const config = {
  showHitZones: true, // hiển thị bounding box 
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
  curbs: true, // Show texture on the extruded geometry
  grid: false // Show grid helper
};

// Global variables
let score;
const speed = 0.0017;

const playerAngleInitial = Math.PI;
let playerAngleMoved;
let accelerate = false; // Is the player accelerating
let decelerate = false; // Is the player decelerating

let otherVehicles = [];
let ready;
let lastTimestamp;

// Track
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = (1 / 3) * Math.PI; // 60 degrees

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);
const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

// DOM elements
const scoreElement = document.getElementById("score");
const buttonsElement = document.getElementById("buttons");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");
const accelerateButton = document.getElementById("accelerate");
const decelerateButton = document.getElementById("decelerate");

// Set up scene
setTimeout(() => {
  if (ready) instructionsElement.style.opacity = 1;
  buttonsElement.style.opacity = 1;
}, 4000);

// Initialize ThreeJs
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;


function setupCameras() {
  // Set up top-down camera (camera hiện tại)
  topDownCamera = new THREE.OrthographicCamera(
      cameraWidth / -2,
      cameraWidth / 2,
      cameraHeight / 2,
      cameraHeight / -2,
      50,
      700
  );
  topDownCamera.position.set(0, -210, 300);
  topDownCamera.lookAt(0, 0, 0);

  // Set up driver camera (camera mới)
  driverCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Sử dụng camera top-down làm camera mặc định
  currentCamera = topDownCamera;
  setupCameraHelpers();
}
const scene = new THREE.Scene();
setupCameras();
function updateDriverCamera() {
  if (!playerCar) return;

  // Thêm 90 độ (PI/2) vào góc để xoay camera về phía trước xe
  const angle = playerAngleInitial + playerAngleMoved - Math.PI/2;
  const heightAboveCar = 15;
  const offsetFromFront = 20;
  
  const x = playerCar.position.x + Math.cos(angle) * offsetFromFront;
  const y = playerCar.position.y + Math.sin(angle) * offsetFromFront;
  
  driverCamera.position.set(x, y, heightAboveCar);

  const lookAtDistance = 100;
  const lookAtX = playerCar.position.x + Math.cos(angle) * (offsetFromFront + lookAtDistance);
  const lookAtY = playerCar.position.y + Math.sin(angle) * (offsetFromFront + lookAtDistance);
  
  driverCamera.lookAt(lookAtX, lookAtY, heightAboveCar);
  driverCamera.up.set(0, 0, 1);

  // Cập nhật các helper
  if (cameraHelper) {
      cameraHelper.update();
  }

  if (directionHelper) {
      // Cập nhật vị trí của direction helper theo camera
      directionHelper.position.set(x, y, heightAboveCar);
      
      // Tính vector hướng nhìn
      const direction = new THREE.Vector3(
          lookAtX - x,
          lookAtY - y,
          0
      ).normalize();
      
      // Cập nhật hướng mũi tên
      directionHelper.setDirection(direction);
  }

  // Tùy chọn: in ra console để debug
  console.log('Camera Position:', { x, y, z: heightAboveCar });
  console.log('Look At:', { x: lookAtX, y: lookAtY, z: heightAboveCar });
}

function setupCameraHelpers() {
  // Axes helper (hiển thị 3 trục x,y,z)
  axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // Camera helper (hiển thị khung nhìn của camera)
  cameraHelper = new THREE.CameraHelper(driverCamera);
  scene.add(cameraHelper);

  // Direction helper (mũi tên chỉ hướng nhìn)
  const dir = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const length = 50;
  const hex = 0xffff00;
  directionHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(directionHelper);
}
const playerCar = Car();
scene.add(playerCar);

renderMap(cameraWidth, cameraHeight * 2);

// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(100, -300, 300);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -400;
dirLight.shadow.camera.right = 350;
dirLight.shadow.camera.top = 400;
dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 800;
scene.add(dirLight);

// Set up grid (optional)
if (config.grid) {
  const gridHelper = new THREE.GridHelper(80, 8);
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
}

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Car textures
function getCarFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#666666";
  context.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = "#666666";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}

// Car function
function Car() {
  const car = new THREE.Group();

  const color = pickRandom(vehicleColors);

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
      new THREE.MeshLambertMaterial({ color: 0xffffff }),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
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

  return car;
}

// Wheel function
function Wheel() {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = false;
  wheel.receiveShadow = false;
  return wheel;
}

// Truck textures
function getTruckFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 32, 32);

  context.fillStyle = "#666666";
  context.fillRect(0, 5, 32, 10);

  return new THREE.CanvasTexture(canvas);
}

function getTruckSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 32, 32);

  context.fillStyle = "#666666";
  context.fillRect(17, 5, 15, 10);

  return new THREE.CanvasTexture(canvas);
}

// Truck function
function Truck() {
  const truck = new THREE.Group();
  const color = pickRandom(vehicleColors);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(100, 25, 5),
    new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
  );
  base.position.z = 10;
  truck.add(base);

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(75, 35, 40),
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
    new THREE.BoxGeometry(25, 30, 30),
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

  return truck;
}

// Tree function
function Tree() {
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

// Map rendering functions
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
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  // Right circle
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  return new THREE.CanvasTexture(canvas);
}

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

  // Outer circle left
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  // Outer circle right
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  // Inner circle left
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  // Inner circle right
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

function renderMap(mapWidth, mapHeight) {
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

  positionScoreElement();

  if (config.trees) {
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
      const tree = Tree();
      tree.position.x = arcCenterX * x;
      tree.position.y = arcCenterX * y;
      scene.add(tree);
    });
  }
}

function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }

    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);

    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
}

function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
}

function addVehicle() {
  const vehicleTypes = ["car", "truck"];
  const type = pickRandom(vehicleTypes);
  const speed = getVehicleSpeed(type);
  const clockwise = Math.random() >= 0.5;
  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
  const mesh = type === "car" ? Car() : Truck();
  scene.add(mesh);
  otherVehicles.push({ mesh, type, speed, clockwise, angle });
}

function getVehicleSpeed(type) {
  const minimumSpeed = type === "car" ? 1 : 0.6;
  const maximumSpeed = type === "car" ? 2 : 1.5;
  return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
}

function hitDetection() {
  // Tạo bounding box cho xe người chơi
  const playerBox = new BoundingBox(
      playerCar.position.x,
      playerCar.position.y,
      30,  // chiều rộng xe người chơi
      60,  // chiều dài xe người chơi
      playerAngleInitial + playerAngleMoved
  );

  // Debug: Vẽ bounding box của người chơi
  if (config.showHitZones) {
      // Xóa box cũ nếu có
      if (playerCar.userData.boundingBox) {
          scene.remove(playerCar.userData.boundingBox);
      }
      playerCar.userData.boundingBox = playerBox.draw(scene);
  }

  const hit = otherVehicles.some(vehicle => {
      // Tạo bounding box cho từng xe khác
      const vehicleBox = new BoundingBox(
          vehicle.mesh.position.x,
          vehicle.mesh.position.y,
          vehicle.type === 'truck' ? 35 : 30,  // chiều rộng
          vehicle.type === 'truck' ? 100 : 60, // chiều dài
          //vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2)
          //vehicle.mesh.rotation.z
          vehicle.angle
      );

      // Debug: Vẽ bounding box của xe khác
      if (config.showHitZones) {
          // Xóa box cũ nếu có
          if (vehicle.mesh.userData.boundingBox) {
              scene.remove(vehicle.mesh.userData.boundingBox);
          }
          vehicle.mesh.userData.boundingBox = vehicleBox.draw(scene);
      }

      // Kiểm tra va chạm
      return playerBox.intersects(vehicleBox);
  });

  if (hit) {
      if (resultsElement) resultsElement.style.display = "flex";
      renderer.setAnimationLoop(null); // Stop animation loop
  }
}

function animation(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }

  const timeDelta = timestamp - lastTimestamp;

  movePlayerCar(timeDelta);

  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

  updateDriverCamera();

  // Update score if it changed
  if (laps !== score) {
    score = laps;
    scoreElement.innerText = score;
  }

  // Add new vehicle at the beginning and with every 5th lap
  if (otherVehicles.length < (laps + 1) / 5) addVehicle();

  moveOtherVehicles(timeDelta);

  hitDetection();

  renderer.render(scene, currentCamera);
  lastTimestamp = timestamp;
}

function startGame() {
  if (ready) {
    ready = false;
    scoreElement.innerText = 0;
    buttonsElement.style.opacity = 1;
    instructionsElement.style.opacity = 0;
    renderer.setAnimationLoop(animation);
  }
}

function positionScoreElement() {
  const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
  scoreElement.style.cssText = `
    left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
    top: ${window.innerHeight / 2}px
  `;
}

function reset() {
  // Reset position and score
  playerAngleMoved = 0;
  score = 0;
  scoreElement.innerText = "Press UP";

  // Xóa bounding box debug của người chơi nếu có
  if (playerCar.userData.boundingBox) {
      scene.remove(playerCar.userData.boundingBox);
      playerCar.userData.boundingBox = null;
  }

  // Remove other vehicles
  otherVehicles.forEach((vehicle) => {
      // Xóa bounding box debug nếu có
      if (vehicle.mesh.userData.boundingBox) {
          scene.remove(vehicle.mesh.userData.boundingBox);
      }
      scene.remove(vehicle.mesh);
  });
  otherVehicles = [];

  resultsElement.style.display = "none";
  lastTimestamp = undefined;

  movePlayerCar(0);
  renderer.render(scene, currentCamera);
  ready = true;
}

// Event listeners
accelerateButton.addEventListener("mousedown", function () {
  startGame();
  accelerate = true;
});

decelerateButton.addEventListener("mousedown", function () {
  startGame();
  decelerate = true;
});

accelerateButton.addEventListener("mouseup", function () {
  accelerate = false;
});

decelerateButton.addEventListener("mouseup", function () {
  decelerate = false;
});
document.getElementById('toggleHelpers').addEventListener('click', () => {
    debugCamera.toggleHelpers();
});
window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    startGame();
    accelerate = true;
    return;
  }
  if (event.key === "ArrowDown") {
    decelerate = true;
    return;
  }
  if (event.key === "R" || event.key === "r") {
    reset();
    return;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowUp") {
    accelerate = false;
    return;
  }
  if (event.key === "ArrowDown") {
    decelerate = false;
    return;
  }
});
const switchCameraButton = document.getElementById('switchCamera');
switchCameraButton.addEventListener('click', () => {
    currentCamera = currentCamera === topDownCamera ? driverCamera : topDownCamera;
    
    // Cập nhật tỉ lệ khung hình nếu cần
    if (currentCamera === driverCamera) {
        driverCamera.aspect = window.innerWidth / window.innerHeight;
        driverCamera.updateProjectionMatrix();
    }
});
// Handle window resize
window.addEventListener("resize", () => {
  console.log("resize", window.innerWidth, window.innerHeight);
  const newAspectRatio = window.innerWidth / window.innerHeight;

  // Cập nhật top-down camera (OrthographicCamera)
  if (topDownCamera) {
    const adjustedCameraHeight = cameraWidth / newAspectRatio;
    topDownCamera.top = adjustedCameraHeight / 2;
    topDownCamera.bottom = adjustedCameraHeight / -2;
    topDownCamera.updateProjectionMatrix();
  }

  // Cập nhật driver camera (PerspectiveCamera) 
  if (driverCamera) {
    driverCamera.aspect = newAspectRatio;
    driverCamera.updateProjectionMatrix();
  }

  // Cập nhật renderer size
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Cập nhật vị trí score element
  if (scoreElement) {
    positionScoreElement();
  }

  // Render lại scene với camera hiện tại
  if (scene && currentCamera) {
    renderer.render(scene, currentCamera);
  }
});

// Start the game
reset();