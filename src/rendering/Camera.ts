export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;
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
    return {
      x: (wx - this.x) * scale + this.canvasWidth / 2,
      y: (wy - this.y) * scale + this.canvasHeight / 2,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const scale = this.baseScale * this.zoom;
    return {
      x: (sx - this.canvasWidth / 2) / scale + this.x,
      y: (sy - this.canvasHeight / 2) / scale + this.y,
    };
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    const scale = this.baseScale * this.zoom;
    ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.x, -this.y);
  }

  handlePan(dx: number, dy: number): void {
    const scale = this.baseScale * this.zoom;
    this.x -= dx / scale;
    this.y -= dy / scale;
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
