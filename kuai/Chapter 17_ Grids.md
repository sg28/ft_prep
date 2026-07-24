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

### Depth-First Search (DFS)

DFS explores as deep as possible along each branch before backtracking. It can be implemented through recursion or using a stack.

#### Recursive DFS

* Modify the grid in place to mark as visited


```python=
def traverse_grid(grid):
    seen = set()

    def dfs(i, j):
        seen.add((i, j))
        # Check all four directions
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= ni < len(grid) and 0 <= nj < len(grid[0]) and (ni, nj) not in seen:
                dfs(ni, nj)
		
		dfs(0, 0)
```
To use this template:
* Start from a specified position
* Traverse all the island

When to use BFS vs DFS
* BFS: when we care about the distance from the root

```python=
    # traverse starting at (0, 0)
    dfs(0, 0)             
```

#### Iterative DFS

```python
def traverse_grid(grid):
    visited = set()

    def dfs(x, y):
        stack = [(x, y)]
        while stack:
            i, j = stack.pop()
            if (i, j) in visited:
                continue
            visited.add((i, j))
            # Check all four directions
            for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= ni < len(grid) and 0 <= nj < len(grid[0]):
                    stack.append((ni, nj))

    for x in range(len(grid)):
        for y in range(len(grid[0])):
            if (x, y) not in visited:
                dfs(x, y)
```

### Breadth-First Search (BFS)

BFS explores the grid level by level using a queue.

```python
from collections import deque

def traverse_grid(grid):
    seen = set()
    
    def bfs(x, y):
		    # Usually useful to append the level
        queue = deque([(x, y, 0)])
        while queue:
            i, j, l = queue.popleft()
            # Enqueue all adjacent cells that are within the grid bounds
            for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= ni < len(grid) and 0 <= nj < len(grid[0]) and (ni, nj) not in seen:
                    queue.append((ni, nj, l + 1))
                    seen.add((ni, nj))

		bfs(0, 0)

```

## Section 3: Solved Problems

### Problem 1: [Flood Fill](https://leetcode.com/problems/flood-fill/description/)

**Problem Statement**: An image is represented as a 2D array of integers, each integer representing the pixel value of the image. Given a coordinate `(sr, sc)` representing the starting pixel (row and column) of the flood fill, and a pixel value `newColor`, "flood fill" the image. To perform a flood fill, consider the starting pixel, plus any pixels connected 4-directionally to the starting pixel of the same color as the starting pixel, plus any pixels connected 4-directionally to those pixels (also with the same color), and so on. Replace the color of all of the aforementioned pixels with the `newColor`.

**Solution**:

```python
def floodFill(image, sr, sc, newColor):
    def fill(i, j):
        if image[i][j] == newColor:
            return
        old = image[i][j]
        image[i][j] = newColor
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if (
                0 <= ni < len(image)
                and 0 <= nj < len(image[0])
                and image[ni][nj] == old
            ):
                fill(ni, nj)

    fill(sr, sc)
    return image
```

**Explanation**: This function changes the color of an image in a region connected 4-directionally to the starting pixel `(sr, sc)`. We use DFS to traverse and color the connected components of the image. The boundary conditions ensure that the traversal does not go out of bounds.

### Problem 2: [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/)

**Problem Statement**: Given a 2D board containing `'X'` and `'O'`, capture all regions surrounded by `'X'`. A region is captured by flipping all `'O's into `'X's in that surrounded region.

**Solution**:

```python
def solve(board):
    seen = set()

    def dfs(i, j, flips):
        if board[i][j] != "O" or (i, j) in flips:
            return True
        flips.add((i, j))
        res = True
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if not 0 <= ni < len(board) or not 0 <= nj < len(board[0]):
                res = False
                continue
            res &= dfs(ni, nj, flips)
        return res

    for i in range(len(board)):
        for j in range(len(board[0])):
            flips = set()
            if not dfs(i, j, flips):
                seen |= flips
                continue
            for fi, fj in flips:
                board[fi][fj] = "X"
    return board
```

**Explanation**: This solution first marks the 'O's that are connected to the borders of the board using DFS, since these cannot be surrounded. It then traverses the board to flip the truly surrounded 'O's to 'X's and turns the temporary markers back to 'O's.

### Problem 3: [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)

**Problem Statement**: Given an `m x n` matrix of non-negative integers representing the height of each unit cell in a continent, the "Pacific ocean" touches the left and top edges of the matrix and the "Atlantic ocean" touches the right and bottom edges. Find the list of grid coordinates where water can flow to both the Pacific and Atlantic ocean.

**Solution**:

```python
def pacificAtlantic(heights):
    def dfs(i, j, seen):
        if (i, j) in seen:
            return
        seen.add((i, j))
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if (
                0 <= ni < len(heights)
                and 0 <= nj < len(heights[0])
                and heights[ni][nj] >= heights[i][j]
            ):
                dfs(ni, nj, seen)
        return

    pac = set()
    atl = set()
    for i in range(len(heights)):
        dfs(i, 0, pac)
        dfs(i, len(heights[0]) - 1, atl)
    for j in range(len(heights[0])):
        dfs(0, j, pac)
        dfs(len(heights) - 1, j, atl)

    return [[i, j] for i, j in pac & atl]
```

**Explanation**: This function computes sets of cells that can reach the Pacific and Atlantic oceans. It starts DFS from the edges that touch each ocean, checking if the next cell's height allows water to flow to it from the current cell. The intersection of these sets gives the cells where water can flow to both oceans.

### Problem 4: [Path with Maximum Gold](https://leetcode.com/problems/path-with-maximum-gold/)

**Problem Statement**: In a grid of size `m x n`, each cell can contain a certain amount of gold, or it can be empty (0). Starting from any position with gold, collect as much gold as possible by moving up, down, left, or right, and stopping when in a position with no gold or out of bounds. You can't visit the same cell more than once in the same path. Return the maximum amount of gold you can collect.

**Solution**:

```python
def getMaximumGold(grid):
    def dfs(i, j, seen):
        seen.add((i, j))
        res = grid[i][j] + max(
            (
                dfs(ni, nj, seen)
                for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1))
                if 0 <= ni < len(grid)
                and 0 <= nj < len(grid[0])
                and (ni, nj) not in seen
                and grid[ni][nj] != 0
            ),
            default=0,
        )
        seen.remove((i, j))
        return res

    res = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] != 0:
                res = max(res, dfs(i, j, set()))
    return res
```

**Explanation**: The function traverses the grid, starting DFS from each cell that contains gold. It uses recursion to explore all possible paths, collecting gold and updating the maximum amount collected. The cell's gold is set to zero during the visit to prevent revisiting, and restored afterwards for backtracking.

### Problem 5: [Smallest Rectangle Enclosing Black Pixels](https://leetcode.com/problems/smallest-rectangle-enclosing-black-pixels/)

**Problem Statement**: An image is represented as a binary matrix with 0s and 1s, where 0s represent white pixels and 1s represent black pixels. Given the location `(x, y)` of one black pixel, return the area of the smallest (axis-aligned) rectangle that encloses all black pixels.

**Solution**:

```python
def minArea(image, x, y):
    # [left, up, right, down]
    bounds = [len(image), len(image[0]), -1, -1]

    seen = set()

    def dfs(i, j):
        if (i, j) in seen:
            return
        print((i, j))
        bounds[0] = min(bounds[0], i)
        bounds[1] = min(bounds[1], j)
        bounds[2] = max(bounds[2], i)
        bounds[3] = max(bounds[3], j)
        seen.add((i, j))
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if (
                0 <= ni < len(image)
                and 0 <= nj < len(image[0])
                and image[ni][nj] == "1"
            ):
                dfs(ni, nj)

    dfs(x, y)

    return (bounds[2] - bounds[0] + 1) * (bounds[3] - bounds[1] + 1)
```

**Explanation**: This function starts DFS from the given black pixel and marks all visited pixels to prevent revisiting. It updates the bounds of the smallest rectangle during DFS. The area of the rectangle is calculated using the difference between maximum and minimum row and column indices.

### Problem 6: [Max Area of Island](https://leetcode.com/problems/max-area-of-island/)

**Problem Statement**: Given a non-empty 2D array `grid` of either 0's (water) or 1's (land), compute the maximum area of an island in the grid. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

**Solution**:

```python
def maxAreaOfIsland(grid):
    def dfs(i, j, seen):
        if (i, j) in seen:
            return
        seen.add((i, j))
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= ni < len(grid) and 0 <= nj < len(grid[0]) and grid[ni][nj] == 1:
                dfs(ni, nj, seen)

    visited = set()
    res = 0

    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 1 and (i, j) not in visited:
                seen = set()
                dfs(i, j, seen)
                res = max(res, len(seen))
                visited |= seen
    return res
```

**Explanation**: This function uses DFS to explore each potential island, summing up the area (number of cells) and updating the maximum found so far. It marks cells as visited by setting them to 0.

### Problem 7: [Coloring a Border](https://leetcode.com/problems/coloring-a-border/)

**Problem Statement**: Given a 2D grid of integers `grid`, an integer `r0`, `c0`, representing the row and column of a starting cell, and an integer `color`, color the border of the connected component of the cell with a new color. A border is defined as a cell that has at least one neighbor (either up, down, left, or right) that is not part of the component, or is on the edge of the grid.

**Solution**:

```python
def colorBorder(grid, r0, c0, color):
    to_color = set()
    seen = set()

    def dfs(i, j):
        if (i, j) in seen:
            return
        seen.add((i, j))
        neighbors = 0
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if (
                0 <= ni < len(grid)
                and 0 <= nj < len(grid[0])
                and grid[ni][nj] == grid[i][j]
            ):
                neighbors += 1
                dfs(ni, nj)
        if neighbors < 4:
            to_color.add((i, j))

    dfs(row, col)
    for i, j in to_color:
        grid[i][j] = color
    return grid
```

**Explanation**: This solution involves using DFS to explore the connected component starting from `(r0, c0)`. During the DFS, we determine if a cell is a border cell, either by being at the grid edge or having a neighbor not in the component. These border cells are then colored.

### Problem 8: [Word Search](https://leetcode.com/problems/word-search/description/)

**Problem Statement**: Given a 2D grid of letters and a word, check if the word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where "adjacent" cells are horizontally or vertically neighboring. The same cell may not be used more than once.

**Solution**:

```python
def exist(board, word):
    seen = set()

    def dfs(i, j, idx):
        if board[i][j] != word[idx] or (i, j) in seen:
            return False
        seen.add((i, j))
        if idx == len(word) - 1:
            return True
        res = any(
            dfs(ni, nj, idx + 1)
            for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1))
            if 0 <= ni < len(board) and 0 <= nj < len(board[0])
        )
        seen.remove((i, j))
        return res

    return any(
        dfs(i, j, 0) for i in range(len(board)) for j in range(len(board[0]))
    )
```

**Explanation**: This function uses DFS to try to build the word starting from each cell. If a cell matches the current letter of the word, it continues to adjacent cells. The board temporarily marks visited cells to avoid reuse during the search.

### Problem 9: [Number of Enclaves](https://leetcode.com/problems/number-of-enclaves/)

**Problem Statement**: Given a 2D grid where 0 represents water and 1 represents land, count the number of land cells that are completely surrounded by water on all 4 sides and not connected to any border (either vertically or horizontally).

**Solution**:

```python
def numEnclaves(grid):
    ones = sum(grid[i][j] for i in range(len(grid)) for j in range(len(grid[0])))
    seen = set()

    def dfs(i, j):
        if (i, j) in seen:
            return
        seen.add((i, j))
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= ni < len(grid) and 0 <= nj < len(grid[0]) and grid[ni][nj] == 1:
                dfs(ni, nj)

    for i in range(len(grid)):
        for j in (0, len(grid[0]) - 1):
            if grid[i][j] == 1:
                dfs(i, j)

    for j in range(len(grid[0])):
        for i in (0, len(grid) - 1):
            if grid[i][j] == 1:
                dfs(i, j)

    return ones - len(seen)
```

**Explanation**: This solution first removes all land cells connected to the grid's borders using DFS, marking them as water. It then counts the remaining land cells, which represent enclaves.

### Problem 10: [Nearest Exit from Entrance in Maze](https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/)

**Problem Statement**: You are given a 2D array representing a maze with walls and spaces. An entrance is provided, and you need to find the nearest exit (which is on the border of the maze, not including the entrance itself) using the shortest path. The maze contains only `0` (open path) and `1` (wall).

**Solution**:

```python
from collections import deque

def nearestExit(maze, entrance):
    steps = deque([(entrance[0], entrance[1], 0)])
    seen = {(entrance[0], entrance[1])}

    def neighbors(i, j):
        for nei_i, nei_j in ((i, j + 1), (i + 1, j), (i, j - 1), (i - 1, j)):
            if (
                0 <= nei_i < len(maze)
                and 0 <= nei_j < len(maze[0])
                and maze[nei_i][nei_j] == "."
                and (nei_i, nei_j) not in seen
            ):
                yield nei_i, nei_j

    def is_exit(i, j):
        return i in (0, len(maze) - 1) or j in (0, len(maze[0]) - 1)

    while steps:
        i, j, s = steps.popleft()
        if s > 0 and is_exit(i, j):
            return s
        for nei_i, nei_j in neighbors(i, j):
            seen.add((nei_i, nei_j))
            steps.append((nei_i, nei_j, s + 1))

    return -1
```

**Explanation**: BFS is used to explore the shortest paths from the entrance. Each node records its distance from the entrance. When the first exit is reached (i.e., a node on the boundary that is not the entrance), the current distance is returned. Visiting nodes are tracked to prevent reprocessing and to optimize the search.

### Problem 11: [As Far from Land as Possible](https://leetcode.com/problems/as-far-from-land-as-possible/description/)

**Problem Statement**: Given an `N x N` grid containing `0`s (water) and `1`s (land), find the maximum distance to the nearest land for any water cell.

**Solution**:

```python
def maxDistance(grid):
    def neighbors(i, j, seen):
        for ni, nj in ((i + 1, j), (i, j + 1), (i - 1, j), (i, j - 1)):
            if (
                0 <= ni < len(grid)
                and 0 <= nj < len(grid[0])
                and grid[ni][nj] == 0
                and (ni, nj) not in seen
            ):
                yield ni, nj

    seen = set()
    q = deque()
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 1:
                q.append((i, j, 0))

    res = -1
    while q:
        i, j, s = q.popleft()
        if s > 0:
            res = max(res, s)
        for ni, nj in neighbors(i, j, seen):
            seen.add((ni, nj))
            q.append((ni, nj, s + 1))
    return res
```

**Explanation**: This solution uses a multi-source BFS starting from all land cells simultaneously. It explores outward, marking water cells as visited (turning them into land) and counting the levels of BFS. The distance when no more expansions are possible is the answer.

### Problem 12: [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/description/)

**Problem Statement**: Given a 2D grid representing oranges that can be fresh (1), rotten (2), or empty (0), determine the minimum time required for all fresh oranges to become rotten. Each minute, any fresh orange adjacent to a rotten one becomes rotten.

**Solution**:

```python
def orangesRotting(grid):
    seen = set()
    q = deque()
    fresh = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 2:
                q.append((i, j, 0))
            elif grid[i][j] == 1:
                fresh += 1

    def neighbors(i, j):
        for ni, nj in ((i + 1, j), (i, j + 1), (i - 1, j), (i, j - 1)):
            if (
                0 <= ni < len(grid)
                and 0 <= nj < len(grid[0])
                and grid[ni][nj] == 1
                and (ni, nj) not in seen
            ):
                yield ni, nj

    rotted = 0
    res = 0
    while q:
        i, j, t = q.popleft()
        if t > 0:
            rotted += 1
            res = max(res, t)
        for ni, nj in neighbors(i, j):
            seen.add((ni, nj))
            q.append((ni, nj, t + 1))

    return -1 if rotted < fresh else res
```

**Explanation**: Multi-source BFS starts from all rotten oranges. Fresh oranges turn rotten when touched by a rotten one, and the time is tracked. If any fresh oranges remain after the BFS, the result is -1; otherwise, it's the last recorded time.

### Problem 13: [Minimum Knight Moves](https://leetcode.com/problems/minimum-knight-moves/description/)

**Problem Statement**: In an infinite chessboard, calculate the minimum number of moves a knight needs to reach a target position from the origin (0, 0).

**Solution**:

```python
def minKnightMoves(x, y):
    def minKnightMoves(self, x: int, y: int) -> int:
    q = deque([(x, y, 0)])
    seen = {(x, y)}
    DIRS = ((2, 1), (1, 2), (2, -1), (1, -2), (-2, -1), (-1, -2), (-2, 1), (-1, 2))

    def neighbors(i, j):
        for delta in DIRS:
            ni, nj = i + delta[0], j + delta[1]
            if (ni, nj) not in seen:
                yield ni, nj

    while q:
        i, j, s = q.popleft()
        if i == 0 and j == 0:
            return s
        for ni, nj in neighbors(i, j):
            seen.add((ni, nj))
            q.append((ni, nj, s + 1))

```

**Explanation**: The solution uses BFS to explore all possible knight moves. The search space is limited by considering only moves that stay within a reasonable boundary relative to the origin and the target, and by working in only the first quadrant due to symmetry. Each cell visited keeps track of the distance traveled.

### Problem 14: [Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/description/)

**Problem Statement**: Given an `n x n` binary matrix grid where each 1 represents a wall and 0 represents a passable cell, find the shortest path from the top-left corner (0,0) to the bottom-right corner (n-1,n-1) using only 8-directional movement.

**Solution**:

```python
def shortestPathBinaryMatrix(grid):
    if grid[0][0] == 1:
        return -1
    q = deque([(0, 0, 1)])
    seen = {(0, 0)}

    def neighbors(i, j):
        for delta in (
            (0, 1),
            (1, 0),
            (0, -1),
            (-1, 0),
            (1, 1),
            (1, -1),
            (-1, -1),
            (-1, 1),
        ):
            ni, nj = i + delta[0], j + delta[1]
            if (
                0 <= ni < len(grid)
                and 0 <= nj < len(grid[0])
                and grid[ni][nj] == 0
                and (ni, nj) not in seen
            ):
                yield ni, nj

    while q:
        i, j, s = q.popleft()
        if i == len(grid) - 1 and j == len(grid[0]) - 1:
            return s
        for ni, nj in neighbors(i, j):
            seen.add((ni, nj))
            q.append((ni, nj, s + 1))
    return -1
```

**Explanation**: BFS is applied directly to find the shortest path, considering all 8 possible directions of movement. If the start or the end cell is blocked, the function returns -1 immediately. Each visited cell is marked to avoid revisiting.

### Problem 15: [01 Matrix](https://leetcode.com/problems/01-matrix/description/)

**Problem Statement**: Given a matrix consists of 0 and 1, find the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1.

**Solution**:

```python
def updateMatrix(mat):
    q = deque()
    seen = set()
    for i in range(len(mat)):
        for j in range(len(mat[0])):
            if mat[i][j] == 0:
                q.append((i, j, 0))
                seen.add((i, j))

    def neighbors(i, j):
        for ni, nj in ((i + 1, j), (i, j + 1), (i - 1, j), (i, j - 1)):
            if (
                0 <= ni < len(mat)
                and 0 <= nj < len(mat[0])
                and (ni, nj) not in seen
            ):
                yield ni, nj

    while q:
        i, j, s = q.popleft()
        mat[i][j] = s
        for ni, nj in neighbors(i, j):
            seen.add((ni, nj))
            q.append((ni, nj, s + 1))
    return mat
```

**Explanation**: This multi-source BFS starts from all cells containing 0, simultaneously expanding outward to calculate the shortest distance to a zero for all 1s. The BFS ensures that each cell is updated with the minimum distance to a zero.

### Problem 16: [Walls and Gates](https://leetcode.com/problems/walls-and-gates/description/)

**Problem Statement**: Fill each empty room with the distance to its nearest gate in a matrix where -1 represents a wall, 0 represents a gate, and INF (infinity) represents an empty room.

**Solution**:

```python
def wallsAndGates(rooms):
    q = deque()
    seen = set()
    inf = 2147483647

    for i in range(len(rooms)):
        for j in range(len(rooms[0])):
            if rooms[i][j] == 0:
                q.append((i, j, 0))
                seen.add((i, j))

    def neighbors(i, j):
        for ni, nj in ((i + 1, j), (i, j + 1), (i - 1, j), (i, j - 1)):
            if (
                0 <= ni < len(rooms)
                and 0 <= nj < len(rooms[0])
                and rooms[ni][nj] == inf
                and (ni, nj) not in seen
            ):
                yield ni, nj

    while q:
        i, j, s = q.popleft()
        rooms[i][j] = s
        for ni, nj in neighbors(i, j):
            seen.add((ni, nj))
            q.append((ni, nj, s + 1))
```

**Explanation**: Similar to the "01 Matrix" problem, this uses a multi-source BFS starting from gates. Each step propagates the distance from the nearest gate to adjacent rooms, efficiently filling the matrix with the shortest distances.
