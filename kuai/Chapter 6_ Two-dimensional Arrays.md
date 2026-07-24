# Chapter 6: Two-dimensional Arrays

## Section 1: Introduction

A 2D array, often referred to as a matrix, is an array of arrays. Imagine it as a table with rows and columns, where each cell is accessed by its row and column indices. 2D arrays can be implemented using nested lists.

### Creating and Accessing 2D Arrays

- **Initialization**: A 2D array can be initialized as follows:

    ```python
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    ```

    This creates a 3x3 matrix.

- **Accessing Elements**: To access an element, you specify the row and column indices. For example, `matrix[0][1]` accesses the element in the first row and second column.

- **Iterating Over a 2D Array**: You can iterate over the rows and then each element in the row:

    ```python
    for row in matrix:
      for item in row:
          print(item)
    ```

### Common Operations

- **Row and Column Length**: The number of rows is `len(matrix)`, and the number of columns in the first row (assuming all rows have the same length) is `len(matrix[0])`.

- **Matrix Transposition**:

    ```python
    def transpose(matrix):
        rows, cols = len(matrix), len(matrix[0])
        transposed = [[0 for _ in range(rows)] for _ in range(cols)]

        for i in range(rows):
            for j in range(cols):
                transposed[j][i] = matrix[i][j]
        return transposed
    ```

- **Square Matrix Transposition (In Place)**:

    ```python
    def transposeSquareMatrix(matrix):
        n = len(matrix)
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    ```

---

## Section 2: Solved Problems

### Problem 1: [Rotate Image](https://leetcode.com/problems/rotate-image/)

**Problem Statement**: Given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You need to rotate the image in place, which means modifying the input 2D matrix directly.

**Solution 1**: Transpose + Reverse

```python
def rotate(matrix):
    n = len(matrix)
    # Transpose: swap rows and columns
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()
```

**Explanation**:

1. **Transpose**: Convert rows into columns (and columns into rows).
2. **Reverse Rows**: Reversing each row of the transposed matrix produces the 90° clockwise rotation.

**Complexity**:

- **Time**: $O(n^2)$
- **Space**: $O(1)$ (in-place)

**Solution 2**: Boundary Rotation with Parallel Assignment

```python
def rotate(matrix):
    n = len(matrix)
    for i in range(n // 2):
        for j in range(i, n - 1 - i):
            (
                # top
                matrix[i][j],  
                # left
                matrix[n - 1 - j][i],
                # bottom
                matrix[n - 1 - i][n - 1 - j],
                # right
                matrix[j][n - 1 - i],  
            ) = (
                # old left
                matrix[n - 1 - j][i],
                # old bottom
                matrix[n - 1 - i][n - 1 - j],
                # old right
                matrix[j][n - 1 - i],
                # old top
                matrix[i][j],
            )
```

**Explanation**: Each loop processes one “ring” or boundary of the matrix, performing a circular swap of the four edges:
  - Top → Right
  - Right → Bottom
  - Bottom → Left
  - Left → Top

**Complexity**:

- **Time**: $O(n^2)$
- **Space**: $O(1)$ (in-place)

### Problem 2: [Lonely Pixel](https://www.lintcode.com/problem/882/)

**Problem Statement**: Given a picture consisting of black and white pixels represented by 'B' and 'W' respectively, and represented as a 2D char array, find the number of black lonely pixels. A black lonely pixel is characterized by not having any other black pixels in the same row or column.

**Solution**:

```python
def findLonelyPixel(picture):
    rows, cols = len(picture), len(picture[0])
    rowCount = [0] * rows
    colCount = [0] * cols
    
    for i in range(rows):
        for j in range(cols):
            if picture[i][j] == 'B':
                rowCount[i] += 1
                colCount[j] += 1
                
    lonelyCount = 0
    for i in range(rows):
        for j in range(cols):
            if picture[i][j] == 'B' and rowCount[i] == 1 and colCount[j] == 1:
                lonelyCount += 1
    
    return lonelyCount
```

**Explanation**: Iterate through the grid to count the occurrence of black pixels in each row and column, storing these counts. Go through the grid again. For each 'B' pixel, check if its row and column counts are both 1.

### Problem 3: [Image Overlap](https://leetcode.com/problems/image-overlap/description/)

**Problem Statement**: Given two binary images `img1` and `img2` represented as square binary matrices, find the maximum overlap `img1` can have over `img2` by shifting `img1` up, down, left, or right.

**Solution**:

```python
def largestOverlap(img1: list[list[int]], img2: list[list[int]]) -> int:
    def overlap(row_offset, col_offset) -> int:
        return sum(
            img1[i][j] == img2[i - row_offset][j - col_offset] == 1
            for i in range(max(0, row_offset), min(n, n + row_offset))
            for j in range(max(0, col_offset), min(n, n + col_offset))
        )

    n = len(img1)
    return max(
        overlap(row_offset, col_offset)
        for row_offset in range(-n + 1, n)
        for col_offset in range(-n + 1, n)
    )
```

**Explanation**: Shift image `img1` in all possible directions and count the number of overlapping 1s with image `img2` for each shift.

### Problem 4: [Queens That Can Attack the King](https://leetcode.com/problems/queens-that-can-attack-the-king/) 

**Problem Statement**: On an 8x8 chessboard, some queens and one king are placed. You need to return all the queens that can attack the king in one move.

**Solution**:

```python
def queensAttacktheKing(queens, king):
    result = []
    board = [[0] * 8 for _ in range(8)]
    
    for x, y in queens:
        board[x][y] = 1

    directions = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]

    for dx, dy in directions:
        x, y = king
        while 0 <= x < 8 and 0 <= y < 8:
            if board[x][y] == 1:
                result.append([x, y])
                break
            x, y = x + dx, y + dy

    return result
```

**Explanation**: Initialize the chessboard and mark the positions of the queens and the king. From the king's position, check all eight possible directions (vertical, horizontal, and diagonal) for attacking queens. Stop checking a direction upon finding a queen or reaching the board's edge.

### Problem 5: [Spiral Matrix](https://leetcode.com/problems/spiral-matrix)

**Problem Statement**: Given an `m x n` matrix, return all elements of the matrix in spiral order.

**Solution**:

```python
def spiralOrder(matrix: list[list[int]]) -> list[int]:
    k = min(len(matrix), len(matrix[0]))

    def traverse_boundary(matrix, start):
        for j in range(start, len(matrix[0]) - start):
            res.append(matrix[start][j])
        for i in range(start + 1, len(matrix) - start):
            res.append(matrix[i][len(matrix[0])-start-1])
        if len(matrix)-start-1 == start or len(matrix[0])-start-1 == start:
            return
        for j in range(len(matrix[0]) - start - 2, start, -1):
            res.append(matrix[len(matrix)-start-1][j])
        for i in range(len(matrix) - start - 1, start, -1):
            res.append(matrix[i][start])

    res = []
    for i in range((k + 1) // 2):
        traverse_boundary(matrix, i)
    return res
```

### Problem 6: [Spiral Matrix II](https://leetcode.com/problems/spiral-matrix-ii/)

**Problem Statement**: Given a positive integer `n`, generate an `n x n` matrix filled with elements from 1 to `n^2` in spiral order.

**Solution**:

```python
def generateMatrix(n):
    matrix = [[0] * n for _ in range(n)]
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x, y, di = 0, 0, 0

    for i in range(1, n*n + 1):
        matrix[x][y] = i
        dx, dy = directions[di]
        if not (0 <= x + dx < n and 0 <= y + dy < n and matrix[x + dx][y + dy] == 0):
            di = (di + 1) % 4  # Change direction
            dx, dy = directions[di]
        x, y = x + dx, y + dy

    return matrix
```

### Problem 7: [Diagonal Traverse](https://leetcode.com/problems/diagonal-traverse/)

**Problem Statement**: Given an `m x n` matrix, return all elements of the matrix in a diagonal order, starting from the top left corner and moving in a zigzag pattern.
![image](https://hackmd.io/_uploads/Sy3w8JDf0.png)

**Solution**:

```python
def findDiagonalOrder(mat: list[list[int]]) -> list[int]:
    if not mat or not mat[0]:
        return []
    
    rows, cols = len(mat), len(mat[0])
    result, intermediate = [], []
    for d in range(rows + cols - 1):
        intermediate.clear()
        r, c = (d, 0) if d < cols else (cols - 1, d - cols + 1)
        while r >= 0 and c < rows:
            intermediate.append(mat[c][r])
            r -= 1
            c += 1
        if d % 2 == 0:
            intermediate.reverse()
        result.extend(intermediate)
    return result
```

**Explanation**: Maintain a direction variable that dictates whether you're moving up-right or down-left. Change direction when you hit the borders. Ensure your traversal respects the matrix boundaries, changing direction when necessary.

### Problem 8: [Find Valid Matrix Given Row and Column Sums](https://leetcode.com/problems/find-valid-matrix-given-row-and-column-sums/)

**Problem Statement**: You are given two arrays, `rowSum` and `colSum`, of length `m` and `n` respectively, where `m` is the number of rows and `n` is the number of columns of a 2D matrix.

Construct a 2D matrix that satisfies the following conditions:

1. The matrix contains non-negative integers.
2. The sum of elements in each row equals the corresponding element in `rowSum`.
3. The sum of elements in each column equals the corresponding element in `colSum`.

**Solution**:

```python
def restoreMatrix(rowSum, colSum):
    m, n = len(rowSum), len(colSum)
    matrix = [[0] * n for _ in range(m)]
    
    for i in range(m):
        for j in range(n):
            matrix[i][j] = min(rowSum[i], colSum[j])
            rowSum[i] -= matrix[i][j]
            colSum[j] -= matrix[i][j]
    
    return matrix
```

**Explanation**: Initialize a matrix with zeros. Iterate through the matrix, filling each cell with the minimum of the current row's and column's sum. After filling each cell, update the respective row and column sums.

### Problem 9: [Valid Tic-Tac-Toe State](https://leetcode.com/problems/valid-tic-tac-toe-state/)

**Problem Statement**: Given a `3 x 3` Tic-Tac-Toe board represented, determine if it's in a valid state. A state is valid if it can be reached by playing a series of valid moves from an empty board.

**Solution**:

```python
def validTicTacToe(board: list[str]) -> bool:
    def win(player):
        for i in range(3):
            if all([board[i][j] == player for j in range(3)]) or all([board[j][i] == player for j in range(3)]):
                return True
        return board[0][0] == board[1][1] == board[2][2] == player or board[0][2] == board[1][1] == board[2][0] == player

    xCount = sum(row.count('X') for row in board)
    oCount = sum(row.count('O') for row in board)

    if oCount not in (xCount - 1, xCount):
        return False
    if win('X') and xCount != oCount + 1:
        return False
    if win('O') and xCount != oCount:
        return False

    return True
```

**Explanation**: Count the number of 'X' and 'O' on the board. The number of 'X's must be equal to or one more than the number of 'O's. Check if there are any winning conditions for 'X' or 'O'. If both have winning lines, the state is invalid. If 'O' has a winning line, the number of 'X's should be equal to 'O's. If 'X' has a winning line, there should be one more 'X' than 'O'.

### Problem 10: [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)

**Problem Statement**: Given an `m x n` matrix, if an element is `0`, set its entire row and column to `0`. You must do it in place.

**Solution**:

```python
def setZeroes(matrix):
    is_col = False
    R, C = len(matrix), len(matrix[0])
    
    for i in range(R):
        if matrix[i][0] == 0:
            is_col = True
        for j in range(1, C):
            if matrix[i][j] == 0:
                matrix[0][j] = 0
                matrix[i][0] = 0
    
    for i in range(1, R):
        for j in range(1, C):
            if not matrix[i][0] or not matrix[0][j]:
                matrix[i][j] = 0
    
    if matrix[0][0] == 0:
        for j in range(C):
            matrix[0][j] = 0
            
    if is_col:
        for i in range(R):
            matrix[i][0] = 0
```

**Explanation**:

- **First Pass**: Identify rows and columns that need to be zeroed out. You can use the first row and first column as markers to save space.
- **Zeroing Rows and Columns**: Based on the markers set in the first pass, iterate over the matrix again to set the appropriate rows and columns to zero.

### Problem 11: [Game of Life](https://leetcode.com/problems/game-of-life/) 

**Problem Statement**: The Game of Life is a cellular automaton devised by the British mathematician John Horton Conway. Given a board with `m x n` cells, each cell has an initial state: live (represented by a 1) or dead (represented by a 0). The next state of each cell is determined by its eight neighbors' state using the following four rules:

1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
2. Any live cell with two or three live neighbors lives on to the next generation.
3. Any live cell with more than three live neighbors dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

The challenge is to update the board to its next state *in place*.

**Solution**:

```python
def gameOfLife(board):
    directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    
    def count_neighbors(r, c):
        return sum(
            1 for dr, dc in directions
            if 0 <= r + dr < len(board) and 0 <= c + dc < len(board[0]) and abs(board[r + dr][c + dc]) == 1
        )
    
    for r in range(len(board)):
        for c in range(len(board[0])):
            neighbors = count_neighbors(r, c)
            if board[r][c] == 1 and (neighbors < 2 or neighbors > 3):
                board[r][c] = -1  # Mark as dying
            elif board[r][c] == 0 and neighbors == 3:
                board[r][c] = 2  # Mark as new life

    for r in range(len(board)):
        for c in range(len(board[0])):
            if board[r][c] > 0:
                board[r][c] = 1
            else:
                board[r][c] = 0
```

**Explanation**:

- **State Encoding**: Use additional states to record changes. For example, a cell changing from live to dead can be marked as -1, and dead to live as 2.
- **Applying Rules**: Iterate through the board, apply the rules based on the cell's neighbors, and update the state accordingly.
- **Final Update**: Make another pass to update the board to its final state by normalizing the encoded states.

### Problem 12: [Count Unguarded Cells in the Grid](https://leetcode.com/problems/count-unguarded-cells-in-the-grid/)

**Problem Statement**: Given the dimensions of a grid (`m x n`), along with the positions of guards and walls, you need to calculate the number of unguarded cells. Guards can observe in all four directions until their view is obstructed by a wall.

**Solution**:

```python
def countUnguarded(m, n, guards, walls):
    grid = [['' for _ in range(n)] for _ in range(m)]
    
    for x, y in walls:
        grid[x][y] = 'W'
    for x, y in guards:
        grid[x][y] = 'G'
        
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    for x, y in guards:
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            while 0 <= nx < m and 0 <= ny < n and grid[nx][ny] != 'W' and grid[nx][ny] != 'G':
                grid[nx][ny] = 'V'  # Mark as visible
                nx += dx
                ny += dy
                
    return sum(cell == '' for row in grid for cell in row)
```

**Explanation**:

Create a grid with markers for guards, walls, and empty spaces. For each guard, mark the visibility range in all four directions until a wall is encountered. After marking the visibility ranges for all guards, count the number of cells that remain unmarked.

### Problem 13: [Candy Crush](https://www.lintcode.com/problem/858/) 

**Problem Statement**: This problem is a simplified version of the popular game Candy Crush. The board is represented as a 2D integer array where each integer represents a different color of candy. A candy is crushed if it has two identical candies on both sides horizontally or vertically. After crushing all candies simultaneously, the remaining candies on top will fall down to fill the empty spaces. The crushing and falling process continues until no more candies can be crushed. You need to simulate this process and return the final state of the board.

**Solution**:

```python
def candyCrush(board):
    rows, cols = len(board), len(board[0])
    todo = True

    while todo:
        todo = False
        crush = [[0] * cols for _ in range(rows)]

        # Mark candies to be crushed
        for r in range(rows):
            for c in range(cols - 2):
                if abs(board[r][c]) == abs(board[r][c + 1]) == abs(board[r][c + 2]) != 0:
                    crush[r][c] = crush[r][c + 1] = crush[r][c + 2] = 1
                    todo = True

        for r in range(rows - 2):
            for c in range(cols):
                if abs(board[r][c]) == abs(board[r + 1][c]) == abs(board[r + 2][c]) != 0:
                    crush[r][c] = crush[r + 1][c] = crush[r + 2][c] = 1
                    todo = True

        # Crush candies
        for r in range(rows):
            for c in range(cols):
                if crush[r][c] == 1:
                    board[r][c] = 0

        # Fall down
        for c in range(cols):
            idx = rows - 1
            for r in range(rows - 1, -1, -1):
                if board[r][c] != 0:
                    board[idx][c] = board[r][c]
                    idx -= 1
            for r in range(idx, -1, -1):
                board[r][c] = 0

    return board
```

**Explanation**:

- **Repeated Crushing and Falling**: Implement a loop that repeatedly finds candies to crush and allows other candies to fall until no more candies can be crushed.
- **Crush Candies**: Traverse the board to find candies that should be crushed. Mark them in a separate grid to avoid immediate changes affecting subsequent checks.
- **Fall Down**: After crushing, shift candies down to fill empty spaces and update the board accordingly.

---

## Section 3: Exercises

1. **[Determine Whether Matrix Can Be Obtained By Rotation](https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/)**
2. **[Cells with Odd Values in a Matrix](https://leetcode.com/problems/cells-with-odd-values-in-a-matrix/)**
3. **[Toeplitz Matrix](https://leetcode.com/problems/toeplitz-matrix/)**
4. **[Cells in a Range on an Excel Sheet](https://leetcode.com/problems/cells-in-a-range-on-an-excel-sheet/)**
5. **[Convert 1D Array Into 2D Array](https://leetcode.com/problems/convert-1d-array-into-2d-array/)**
6. **[Reshape the Matrix](https://leetcode.com/problems/reshape-the-matrix/)**
7. **[Rotating the Box](https://leetcode.com/problems/rotating-the-box/description/)**
8. **[Decode the Slanted Ciphertext](https://leetcode.com/problems/decode-the-slanted-ciphertext/)**
9. **[Spiral Matrix III](https://leetcode.com/problems/spiral-matrix-iii/)**
10. **[Largest Local Values in a Matrix](https://leetcode.com/problems/largest-local-values-in-a-matrix/)**
11. **[Equal Sum Grid Partition I](https://leetcode.com/problems/equal-sum-grid-partition-i/description/)**
