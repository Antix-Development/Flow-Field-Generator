# Flow-Field Generator

## About

The `FlowFieldGenerator` class can be used to create single source 2 dimensional flow-fields for grid based games from one target node in a graph, to all other nodes in the same graph that are deemed "passable". 

This type of flow-field is useful in games where many actors are trying to find the shortest path to a single actor (many sources, one destination). 

The `FlowFieldGenerator` class is based on the Python code found at [Flow Field Pathfinding for Tower Defense](https://www.redblobgames.com/pathfinding/tower-defense/#diagram-parents), and I would highly recommend reading that article as it contains a very good explanation about Breadth First Searching and how to use the technique to create flow-fields. 

There are a number of files in this repository...
- **grid2d.js** - A simple class for creating and manipulating 2 dimensional arrays of numbers. It is used to create a grid which is then passed to the FlowFieldGenerator class to be converted into a graph of nodes suitable for building flow-fields from. This file can be ignored. 

- **util.js** - Some dirty code to display the graph and allow some basic interaction with it. This file can also be ignored. 

- **index.html** - Contains an interactive demo of the FlowFieldGenerator class. 

- **test.html** - A small performance test for a graph 1000 x 1000 in size. Dumps results to the console, so open your dev tools. 

- **node.js** - A sparse graph node class.

- **flowfieldgenerator.js** - The `FlowFieldGenerator` class. It should be fairly easy to follow and modify for your own applications. 

Please open an issue or contact me (antix.development@gmail.com) if you have questions or suggestions on how to improve the performance of the `FlowFieldGenerator` class. 

<br>

## Properties
The `FlowFieldGenerator` class encapsulates the following properties:

### `graph`
*{[node] A 2 dimensional array of nodes*

### `passableFilter`
*{function} Called by `isPassable` to determine if a graph node is passable.*

### `reached`
*{number} Incremental counter used to identify graph nodes that have been reached during queries.*

### `w`
*Width of the graph.*

### `h` 
*{number} Height of the graph.*


### `deltas`
*{[array]} an array offsets used when determining a graph nodes adjacent neighbors.*


<br>

## Methods
The `FlowFieldGenerator` class encapsulates the following methods:

<br>

### `graphFromArray(arr, convert = false)`
*Create graph from the given 2 dimensional array.*

@param {[number]} arr

@convert {boolean} convert

returns {[node]} graph

<br>

If a an array of values is passed to `graphFromArray()`, you can also specify whether or not you want to convert the passed array into an array of nodes (mutated). By default, `graphFromArray()` will remain unchanged (not mutated).

<br>

### `buildFlowField(x, y)`
*Build (or rebuild) the flow-field wherein all passable nodes point towards the target node at the given coordinates.*

@param {number} x

@param {number} y

The target node located at the given x,y coordinates `distance` property will be set to 0. All other nodes in the graph that are "reachable" will have their `distance` property set to their distance from the target node.

<br>

### `buildPathToTarget(x, y, trim = false)`
*Build a path of nodes from the node at the given coordinates to the target node.*

@param {number} x

@param {number} y

@param {boolean} trim

@returns {[node]} path

If the node at the given x, y coordinates was able to be reached during the latest query, an array of nodes will be created (and returned) by back-tracking through its parent node property until it arrives at the target node.

If you choose to trim the path, it will not contain the nodes containing the source or destination coordinates.

<br>

### `enableDiagonalMovement(state = true)`
*Enable or disable the use of diagonal movement according to the given state.*

@param {boolean} state

New instances of the `FlowFieldGenerator` class will have diagonal movement disabled.

NOTE: If the given state is different than the current state, then the graph will be rebuilt.

<br>

### `setPassableFilter(f)`
*Set passible filter, called by `isPassable()`*

@param {function} f 

You can also set the passable filter by directly poking the `FlowFieldGenerator` instances `passableFilter` property.

<br>

### `isPassable(x, y)`
*Determine if the node at the given coordinates is passable.*

@param {number} x

@param {number} y

@returns {boolean} passable

calls the current `passableFilter` function, passing it the graph node at the given x, y coordinates.

<br>

### `defaultPassableFilter(node)`
*Default filter called by `isPassable()`, determines whether the given node is passable*

@param {node} node
@returns {boolean}

The default function to determine if a node is deemed to be passable is

```
defaultPassableFilter(node) {
  return node.value === 0;
}
```

<br>

### `getGraph()`
*Get graph (a 2 dimensional array of node).*

@returns {[node]} graph

You can also access graph by peeking the `FlowFieldGenerator` instances `graph` property.

<br>

### `buildGraph()`
*Connect nodes in the graph by creating neighboring node lists for every node contained within it.*

<br>

### `buildNeighborsFor(node)`
*Build neighbors list for the given node.*

@param {node} node 

<br>

### `disconnect(node)`
*Disconnect the given node from the graph.*

@param {node} node 

<br>

### `reconnect(node)`
*Reconnect a previously disconnected node to the graph.*

@param {node} node 

<br>

## Usage

Using the `FlowFieldGenerator` class in your own projects should be fairly straightforward.

```
  // You will need to include the following 
  // two scripts in your code..

  <script src="node.js"></script>
  <script src="flowfieldgenerator.js"></script>

  // Create a 2d grid 20 wide and 10 high  
  let grid = [];
  for (let y = 0; y < 10; y++) {
    let row = [];
    for (let x = 0; x < 20; x++) {
      row.push(0);
    }
    grid.push(row);
  }

  // Create a new instance of the class
  const ffg = new FlowFieldGenerator();

  // Set the filter called when `isPassable()` is 
  // called by the class instance
  ffg.setPassableFilter((v) => (v === 0));

  // Enable diagonal movement
  ffg.enableDiagonalMovement(true);

  // Create the graph from our 2d array of values
  graph = ffg.graphFromArray(grid);

  // Create a flow-field with all empty nodes 
  // pathing to 10, 5
  ffg.buildFlowField(10, 5);

  // Build a path from 16, 8 to 10, 5
  let path = ffg.buildPathToTarget(16, 8);

  // Output the result
  console.log(path);
```
