export class GridCell {
  position: Float32Array;
  objects: Array<any> = [];
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.position = new Float32Array([x, 0, y, 1]);
    this.width = width;
    this.height = height;
  }
}
