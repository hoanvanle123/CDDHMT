export const config = {
    showHitZones: false,
    shadows: true,
    trees: true,
    curbs: true,
    grid: false
};

export const colors = {
    vehicle: [0xa52523, 0xef2d56, 0x0ad3ff, 0xff9f1c],
    lawnGreen: "#67C240",
    trackColor: "#546E90",
    edgeColor: "#725F48",
    treeCrown: 0x498c2c,
    treeTrunk: 0x4b3f2f
};

export const trackDimensions = {
    radius: 225,
    width: 45,
    get innerRadius() { return this.radius - this.width; },
    get outerRadius() { return this.radius + this.width; }
};

export const arcAngles = {
    angle1: (1 / 3) * Math.PI,
    get deltaY() { return Math.sin(this.angle1) * trackDimensions.innerRadius; },
    get angle2() { return Math.asin(this.deltaY / trackDimensions.outerRadius); },
    get centerX() {
        return (Math.cos(this.angle1) * trackDimensions.innerRadius + 
                Math.cos(this.angle2) * trackDimensions.outerRadius) / 2;
    },
    get angle3() { return Math.acos(this.centerX / trackDimensions.innerRadius); },
    get angle4() { return Math.acos(this.centerX / trackDimensions.outerRadius); }
};

export const gameSettings = {
    speed: 0.0017,
    playerAngleInitial: Math.PI
};