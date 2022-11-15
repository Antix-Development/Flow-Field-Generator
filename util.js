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

let 
TILE_SIZE = 24, // Tile dimensions

canvas, // Drawing
ctx,

newX, // Mouse coordinates
newY,
oldX,
oldY,

dragging, // True if the user is dragging the target or other about the grid
dragee, // Which cell the user is dragging about the grid
painting, // True if the user is painting walls or floors
brush, // Which type of cell the user is painting (floor or wall)

log,

hoverNode,
hoverCtx,

floor = Math.floor,

// Create drawing surface and setup mouse handlers
setupDisplayAndInteractivity = () => {

  document.getElementById('togglediagonals').checked = false;

  // Generate canvas and get drawing context
  canvas = document.createElement('canvas');
  canvas.width = GRID_WIDTH * TILE_SIZE;
  canvas.height = GRID_HEIGHT * TILE_SIZE;
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  // Create a DIV to print information to
  log = document.createElement('div');
  document.body.appendChild(log);

  // Create hover highlight
  hoverNode = document.createElement('canvas');
  hoverNode.width = TILE_SIZE;
  hoverNode.height = TILE_SIZE;
  hoverCtx = hoverNode.getContext('2d');
  hoverCtx.fillStyle = '#4060f080'; // Fill with alpha
  hoverCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  hoverNode.style.display = 'none'; // Hide
  hoverNode.style.position = 'absolute'; // Allow it to be positioned anywhere on the page
  hoverNode.style.pointerEvents = 'none'; // Allow clicking through to background
  document.body.appendChild(hoverNode);

  // Determine if the cell at the given coordinates matches the given value
  let matchNodeValue = (x, y, v) => (graph[y][x].value === v),

  // Paint the cell at the given location with the current brush
  paintNode = (x, y) => {
    if (!matchNodeValue(x, y, 2) && !matchNodeValue(x, y, 3)) { // Don't paint if the cell is occupied by the target or other

      graph[y][x].value = brush; // Set new value

      let node = graph[y][x]; // Get node at coordinates
      
      if (brush === 0) { // Rebuild neighbors if the node was turned into a floor

        ffg.reconnect(node);

      } else { // Remove neighbors if the node was turned into a wall

        ffg.disconnect(node);
      }

      ffg.buildFlowField(target.x, target.y);
      drawNodes();

    }
  },

  // Dump some information to the log DIV about the node the mouse pointer is hovering over
  logNode = (node) => {

    // Position hover tile and make it visible
    hoverNode.style.display = 'block';

    hoverNode.style.left = `${(node.x * TILE_SIZE) + (canvas.offsetLeft)}px`;
    hoverNode.style.top = `${(node.y * TILE_SIZE) + (canvas.offsetTop)}px`;

    // Generate neighbor nodes string
    let p = '',
    n = '',
    neighbors = node.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      n += `{x:${neighbor.x}, y:${neighbor.y}}, `
    }

    (node.parent) ? p = `{x:${node.parent.x}, y:${node.parent.y}}` : p = 'null';

    log.innerHTML = `
      coordinates: {x:${node.x}, y:${node.y}}<br>
      value: ${node.value}<br>
      distance: ${node.distance}<br>
      parent: ${p}<br>
      neighbors: (${neighbors.length}) [${n}]<br>
    `;
  },

  // Get mouse coordinates inside grid
  getMouseCoordinates = (e) => {
    oldX = newX; // Save old coordinates
    oldY = newY;

    newX = floor(((e.x - canvas.offsetLeft) + window.pageXOffset) / TILE_SIZE); // Get new coordinates, taking into account page scrolling
    newY = floor(((e.y - canvas.offsetTop) + window.pageYOffset) / TILE_SIZE);
  };

  // Hide hover tile and clear log text
  canvas.onmouseleave = () => {
    hoverNode.style.display = 'none'; log.innerHTML = '';
  }

  // Show hover tile
  canvas.onmouseenter = () => hoverNode.style.display = 'block';

  // Handle pointer down events
  canvas.onpointerdown = (e) => {
    getMouseCoordinates(e);

    oldX = newX;
    oldY = newY;

    if (matchNodeValue(newX, newY, 2) || matchNodeValue(newX, newY, 3))  {

      // Dragging

      painting = false;
      dragging = true;

      dragee = graph[newY][newX].value;

    } else {

      // Painting
      
      painting = true;
      dragging = false;

      if (matchNodeValue(newX, newY, 0)) {
        brush = 1; // Painting walls

      } else {
        brush = 0; // Painting floors

      }

      paintNode(newX, newY);
    }
  }

  // Handle pointer move events
  canvas.onpointermove = (e) => {
    getMouseCoordinates(e);

    if (dragging) {
      let thingBeingDragged, color;

      if (dragee === 2) { // Dragging target?
        thingBeingDragged = target ;
        color = '4c6';

      } else { // Must be dragging other
        color = 'c64';
        thingBeingDragged = other;
      }

      if (newX != thingBeingDragged.x || newY != thingBeingDragged.y) { // Only proceed if the location is different than the targets current location

        if (matchNodeValue(newX, newY, 0)) { // Only proceed if the cell is not a wall

          graph[thingBeingDragged.y][thingBeingDragged.x].value = 0; // Clear current position
          fillRect(thingBeingDragged.x, thingBeingDragged.y, '999');

          thingBeingDragged.x = newX; // Set new position
          thingBeingDragged.y = newY;

          graph[newY][newX].value = dragee;
          fillRect(newX, newY, color);

          ffg.buildFlowField(target.x, target.y);
          drawNodes();

        }
      }

    } else if (painting) { // Painting
      
      if (newX != oldX || newY != oldY) { // Avoid repeatedly painting cells
        paintNode(newX, newY);
      }
      
    }

    logNode(graph[newY][newX]);
  }

  // Handle pointer up events
  canvas.onpointerup = (e) => {
    dragging = false; // No longer dragging
    painting = false; // No longer painting

    ffg.buildFlowField(target.x, target.y);
    drawNodes();
  }

},

//Draw the path as returned by `ffg.buildPathToTarget()`
drawPath = (p) => {
  if (p) {
    ctx.strokeStyle = '#ee4';
    ctx.lineWidth = 2;
    let node = p[0];
    ctx.beginPath();
    ctx.moveTo((node.x * TILE_SIZE) + (TILE_SIZE / 2), (node.y * TILE_SIZE) + (TILE_SIZE / 2)); // Move to first coordinates
    for (let i = 1; i < p.length; i++) {
      ctx.lineTo((p[i].x * TILE_SIZE) + (TILE_SIZE / 2), (p[i].y * TILE_SIZE) + (TILE_SIZE / 2)); // Make a line to next coordinates
    }
    ctx.stroke();
  }
},

// Fill the canvas at the given coordinates with the given color
fillRect = (x, y, c) => {
  ctx.fillStyle = `#${c}`;
  ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
},

// Draw the nodes to the canvas
drawNodes = () => {
  ctx.clearRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT *  TILE_SIZE);

  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH;) {
      fillRect(c, r, ['999', '222', '4c6', 'c64'][graph[r][c++].value]);
    }
  }
  ctx.font = '13px monospace';
  ctx.fillStyle = '#eee';
  for (let y = 0; y < graph.length; y++) {
    for (let x = 0; x < graph[0].length; x++) {
      const node = graph[y][x];
      if (node.distance > -1) ctx.fillText(`${node.distance}`, (node.x * TILE_SIZE) + (TILE_SIZE / 2 - 8), (node.y * TILE_SIZE) + (TILE_SIZE / 2 + 4));
    }
  }

  drawPath(ffg.buildPathToTarget(other.x, other.y));
},

// Toggle diagonal pathfinding
toggleDiagonalMovement = (checkbox) => {

  graph[target.y][target.x].value = 0;
  graph[other.y][other.x].value = 0;
  
  ffg.enableDiagonalMovement(checkbox.checked);

  graph[target.y][target.x].value = 2;
  graph[other.y][other.x].value = 3;

  ffg.buildFlowField(target.x, target.y);
  
  drawNodes();
};
