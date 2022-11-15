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

class FlowFieldGenerator {

  constructor() {
    this.enableDiagonalMovement(false); // Disable diagonal movement
    this.setPassableFilter(this.defaultPassableFilter);
    this.reached = 0; // Reset "node reached" flag
  }

  /** Enable or disable the use of diagonal movement according to the given state
   * @param {boolean} state 
   */
  enableDiagonalMovement(state = true) {
    (state) ? this.deltas = [[-1, 0], [1, 0], [0, -1], [0, 1] ,[-1, -1], [1, -1], [1, 1], [-1, 1]] : this.deltas = [[0, -1], [1, 0], [0, 1],  [-1, 0]];

    if (this.diagonalMovementEnabled != state) {
      this.diagonalMovementEnabled = state; // Save state
      this.buildGraph(); // Rebuild graph
    };
  }

  /** Set passible filter, called by `isPassable()`
   * @param {function} f 
   */
   setPassableFilter(f) {
    this.passableFilter = f;
  }

  /** Default filter called by `isPassable()`
   * @param {node} node 
   * @returns {boolean}
   */
  defaultPassableFilter(node) {
    return node.value === 0;
  }

  /** Determine if the node at the given coordinates is passable
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean} passable
   */
  isPassable(x, y) {
    return this.passableFilter(this.graph[y][x]);
  }

  /** Get the graph (a 2 dimensional array of node)
   * @returns {[node]} graph
   */
  getGraph() {
    return this.graph;
  }

  /** Convert the given 2 dimensional array of values into nodes
   * @param {array} arr Array
   * @param {boolean} convert 
   * @returns {[node]} graph
   */
  graphFromArray(arr, convert = false) {
    let 
    w = arr[0].length,
    h = arr.length,
    nodes;

    if (typeof arr[0][0] != 'object') { // Is the array is an array of values

      if (convert) { // Did the caller request that the given array of values be converted into an array of nodes?

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            arr[y][x] = new Node(x, y, arr[y][x]); // Overwrite with a new node
          }
        }
        nodes = arr;

      } else { // The caller wants a new array of nodes to be reated, preserving the given array

        nodes = []; // Create a new array

        for (let y = 0; y < h; y++) {
          let row = [];
          for (let x = 0; x < w; x++) {
            row.push(new Node(x, y, arr[y][x])); // Insert a new node
          }
          nodes.push(row);
        }
      }
    }

    this.w = w; // Save dimensions
    this.h = h;

    this.graph = nodes;

    this.buildGraph(); // Rebuild neighbors for all nodes

    return nodes;
  }

  /** Connect nodes in the graph by creating neighboring node lists for every node contained within it
   */
  buildGraph() {
    let graph = this.graph;
    if (graph) { // Make sure it exists before proceeding
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          this.buildNeighborsFor(graph[y][x]); // Build neighbor list for node
        }
      }
    }
  }

  /** Build neighbors list for the given node
   * @param {node} node 
   */
  buildNeighborsFor(node) {
    let neighbors = []; // An empty list of neighbors

    for (let i = 0; i < this.deltas.length; i++) { // Check all directions
      let nX = node.x + this.deltas[i][0], // Get neighboring node coordinates
      nY = node.y + this.deltas[i][1];

      // Add to neighbors list if within bounds, and "passable"
      if (nX >= 0 && nX < this.w && nY >= 0 && nY < this.h && this.isPassable(nX, nY)) neighbors.push(this.graph[nY][nX]);
    }
    node.neighbors = neighbors;
  }

  /** Disconnect the given node from the graph
   * @param {node} node 
   */
  disconnect(node) {
    let neighbors = node.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      // Disconnect node from neighbor if it is currently in the neighbors list of neighbors
      if (neighbor.neighbors.includes(node)) neighbor.neighbors.splice(neighbor.neighbors.indexOf(node), 1);
    }
    node.neighbors = [];
    node.parent = null;
    node.distance = -1;
  }

  /** Reconnect a previously disconnected node to the graph
   * @param {*} node 
   */
  reconnect(node) {
    this.buildNeighborsFor(node);

    // Reconnect given node to all of its neighboring nodes
    let neighbors = node.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (this.isPassable(neighbor.x, neighbor.y) && !neighbor.neighbors.includes(node)) neighbor.neighbors.push(node);
    }
  }

  /** Build a path of nodes from the node at the given coordinates to the target node
   * @param {number} x 
   * @param {number} y 
   * @param {boolean} trim 
   * @returns {[node]} or null if no path
   */
  buildPathToTarget(x, y, trim = false) {
    if (this.graph[y][x].reached != this.reached) return null; // Exit if this node was not included in the most recently generated flow field

    let node = this.graph[y][x], // Start of the path
    
    path = [];

    if (trim) node = node.parent; // Omit the source coordinates if trim was requested

    while (node.distance != 0) {
      path.push(node);
      node = node.parent;
    }

    if (!trim) path.push(node); // Omit the target coordinates if trim was requested
    
    return path;
  }

  /** Build a flow field wherein all "passable" nodes point towards the target node at the given coordinates
   * @param {number} x 
   * @param {number} y 
   */
  buildFlowField(x, y) {
    this.reached++; // Increment reach count for next search

    let targetNode = this.graph[y][x], // The node to which all others want to reach

    frontier = [targetNode]; // Add start node to both lists

    targetNode.distance = 0; // Set distance to target node to 0 (this is the target node)
    targetNode.reached = this.reached; // Set target node as reached

    while (frontier.length) { // Loop until empty

      let 
      current = frontier.shift(), // Next node
      neighbors = current.neighbors; // Get list of all neighboring nodes (any node with a value of 1 or more has been excluded)

      for (let i = 0; i < neighbors.length;) { // Process all neighboring nodes
        let neighbor = neighbors[i++]; // Next neighbor

        if (neighbor.reached != this.reached) { // Check if neighbor already added to flow field

          neighbor.reached = this.reached; // Set reached variable
          neighbor.parent = current; // Set parent node (path to target node)
          neighbor.distance = current.distance + 1; // Distance from target node (measured in nodes)
          
          frontier.push(neighbor); // Also search the neighbors of this neighbor
        }
      }
    }
  }

} // End class
