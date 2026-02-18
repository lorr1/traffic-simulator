const DEFAULT_TILT = 0.28; // ~16° in radians

export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;
  tilt: number = DEFAULT_TILT;
  private canvasWidth: number;
  private canvasHeight: number;
  private baseScale: number;

  constructor(canvasWidth: number, canvasHeight: number, roadLength: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseScale = canvasWidth / roadLength;
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    const scale = this.baseScale * this.zoom;
    const dx = wx - this.x;
    const dy = wy - this.y;
    // Isometric shear: x_screen gets an offset from y, y_screen is foreshortened
    const sinT = Math.sin(this.tilt);
    const cosT = Math.cos(this.tilt);
    return {
      x: (dx + dy * sinT) * scale + this.canvasWidth / 2,
      y: dy * cosT * scale + this.canvasHeight / 2,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const scale = this.baseScale * this.zoom;
    const sinT = Math.sin(this.tilt);
    const cosT = Math.cos(this.tilt);
    const relX = (sx - this.canvasWidth / 2) / scale;
    const relY = (sy - this.canvasHeight / 2) / scale;
    const dy = relY / cosT;
    const dx = relX - dy * sinT;
    return {
      x: dx + this.x,
      y: dy + this.y,
    };
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    const scale = this.baseScale * this.zoom;
    const sinT = Math.sin(this.tilt);
    const cosT = Math.cos(this.tilt);
    ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    // Combined scale + shear matrix: [scale, 0, scale*sinT, scale*cosT, 0, 0]
    ctx.transform(scale, 0, scale * sinT, scale * cosT, 0, 0);
    ctx.translate(-this.x, -this.y);
  }

  handlePan(dx: number, dy: number): void {
    const scale = this.baseScale * this.zoom;
    const sinT = Math.sin(this.tilt);
    const cosT = Math.cos(this.tilt);
    // Invert the screen-to-world delta
    const dwy = dy / (scale * cosT);
    const dwx = dx / scale - dwy * sinT;
    this.x -= dwx;
    this.y -= dwy;
  }

  handleZoom(delta: number, centerX: number, centerY: number): void {
    const worldBefore = this.screenToWorld(centerX, centerY);
    const zoomFactor = 1.1;
    if (delta > 0) {
      this.zoom *= zoomFactor;
    } else {
      this.zoom /= zoomFactor;
    }
    const worldAfter = this.screenToWorld(centerX, centerY);
    this.x -= worldAfter.x - worldBefore.x;
    this.y -= worldAfter.y - worldBefore.y;
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}
