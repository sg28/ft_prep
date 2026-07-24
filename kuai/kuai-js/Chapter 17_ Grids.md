# Chapter 17: Grids

## Section 1: Introduction to Grids

Grids are a specific type of graph represented in a matrix format. Each cell in the matrix can be seen as a node, and edges exist between adjacent cells. Grids are widely used in various applications such as image processing, pathfinding in games, and geographical mapping.

### Definitions and Terminologies

- **Grid**: A grid is a matrix of cells, where each cell can represent different entities such as land or water.

- **Cell**: A cell is a single element in the grid that represents a node in graph terminology.

- **Adjacency**: In a grid, a cell can have up to four adjacent cells: up, down, left, and right. Diagonal adjacency is also possible but less common.

- **Island**: In a grid context, an island is a group of connected cells (horizontally or vertically) that are of the same type, typically represented by `1`s in a binary grid.

### Sample Grid

Let's consider a sample binary grid for illustration. This grid uses `0`s to represent water and `1`s to represent land.

```
0 1 0 0
1 1 0 0
0 0 1 1
0 0 0 1
```

In this grid, there are two islands:
1. The island formed by cells `(0,1)`, `(1,0)`, and `(1,1)`.
2. The island formed by cells `(2,2)`, `(2,3)`, and `(3,3)`.

## Section 2: Grid Traversal Methods

Traversal methods for grids are similar to graph traversal methods. The main types are Depth-First Search (DFS) and Breadth-First Search (BFS).

A note on coordinates as keys: JavaScript `Set` and `Map` compare arrays by reference, so `[i, j]` cannot be used directly as a membership key (two arrays with the same contents are considered different). Throughout this chapter we therefore encode a coordinate as a string key, ``​`${i},${j}`​``, when we need to track visited cells.

### Depth-First Search (DFS)

DFS explores as deep as possible along each branch before backtracking. It can be implemented through recursion or using a stack.

#### Recursive DFS

* Modify the grid in place, or use a `Set` to mark cells as visited.


```javascript
function traverseGrid(grid) {
  const seen = new Set();

  function dfs(i, j) {
    seen.add(`${i},${j}`);
    // Check all four directions
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        !seen.has(`${ni},${nj}`)
      ) {
        dfs(ni, nj);
      }
    }
  }

  // traverse starting at (0, 0)
  dfs(0, 0);
}
```
To use this template:
* Start from a specified position
* Traverse the whole island

When to use BFS vs DFS
* BFS: when we care about the distance from the root

```javascript
// traverse starting at (0, 0)
dfs(0, 0);
```

#### Iterative DFS

```javascript
function traverseGrid(grid) {
  const visited = new Set();

  function dfs(x, y) {
    const stack = [[x, y]];
    while (stack.length > 0) {
      const [i, j] = stack.pop();
      if (visited.has(`${i},${j}`)) continue;
      visited.add(`${i},${j}`);
      // Check all four directions
      for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
        if (ni >= 0 && ni < grid.length && nj >= 0 && nj < grid[0].length) {
          stack.push([ni, nj]);
        }
      }
    }
  }

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      if (!visited.has(`${x},${y}`)) {
        dfs(x, y);
      }
    }
  }
}
```

### Breadth-First Search (BFS)

BFS explores the grid level by level using a queue. JavaScript has no built-in deque, and `Array.prototype.shift` is O(n). For BFS we use a plain array as the queue plus a head index (`head`) that we advance instead of shifting, which keeps dequeuing O(1).

```javascript
function traverseGrid(grid) {
  const seen = new Set();

  function bfs(x, y) {
    // The third element tracks the level (distance from the start)
    const queue = [[x, y, 0]];
    let head = 0;
    seen.add(`${x},${y}`);
    while (head < queue.length) {
      const [i, j, l] = queue[head++];
      // Enqueue all adjacent cells that are within the grid bounds
      for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
        if (
          ni >= 0 && ni < grid.length &&
          nj >= 0 && nj < grid[0].length &&
          !seen.has(`${ni},${nj}`)
        ) {
          queue.push([ni, nj, l + 1]);
          seen.add(`${ni},${nj}`);
        }
      }
    }
  }

  bfs(0, 0);
}
```

## Section 3: Solved Problems

### Problem 1: [Flood Fill](https://leetcode.com/problems/flood-fill/description/)

**Problem Statement**: An image is represented as a 2D array of integers, each integer representing the pixel value of the image. Given a coordinate `(sr, sc)` representing the starting pixel (row and column) of the flood fill, and a pixel value `newColor`, "flood fill" the image. To perform a flood fill, consider the starting pixel, plus any pixels connected 4-directionally to the starting pixel of the same color as the starting pixel, plus any pixels connected 4-directionally to those pixels (also with the same color), and so on. Replace the color of all of the aforementioned pixels with the `newColor`.

**Solution**:

```javascript
function floodFill(image, sr, sc, newColor) {
  function fill(i, j) {
    if (image[i][j] === newColor) return;
    const old = image[i][j];
    image[i][j] = newColor;
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < image.length &&
        nj >= 0 && nj < image[0].length &&
        image[ni][nj] === old
      ) {
        fill(ni, nj);
      }
    }
  }

  fill(sr, sc);
  return image;
}
```

**Explanation**: This function changes the color of an image in a region connected 4-directionally to the starting pixel `(sr, sc)`. We use DFS to traverse and color the connected components of the image. The boundary conditions ensure that the traversal does not go out of bounds.

### Problem 2: [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/)

**Problem Statement**: Given a 2D board containing `'X'` and `'O'`, capture all regions surrounded by `'X'`. A region is captured by flipping all `'O'`s into `'X'`s in that surrounded region.

**Solution**:

```javascript
function solve(board) {
  const seen = new Set();

  function dfs(i, j, flips) {
    if (board[i][j] !== "O" || flips.has(`${i},${j}`)) return true;
    flips.add(`${i},${j}`);
    let res = true;
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (!(ni >= 0 && ni < board.length) || !(nj >= 0 && nj < board[0].length)) {
        res = false;
        continue;
      }
      res = dfs(ni, nj, flips) && res;
    }
    return res;
  }

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const flips = new Set();
      if (!dfs(i, j, flips)) {
        for (const key of flips) seen.add(key);
        continue;
      }
      for (const key of flips) {
        const [fi, fj] = key.split(",").map(Number);
        board[fi][fj] = "X";
      }
    }
  }
  return board;
}
```

**Explanation**: This solution first marks the 'O's that are connected to the borders of the board using DFS, since these cannot be surrounded. Any region whose DFS ever reaches the grid edge is not surrounded, so its cells are recorded in `seen` and skipped. Truly surrounded regions are flipped to 'X'. Note that `res = dfs(...) && res` (rather than short-circuiting) ensures every reachable cell is visited before we decide.

### Problem 3: [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)

**Problem Statement**: Given an `m x n` matrix of non-negative integers representing the height of each unit cell in a continent, the "Pacific ocean" touches the left and top edges of the matrix and the "Atlantic ocean" touches the right and bottom edges. Find the list of grid coordinates where water can flow to both the Pacific and Atlantic ocean.

**Solution**:

```javascript
function pacificAtlantic(heights) {
  function dfs(i, j, seen) {
    if (seen.has(`${i},${j}`)) return;
    seen.add(`${i},${j}`);
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < heights.length &&
        nj >= 0 && nj < heights[0].length &&
        heights[ni][nj] >= heights[i][j]
      ) {
        dfs(ni, nj, seen);
      }
    }
  }

  const pac = new Set();
  const atl = new Set();
  for (let i = 0; i < heights.length; i++) {
    dfs(i, 0, pac);
    dfs(i, heights[0].length - 1, atl);
  }
  for (let j = 0; j < heights[0].length; j++) {
    dfs(0, j, pac);
    dfs(heights.length - 1, j, atl);
  }

  const res = [];
  for (const key of pac) {
    if (atl.has(key)) {
      res.push(key.split(",").map(Number));
    }
  }
  return res;
}
```

**Explanation**: This function computes sets of cells that can reach the Pacific and Atlantic oceans. It starts DFS from the edges that touch each ocean, checking if the next cell's height allows water to flow to it from the current cell. The intersection of these sets gives the cells where water can flow to both oceans.

### Problem 4: [Path with Maximum Gold](https://leetcode.com/problems/path-with-maximum-gold/)

**Problem Statement**: In a grid of size `m x n`, each cell can contain a certain amount of gold, or it can be empty (0). Starting from any position with gold, collect as much gold as possible by moving up, down, left, or right, and stopping when in a position with no gold or out of bounds. You can't visit the same cell more than once in the same path. Return the maximum amount of gold you can collect.

**Solution**:

```javascript
function getMaximumGold(grid) {
  function dfs(i, j, seen) {
    seen.add(`${i},${j}`);
    let best = 0;
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        !seen.has(`${ni},${nj}`) &&
        grid[ni][nj] !== 0
      ) {
        best = Math.max(best, dfs(ni, nj, seen));
      }
    }
    const res = grid[i][j] + best;
    seen.delete(`${i},${j}`);
    return res;
  }

  let res = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] !== 0) {
        res = Math.max(res, dfs(i, j, new Set()));
      }
    }
  }
  return res;
}
```

**Explanation**: The function traverses the grid, starting DFS from each cell that contains gold. It uses recursion to explore all possible paths, collecting gold and updating the maximum amount collected. The current cell is marked as visited during the recursion to prevent revisiting, and unmarked afterwards for backtracking. The `best` accumulator plays the role of Python's `max(..., default=0)`, defaulting to 0 when a cell has no eligible neighbors.

### Problem 5: [Smallest Rectangle Enclosing Black Pixels](https://leetcode.com/problems/smallest-rectangle-enclosing-black-pixels/)

**Problem Statement**: An image is represented as a binary matrix with 0s and 1s, where 0s represent white pixels and 1s represent black pixels. Given the location `(x, y)` of one black pixel, return the area of the smallest (axis-aligned) rectangle that encloses all black pixels.

**Solution**:

```javascript
function minArea(image, x, y) {
  // [left, up, right, down]
  const bounds = [image.length, image[0].length, -1, -1];

  const seen = new Set();

  function dfs(i, j) {
    if (seen.has(`${i},${j}`)) return;
    bounds[0] = Math.min(bounds[0], i);
    bounds[1] = Math.min(bounds[1], j);
    bounds[2] = Math.max(bounds[2], i);
    bounds[3] = Math.max(bounds[3], j);
    seen.add(`${i},${j}`);
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < image.length &&
        nj >= 0 && nj < image[0].length &&
        image[ni][nj] === "1"
      ) {
        dfs(ni, nj);
      }
    }
  }

  dfs(x, y);

  return (bounds[2] - bounds[0] + 1) * (bounds[3] - bounds[1] + 1);
}
```

**Explanation**: This function starts DFS from the given black pixel and marks all visited pixels to prevent revisiting. It updates the bounds of the smallest rectangle during DFS. The area of the rectangle is calculated using the difference between maximum and minimum row and column indices.

### Problem 6: [Max Area of Island](https://leetcode.com/problems/max-area-of-island/)

**Problem Statement**: Given a non-empty 2D array `grid` of either 0's (water) or 1's (land), compute the maximum area of an island in the grid. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

**Solution**:

```javascript
function maxAreaOfIsland(grid) {
  function dfs(i, j, seen) {
    if (seen.has(`${i},${j}`)) return;
    seen.add(`${i},${j}`);
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === 1
      ) {
        dfs(ni, nj, seen);
      }
    }
  }

  const visited = new Set();
  let res = 0;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === 1 && !visited.has(`${i},${j}`)) {
        const seen = new Set();
        dfs(i, j, seen);
        res = Math.max(res, seen.size);
        for (const key of seen) visited.add(key);
      }
    }
  }
  return res;
}
```

**Explanation**: This function uses DFS to explore each potential island, summing up the area (number of cells) and updating the maximum found so far. Cells already assigned to an island are tracked in `visited` so each island is only counted once.

### Problem 7: [Coloring a Border](https://leetcode.com/problems/coloring-a-border/)

**Problem Statement**: Given a 2D grid of integers `grid`, an integer `r0`, `c0`, representing the row and column of a starting cell, and an integer `color`, color the border of the connected component of the cell with a new color. A border is defined as a cell that has at least one neighbor (either up, down, left, or right) that is not part of the component, or is on the edge of the grid.

**Solution**:

```javascript
function colorBorder(grid, r0, c0, color) {
  const toColor = new Set();
  const seen = new Set();

  function dfs(i, j) {
    if (seen.has(`${i},${j}`)) return;
    seen.add(`${i},${j}`);
    let neighbors = 0;
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === grid[i][j]
      ) {
        neighbors += 1;
        dfs(ni, nj);
      }
    }
    if (neighbors < 4) {
      toColor.add(`${i},${j}`);
    }
  }

  dfs(r0, c0);
  for (const key of toColor) {
    const [i, j] = key.split(",").map(Number);
    grid[i][j] = color;
  }
  return grid;
}
```

**Explanation**: This solution involves using DFS to explore the connected component starting from `(r0, c0)`. During the DFS, we determine if a cell is a border cell, either by being at the grid edge or having a neighbor not in the component (fewer than 4 same-value neighbors). These border cells are then colored.

### Problem 8: [Word Search](https://leetcode.com/problems/word-search/description/)

**Problem Statement**: Given a 2D grid of letters and a word, check if the word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where "adjacent" cells are horizontally or vertically neighboring. The same cell may not be used more than once.

**Solution**:

```javascript
function exist(board, word) {
  const seen = new Set();

  function dfs(i, j, idx) {
    if (board[i][j] !== word[idx] || seen.has(`${i},${j}`)) return false;
    seen.add(`${i},${j}`);
    if (idx === word.length - 1) return true;
    let res = false;
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (ni >= 0 && ni < board.length && nj >= 0 && nj < board[0].length) {
        if (dfs(ni, nj, idx + 1)) {
          res = true;
          break;
        }
      }
    }
    seen.delete(`${i},${j}`);
    return res;
  }

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (dfs(i, j, 0)) return true;
    }
  }
  return false;
}
```

**Explanation**: This function uses DFS to try to build the word starting from each cell. If a cell matches the current letter of the word, it continues to adjacent cells. Visited cells are tracked in `seen` and unmarked on backtracking to avoid reuse within a single path.

### Problem 9: [Number of Enclaves](https://leetcode.com/problems/number-of-enclaves/)

**Problem Statement**: Given a 2D grid where 0 represents water and 1 represents land, count the number of land cells that are completely surrounded by water on all 4 sides and not connected to any border (either vertically or horizontally).

**Solution**:

```javascript
function numEnclaves(grid) {
  let ones = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      ones += grid[i][j];
    }
  }
  const seen = new Set();

  function dfs(i, j) {
    if (seen.has(`${i},${j}`)) return;
    seen.add(`${i},${j}`);
    for (const [ni, nj] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === 1
      ) {
        dfs(ni, nj);
      }
    }
  }

  for (let i = 0; i < grid.length; i++) {
    for (const j of [0, grid[0].length - 1]) {
      if (grid[i][j] === 1) dfs(i, j);
    }
  }

  for (let j = 0; j < grid[0].length; j++) {
    for (const i of [0, grid.length - 1]) {
      if (grid[i][j] === 1) dfs(i, j);
    }
  }

  return ones - seen.size;
}
```

**Explanation**: This solution first marks all land cells connected to the grid's borders using DFS. It then subtracts those border-connected cells from the total land count, leaving only the enclaves.

### Problem 10: [Nearest Exit from Entrance in Maze](https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/)

**Problem Statement**: You are given a 2D array representing a maze with walls and spaces. An entrance is provided, and you need to find the nearest exit (which is on the border of the maze, not including the entrance itself) using the shortest path. The maze contains only `'+'` (wall) and `'.'` (open path).

**Solution**:

```javascript
function nearestExit(maze, entrance) {
  const steps = [[entrance[0], entrance[1], 0]];
  let head = 0;
  const seen = new Set([`${entrance[0]},${entrance[1]}`]);

  function* neighbors(i, j) {
    for (const [neiI, neiJ] of [[i, j + 1], [i + 1, j], [i, j - 1], [i - 1, j]]) {
      if (
        neiI >= 0 && neiI < maze.length &&
        neiJ >= 0 && neiJ < maze[0].length &&
        maze[neiI][neiJ] === "." &&
        !seen.has(`${neiI},${neiJ}`)
      ) {
        yield [neiI, neiJ];
      }
    }
  }

  function isExit(i, j) {
    return i === 0 || i === maze.length - 1 || j === 0 || j === maze[0].length - 1;
  }

  while (head < steps.length) {
    const [i, j, s] = steps[head++];
    if (s > 0 && isExit(i, j)) return s;
    for (const [neiI, neiJ] of neighbors(i, j)) {
      seen.add(`${neiI},${neiJ}`);
      steps.push([neiI, neiJ, s + 1]);
    }
  }

  return -1;
}
```

**Explanation**: BFS is used to explore the shortest paths from the entrance. Each node records its distance from the entrance. When the first exit is reached (i.e., a node on the boundary that is not the entrance), the current distance is returned. Visited nodes are tracked to prevent reprocessing and to optimize the search.

### Problem 11: [As Far from Land as Possible](https://leetcode.com/problems/as-far-from-land-as-possible/description/)

**Problem Statement**: Given an `N x N` grid containing `0`s (water) and `1`s (land), find the maximum distance to the nearest land for any water cell.

**Solution**:

```javascript
function maxDistance(grid) {
  function* neighbors(i, j, seen) {
    for (const [ni, nj] of [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === 0 &&
        !seen.has(`${ni},${nj}`)
      ) {
        yield [ni, nj];
      }
    }
  }

  const seen = new Set();
  const q = [];
  let head = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === 1) {
        q.push([i, j, 0]);
      }
    }
  }

  let res = -1;
  while (head < q.length) {
    const [i, j, s] = q[head++];
    if (s > 0) {
      res = Math.max(res, s);
    }
    for (const [ni, nj] of neighbors(i, j, seen)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, s + 1]);
    }
  }
  return res;
}
```

**Explanation**: This solution uses a multi-source BFS starting from all land cells simultaneously. It explores outward, marking water cells as visited and counting the levels of BFS. The distance recorded when the frontier reaches the farthest water cell is the answer.

### Problem 12: [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/description/)

**Problem Statement**: Given a 2D grid representing oranges that can be fresh (1), rotten (2), or empty (0), determine the minimum time required for all fresh oranges to become rotten. Each minute, any fresh orange adjacent to a rotten one becomes rotten.

**Solution**:

```javascript
function orangesRotting(grid) {
  const seen = new Set();
  const q = [];
  let head = 0;
  let fresh = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === 2) {
        q.push([i, j, 0]);
      } else if (grid[i][j] === 1) {
        fresh += 1;
      }
    }
  }

  function* neighbors(i, j) {
    for (const [ni, nj] of [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]]) {
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === 1 &&
        !seen.has(`${ni},${nj}`)
      ) {
        yield [ni, nj];
      }
    }
  }

  let rotted = 0;
  let res = 0;
  while (head < q.length) {
    const [i, j, t] = q[head++];
    if (t > 0) {
      rotted += 1;
      res = Math.max(res, t);
    }
    for (const [ni, nj] of neighbors(i, j)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, t + 1]);
    }
  }

  return rotted < fresh ? -1 : res;
}
```

**Explanation**: Multi-source BFS starts from all rotten oranges. Fresh oranges turn rotten when touched by a rotten one, and the time is tracked. If any fresh oranges remain after the BFS, the result is -1; otherwise, it's the last recorded time.

### Problem 13: [Minimum Knight Moves](https://leetcode.com/problems/minimum-knight-moves/description/)

**Problem Statement**: In an infinite chessboard, calculate the minimum number of moves a knight needs to reach a target position from the origin (0, 0).

**Solution**:

```javascript
function minKnightMoves(x, y) {
  const q = [[x, y, 0]];
  let head = 0;
  const seen = new Set([`${x},${y}`]);
  const DIRS = [
    [2, 1], [1, 2], [2, -1], [1, -2],
    [-2, -1], [-1, -2], [-2, 1], [-1, 2],
  ];

  function* neighbors(i, j) {
    for (const [di, dj] of DIRS) {
      const ni = i + di;
      const nj = j + dj;
      if (!seen.has(`${ni},${nj}`)) {
        yield [ni, nj];
      }
    }
  }

  while (head < q.length) {
    const [i, j, s] = q[head++];
    if (i === 0 && j === 0) return s;
    for (const [ni, nj] of neighbors(i, j)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, s + 1]);
    }
  }

  return -1;
}
```

**Explanation**: The solution uses BFS to explore all possible knight moves, searching backward from the target toward the origin. Because the board is infinite, each visited cell keeps track of the distance traveled and is recorded in `seen` to avoid revisiting. The first time BFS reaches `(0, 0)`, that distance is the answer; the trailing `return -1` is a safety fallback (the origin is always reachable for valid inputs).

### Problem 14: [Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/description/)

**Problem Statement**: Given an `n x n` binary matrix grid where each 1 represents a wall and 0 represents a passable cell, find the shortest path from the top-left corner (0,0) to the bottom-right corner (n-1,n-1) using only 8-directional movement.

**Solution**:

```javascript
function shortestPathBinaryMatrix(grid) {
  if (grid[0][0] === 1) return -1;
  const q = [[0, 0, 1]];
  let head = 0;
  const seen = new Set(["0,0"]);

  function* neighbors(i, j) {
    const deltas = [
      [0, 1], [1, 0], [0, -1], [-1, 0],
      [1, 1], [1, -1], [-1, -1], [-1, 1],
    ];
    for (const [di, dj] of deltas) {
      const ni = i + di;
      const nj = j + dj;
      if (
        ni >= 0 && ni < grid.length &&
        nj >= 0 && nj < grid[0].length &&
        grid[ni][nj] === 0 &&
        !seen.has(`${ni},${nj}`)
      ) {
        yield [ni, nj];
      }
    }
  }

  while (head < q.length) {
    const [i, j, s] = q[head++];
    if (i === grid.length - 1 && j === grid[0].length - 1) return s;
    for (const [ni, nj] of neighbors(i, j)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, s + 1]);
    }
  }
  return -1;
}
```

**Explanation**: BFS is applied directly to find the shortest path, considering all 8 possible directions of movement. If the start cell is blocked, the function returns -1 immediately. Each visited cell is marked to avoid revisiting.

### Problem 15: [01 Matrix](https://leetcode.com/problems/01-matrix/description/)

**Problem Statement**: Given a matrix consists of 0 and 1, find the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1.

**Solution**:

```javascript
function updateMatrix(mat) {
  const q = [];
  let head = 0;
  const seen = new Set();
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[0].length; j++) {
      if (mat[i][j] === 0) {
        q.push([i, j, 0]);
        seen.add(`${i},${j}`);
      }
    }
  }

  function* neighbors(i, j) {
    for (const [ni, nj] of [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]]) {
      if (
        ni >= 0 && ni < mat.length &&
        nj >= 0 && nj < mat[0].length &&
        !seen.has(`${ni},${nj}`)
      ) {
        yield [ni, nj];
      }
    }
  }

  while (head < q.length) {
    const [i, j, s] = q[head++];
    mat[i][j] = s;
    for (const [ni, nj] of neighbors(i, j)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, s + 1]);
    }
  }
  return mat;
}
```

**Explanation**: This multi-source BFS starts from all cells containing 0, simultaneously expanding outward to calculate the shortest distance to a zero for all 1s. The BFS ensures that each cell is updated with the minimum distance to a zero.

### Problem 16: [Walls and Gates](https://leetcode.com/problems/walls-and-gates/description/)

**Problem Statement**: Fill each empty room with the distance to its nearest gate in a matrix where -1 represents a wall, 0 represents a gate, and INF (infinity) represents an empty room.

**Solution**:

```javascript
function wallsAndGates(rooms) {
  const q = [];
  let head = 0;
  const seen = new Set();
  const inf = 2147483647;

  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[0].length; j++) {
      if (rooms[i][j] === 0) {
        q.push([i, j, 0]);
        seen.add(`${i},${j}`);
      }
    }
  }

  function* neighbors(i, j) {
    for (const [ni, nj] of [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]]) {
      if (
        ni >= 0 && ni < rooms.length &&
        nj >= 0 && nj < rooms[0].length &&
        rooms[ni][nj] === inf &&
        !seen.has(`${ni},${nj}`)
      ) {
        yield [ni, nj];
      }
    }
  }

  while (head < q.length) {
    const [i, j, s] = q[head++];
    rooms[i][j] = s;
    for (const [ni, nj] of neighbors(i, j)) {
      seen.add(`${ni},${nj}`);
      q.push([ni, nj, s + 1]);
    }
  }
}
```

**Explanation**: Similar to the "01 Matrix" problem, this uses a multi-source BFS starting from gates. Each step propagates the distance from the nearest gate to adjacent rooms, efficiently filling the matrix with the shortest distances.
