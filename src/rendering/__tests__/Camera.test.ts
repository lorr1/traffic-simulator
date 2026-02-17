import { describe, it, expect } from 'vitest';
import { Camera } from '../Camera';

describe('Camera', () => {
  const WIDTH = 800;
  const HEIGHT = 600;
  const ROAD_LENGTH = 2000;

  function createCamera(): Camera {
    return new Camera(WIDTH, HEIGHT, ROAD_LENGTH);
  }

  it('worldToScreen and screenToWorld are inverses', () => {
    const camera = createCamera();
    const wx = 500;
    const wy = 100;

    const screen = camera.worldToScreen(wx, wy);
    const world = camera.screenToWorld(screen.x, screen.y);

    expect(world.x).toBeCloseTo(wx, 6);
    expect(world.y).toBeCloseTo(wy, 6);
  });

  it('round-trip works after pan and zoom', () => {
    const camera = createCamera();
    camera.handlePan(50, -30);
    camera.zoom = 2.5;

    const wx = 1234;
    const wy = -56;

    const screen = camera.worldToScreen(wx, wy);
    const world = camera.screenToWorld(screen.x, screen.y);

    expect(world.x).toBeCloseTo(wx, 6);
    expect(world.y).toBeCloseTo(wy, 6);
  });

  it('zoom in increases pixel scale', () => {
    const camera = createCamera();
    const p1 = camera.worldToScreen(100, 0);
    const p2 = camera.worldToScreen(200, 0);
    const distBefore = Math.abs(p2.x - p1.x);

    camera.zoom = 2;
    const p3 = camera.worldToScreen(100, 0);
    const p4 = camera.worldToScreen(200, 0);
    const distAfter = Math.abs(p4.x - p3.x);

    expect(distAfter).toBeGreaterThan(distBefore);
  });

  it('zoom out decreases pixel scale', () => {
    const camera = createCamera();
    const p1 = camera.worldToScreen(100, 0);
    const p2 = camera.worldToScreen(200, 0);
    const distBefore = Math.abs(p2.x - p1.x);

    camera.zoom = 0.5;
    const p3 = camera.worldToScreen(100, 0);
    const p4 = camera.worldToScreen(200, 0);
    const distAfter = Math.abs(p4.x - p3.x);

    expect(distAfter).toBeLessThan(distBefore);
  });

  it('pan shifts world origin', () => {
    const camera = createCamera();
    const before = camera.worldToScreen(0, 0);

    camera.handlePan(100, 0); // drag right → world origin shifts left on screen
    const after = camera.worldToScreen(0, 0);

    // Panning right means x moves screen-right, so world(0,0) goes further right
    expect(after.x).toBeGreaterThan(before.x);
  });

  it('resize updates canvas dimensions', () => {
    const camera = createCamera();

    // Origin maps to center of canvas
    const before = camera.worldToScreen(0, 0);
    expect(before.x).toBeCloseTo(WIDTH / 2);
    expect(before.y).toBeCloseTo(HEIGHT / 2);

    camera.resize(1024, 768);
    const after = camera.worldToScreen(0, 0);
    expect(after.x).toBeCloseTo(1024 / 2);
    expect(after.y).toBeCloseTo(768 / 2);
  });

  it('handleZoom preserves the world point under the cursor', () => {
    const camera = createCamera();
    const cursorX = 300;
    const cursorY = 200;

    const worldBefore = camera.screenToWorld(cursorX, cursorY);
    camera.handleZoom(1, cursorX, cursorY);
    const worldAfter = camera.screenToWorld(cursorX, cursorY);

    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 4);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 4);
  });
});
