/* 

MIT License

Copyright 2022 Cliff Earl, Antix Development

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and  associated documentation  files (the "Software"), to deal in 
the  Software without restriction,  including without limitation  the rights to 
use, copy,  modify, merge, publish, distribute,  sublicense, and/or sell copies 
of the Software, and to permit persons  to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this  permission notice shall be included in all 
copies or substantial portions of the Software.

THE  SOFTWARE IS  PROVIDED "AS  IS", WITHOUT  WARRANTY OF ANY  KIND, EXPRESS OR 
IMPLIED,  INCLUDING BUT  NOT  LIMITED  TO THE  WARRANTIES  OF  MERCHANTABILITY, 
FITNESS FOR A  PARTICULAR PURPOSE  AND NONINFRINGEMENT. IN  NO EVENT  SHALL THE 
AUTHORS  OR  COPYRIGHT  HOLDERS BE  LIABLE  FOR  ANY CLAIM,  DAMAGES  OR  OTHER 
LIABILITY, WHETHER IN  AN ACTION OF  CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION  WITH THE SOFTWARE OR THE USE  OR OTHER DEALINGS IN THE 
SOFTWARE.

*/ 

class Grid2D {
  constructor() {
  }

  /** Create a new grid with the given dimensions and set all cells within it to the given value
   * @param {number} w Width
   * @param {number} h Height
   * @param {number} v Cell value
   */
  newGrid (w, h, v = 0) {
    let g = [];
    for (let y = 0; y < h; y++) {
      let r = [];
      for (let x = 0; x < w; x++) {
        r.push(v);
      }
      g.push(r);
    }

    this.w = w; // Save dimensions
    this.h = h;

    this.grid = g;

    return g;
  }

  /** Get the width of the grid
   * @returns {number} Width
   */
  getWidth () {
    return this.w;
  }

  /** Get the height of the grid
   * @returns {number} Height
   */
  getWidth() {
    return this.h;
  }

  /** Determine if the given coordinates lie within the bounds of the grid
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  inside(x, y) {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }
  
  /** Get the value contained in the cell at the given coordinates
   * @param {number} x 
   * @param {number} y 
   * @returns {number} Value
   */
  getCell(x, y) {
    return this.g[y][x];
  }

  /** Set the grid cell at the given coordinates to the given value
   * @param {number} x 
   * @param {number} y 
   * @param {number} v
   */
  setCell(x, y, v) {
    this.g[y][x] = v;
  }

  /** Determine if the value of the cell at the given coordinates matches the given value
   * @param {number} x 
   * @param {number} y 
   * @param {number} v 
   * @returns {boolean}
   */
  matchCell(x, y, v) {
    this.g[y][x] === v;
  }

  /** Set all cells within the given rectangular area inside the grid to the given value
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   * @param {number} v Value
   */
  fillRect(x, y, w, h, v) {
    for (let r = y; r < y + h; r++) {
      for (let c = 0; c < x + w; c++) {
        this.setCell(c, r, v);
      }
    }
  }

  /** Set all grid cells to the given value
   * @param {number} v - Value to which all grid cells will be set
   */
  clear(v) {
    this.fillRect(0, 0, this.w, this.h, v);
  }

}
