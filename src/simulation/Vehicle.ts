export class Vehicle {
  id: number;
  x: number;
  speed: number;
  acceleration: number;
  laneIndex: number;
  length: number;
  desiredSpeed: number;

  constructor(
    id: number,
    x: number,
    speed: number,
    laneIndex: number,
    desiredSpeed: number,
    length: number = 5,
  ) {
    this.id = id;
    this.x = x;
    this.speed = speed;
    this.acceleration = 0;
    this.laneIndex = laneIndex;
    this.length = length;
    this.desiredSpeed = desiredSpeed;
  }
}
