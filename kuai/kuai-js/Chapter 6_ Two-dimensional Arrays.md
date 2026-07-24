# Chapter 6: Two-dimensional Arrays

## Section 1: Introduction

A 2D array, often referred to as a matrix, is an array of arrays. Imagine it as a table with rows and columns, where each cell is accessed by its row and column indices. In JavaScript, 2D arrays are implemented using nested arrays.

### Creating and Accessing 2D Arrays

- **Initialization**: A 2D array can be initialized as follows:

    ```javascript
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    ```

    This creates a 3x3 matrix.

- **Accessing Elements**: To access an element, you specify the row and column indices. For example, `matrix[0][1]` accesses the element in the first row and second column.

- **Iterating Over a 2D Array**: You can iterate over the rows and then each element in the row:

    ```javascript
    for (const row of matrix) {
      for (const item of row) {
        console.log(item);
      }
    }
    ```

### Creating an Empty Matrix (Watch Out!)

In JavaScript there is no `[[0] * n] * m` shorthand, but there is a similar trap you must avoid. If you build the outer array by repeating a *single* inner array reference, every row points to the **same** array:

```javascript
// WRONG: all rows share one array reference
const bad = new Array(3).fill(new Array(3).fill(0));
bad[0][0] = 1;
console.log(bad); // [[1,0,0],[1,0,0],[1,0,0]] — every row changed!
```

Instead, create a fresh inner array for each row. `Array.from` with a mapping function is the idiomatic way:

```javascript
// CORRECT: each row is an independent array
const rows = 3, cols = 3;
const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
matrix[0][0] = 1;
console.log(matrix); // [[1,0,0],[0,0,0],[0,0,0]]
```

Other correct patterns:

```javascript
// Using Array.from with a nested mapping function
const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

// Using a loop
const g = [];
for (let i = 0; i < rows; i++) g.push(new Array(cols).fill(0));
```

### Common Operations

- **Row and Column Length**: The number of rows is `matrix.length`, and the number of columns in the first row (assuming all rows have the same length) is `matrix[0].length`.

- **Matrix Transposition**:

    ```javascript
    function transpose(matrix) {
        const rows = matrix.length, cols = matrix[0].length;
        const transposed = Array.from({ length: cols }, () => new Array(rows).fill(0));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                transposed[j][i] = matrix[i][j];
            }
        }
        return transposed;
    }
    ```

- **Square Matrix Transposition (In Place)**:

    ```javascript
    function transposeSquareMatrix(matrix) {
        const n = matrix.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
            }
        }
    }
    ```

    Note that JavaScript supports the swap idiom `[a, b] = [b, a]` via array destructuring, which mirrors Python's tuple-based parallel assignment.

---

## Section 2: Solved Problems

### Problem 1: [Rotate Image](https://leetcode.com/problems/rotate-image/)

**Problem Statement**: Given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You need to rotate the image in place, which means modifying the input 2D matrix directly.

**Solution 1**: Transpose + Reverse

```javascript
function rotate(matrix) {
    const n = matrix.length;
    // Transpose: swap rows and columns
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    // Reverse each row
    for (const row of matrix) {
        row.reverse();
    }
}
```

**Explanation**:

1. **Transpose**: Convert rows into columns (and columns into rows).
2. **Reverse Rows**: Reversing each row of the transposed matrix produces the 90° clockwise rotation.

**Complexity**:

- **Time**: $O(n^2)$
- **Space**: $O(1)$ (in-place)

**Solution 2**: Boundary Rotation with Parallel Assignment

```javascript
function rotate(matrix) {
    const n = matrix.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        for (let j = i; j < n - 1 - i; j++) {
            [
                // top
                matrix[i][j],
                // left
                matrix[n - 1 - j][i],
                // bottom
                matrix[n - 1 - i][n - 1 - j],
                // right
                matrix[j][n - 1 - i],
            ] = [
                // old left
                matrix[n - 1 - j][i],
                // old bottom
                matrix[n - 1 - i][n - 1 - j],
                // old right
                matrix[j][n - 1 - i],
                // old top
                matrix[i][j],
            ];
        }
    }
}
```

**Explanation**: Each loop processes one “ring” or boundary of the matrix, performing a circular swap of the four edges:
  - Top → Right
  - Right → Bottom
  - Bottom → Left
  - Left → Top

Array destructuring evaluates the right-hand side fully before assigning, so all four values are read before any is overwritten — exactly matching Python's parallel assignment.

**Complexity**:

- **Time**: $O(n^2)$
- **Space**: $O(1)$ (in-place)

### Problem 2: [Lonely Pixel](https://www.lintcode.com/problem/882/)

**Problem Statement**: Given a picture consisting of black and white pixels represented by 'B' and 'W' respectively, and represented as a 2D char array, find the number of black lonely pixels. A black lonely pixel is characterized by not having any other black pixels in the same row or column.

**Solution**:

```javascript
function findLonelyPixel(picture) {
    const rows = picture.length, cols = picture[0].length;
    const rowCount = new Array(rows).fill(0);
    const colCount = new Array(cols).fill(0);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (picture[i][j] === 'B') {
                rowCount[i] += 1;
                colCount[j] += 1;
            }
        }
    }

    let lonelyCount = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (picture[i][j] === 'B' && rowCount[i] === 1 && colCount[j] === 1) {
                lonelyCount += 1;
            }
        }
    }

    return lonelyCount;
}
```

**Explanation**: Iterate through the grid to count the occurrence of black pixels in each row and column, storing these counts. Go through the grid again. For each 'B' pixel, check if its row and column counts are both 1.

### Problem 3: [Image Overlap](https://leetcode.com/problems/image-overlap/description/)

**Problem Statement**: Given two binary images `img1` and `img2` represented as square binary matrices, find the maximum overlap `img1` can have over `img2` by shifting `img1` up, down, left, or right.

**Solution**:

```javascript
function largestOverlap(img1, img2) {
    const n = img1.length;

    const overlap = (rowOffset, colOffset) => {
        let count = 0;
        for (let i = Math.max(0, rowOffset); i < Math.min(n, n + rowOffset); i++) {
            for (let j = Math.max(0, colOffset); j < Math.min(n, n + colOffset); j++) {
                if (img1[i][j] === 1 && img2[i - rowOffset][j - colOffset] === 1) {
                    count += 1;
                }
            }
        }
        return count;
    };

    let best = 0;
    for (let rowOffset = -n + 1; rowOffset < n; rowOffset++) {
        for (let colOffset = -n + 1; colOffset < n; colOffset++) {
            best = Math.max(best, overlap(rowOffset, colOffset));
        }
    }
    return best;
}
```

**Explanation**: Shift image `img1` in all possible directions and count the number of overlapping 1s with image `img2` for each shift.

### Problem 4: [Queens That Can Attack the King](https://leetcode.com/problems/queens-that-can-attack-the-king/)

**Problem Statement**: On an 8x8 chessboard, some queens and one king are placed. You need to return all the queens that can attack the king in one move.

**Solution**:

```javascript
function queensAttacktheKing(queens, king) {
    const result = [];
    const board = Array.from({ length: 8 }, () => new Array(8).fill(0));

    for (const [x, y] of queens) {
        board[x][y] = 1;
    }

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dx, dy] of directions) {
        let [x, y] = king;
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[x][y] === 1) {
                result.push([x, y]);
                break;
            }
            x += dx;
            y += dy;
        }
    }

    return result;
}
```

**Explanation**: Initialize the chessboard and mark the positions of the queens and the king. From the king's position, check all eight possible directions (vertical, horizontal, and diagonal) for attacking queens. Stop checking a direction upon finding a queen or reaching the board's edge.

### Problem 5: [Spiral Matrix](https://leetcode.com/problems/spiral-matrix)

**Problem Statement**: Given an `m x n` matrix, return all elements of the matrix in spiral order.

**Solution**:

```javascript
function spiralOrder(matrix) {
    const res = [];
    const k = Math.min(matrix.length, matrix[0].length);
    const rows = matrix.length, cols = matrix[0].length;

    const traverseBoundary = (start) => {
        for (let j = start; j < cols - start; j++) {
            res.push(matrix[start][j]);
        }
        for (let i = start + 1; i < rows - start; i++) {
            res.push(matrix[i][cols - start - 1]);
        }
        if (rows - start - 1 === start || cols - start - 1 === start) {
            return;
        }
        for (let j = cols - start - 2; j > start; j--) {
            res.push(matrix[rows - start - 1][j]);
        }
        for (let i = rows - start - 1; i > start; i--) {
            res.push(matrix[i][start]);
        }
    };

    for (let i = 0; i < Math.floor((k + 1) / 2); i++) {
        traverseBoundary(i);
    }
    return res;
}
```

### Problem 6: [Spiral Matrix II](https://leetcode.com/problems/spiral-matrix-ii/)

**Problem Statement**: Given a positive integer `n`, generate an `n x n` matrix filled with elements from 1 to `n^2` in spiral order.

**Solution**:

```javascript
function generateMatrix(n) {
    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let x = 0, y = 0, di = 0;

    for (let i = 1; i <= n * n; i++) {
        matrix[x][y] = i;
        let [dx, dy] = directions[di];
        if (!(x + dx >= 0 && x + dx < n && y + dy >= 0 && y + dy < n && matrix[x + dx][y + dy] === 0)) {
            di = (di + 1) % 4; // Change direction
            [dx, dy] = directions[di];
        }
        x += dx;
        y += dy;
    }

    return matrix;
}
```

### Problem 7: [Diagonal Traverse](https://leetcode.com/problems/diagonal-traverse/)

**Problem Statement**: Given an `m x n` matrix, return all elements of the matrix in a diagonal order, starting from the top left corner and moving in a zigzag pattern.
![image](https://hackmd.io/_uploads/Sy3w8JDf0.png)

**Solution**:

```javascript
function findDiagonalOrder(mat) {
    if (!mat || !mat[0] || mat[0].length === 0) {
        return [];
    }

    const rows = mat.length, cols = mat[0].length;
    const result = [];
    for (let d = 0; d < rows + cols - 1; d++) {
        const intermediate = [];
        let r, c;
        if (d < cols) {
            r = d; c = 0;
        } else {
            r = cols - 1; c = d - cols + 1;
        }
        while (r >= 0 && c < rows) {
            intermediate.push(mat[c][r]);
            r -= 1;
            c += 1;
        }
        if (d % 2 === 0) {
            intermediate.reverse();
        }
        result.push(...intermediate);
    }
    return result;
}
```

**Explanation**: Maintain a direction variable that dictates whether you're moving up-right or down-left. Change direction when you hit the borders. Ensure your traversal respects the matrix boundaries, changing direction when necessary.

### Problem 8: [Find Valid Matrix Given Row and Column Sums](https://leetcode.com/problems/find-valid-matrix-given-row-and-column-sums/)

**Problem Statement**: You are given two arrays, `rowSum` and `colSum`, of length `m` and `n` respectively, where `m` is the number of rows and `n` is the number of columns of a 2D matrix.

Construct a 2D matrix that satisfies the following conditions:

1. The matrix contains non-negative integers.
2. The sum of elements in each row equals the corresponding element in `rowSum`.
3. The sum of elements in each column equals the corresponding element in `colSum`.

**Solution**:

```javascript
function restoreMatrix(rowSum, colSum) {
    const m = rowSum.length, n = colSum.length;
    const matrix = Array.from({ length: m }, () => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = Math.min(rowSum[i], colSum[j]);
            rowSum[i] -= matrix[i][j];
            colSum[j] -= matrix[i][j];
        }
    }

    return matrix;
}
```

**Explanation**: Initialize a matrix with zeros. Iterate through the matrix, filling each cell with the minimum of the current row's and column's sum. After filling each cell, update the respective row and column sums.

### Problem 9: [Valid Tic-Tac-Toe State](https://leetcode.com/problems/valid-tic-tac-toe-state/)

**Problem Statement**: Given a `3 x 3` Tic-Tac-Toe board represented, determine if it's in a valid state. A state is valid if it can be reached by playing a series of valid moves from an empty board.

**Solution**:

```javascript
function validTicTacToe(board) {
    const win = (player) => {
        for (let i = 0; i < 3; i++) {
            const rowWin = [0, 1, 2].every(j => board[i][j] === player);
            const colWin = [0, 1, 2].every(j => board[j][i] === player);
            if (rowWin || colWin) {
                return true;
            }
        }
        return (
            (board[0][0] === player && board[1][1] === player && board[2][2] === player) ||
            (board[0][2] === player && board[1][1] === player && board[2][0] === player)
        );
    };

    const countChar = (ch) =>
        board.reduce((total, row) => total + [...row].filter(c => c === ch).length, 0);

    const xCount = countChar('X');
    const oCount = countChar('O');

    if (oCount !== xCount - 1 && oCount !== xCount) {
        return false;
    }
    if (win('X') && xCount !== oCount + 1) {
        return false;
    }
    if (win('O') && xCount !== oCount) {
        return false;
    }

    return true;
}
```

**Explanation**: Count the number of 'X' and 'O' on the board. The number of 'X's must be equal to or one more than the number of 'O's. Check if there are any winning conditions for 'X' or 'O'. If both have winning lines, the state is invalid. If 'O' has a winning line, the number of 'X's should be equal to 'O's. If 'X' has a winning line, there should be one more 'X' than 'O'.

Note: each row of `board` is a string, so `board[i][j]` indexes a single character, and `[...row]` spreads the string into an array of characters for counting.

### Problem 10: [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)

**Problem Statement**: Given an `m x n` matrix, if an element is `0`, set its entire row and column to `0`. You must do it in place.

**Solution**:

```javascript
function setZeroes(matrix) {
    let isCol = false;
    const R = matrix.length, C = matrix[0].length;

    for (let i = 0; i < R; i++) {
        if (matrix[i][0] === 0) {
            isCol = true;
        }
        for (let j = 1; j < C; j++) {
            if (matrix[i][j] === 0) {
                matrix[0][j] = 0;
                matrix[i][0] = 0;
            }
        }
    }

    for (let i = 1; i < R; i++) {
        for (let j = 1; j < C; j++) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) {
                matrix[i][j] = 0;
            }
        }
    }

    if (matrix[0][0] === 0) {
        for (let j = 0; j < C; j++) {
            matrix[0][j] = 0;
        }
    }

    if (isCol) {
        for (let i = 0; i < R; i++) {
            matrix[i][0] = 0;
        }
    }
}
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

```javascript
function gameOfLife(board) {
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    const rows = board.length, cols = board[0].length;

    const countNeighbors = (r, c) => {
        let count = 0;
        for (const [dr, dc] of directions) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && Math.abs(board[nr][nc]) === 1) {
                count += 1;
            }
        }
        return count;
    };

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const neighbors = countNeighbors(r, c);
            if (board[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
                board[r][c] = -1; // Mark as dying
            } else if (board[r][c] === 0 && neighbors === 3) {
                board[r][c] = 2; // Mark as new life
            }
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            board[r][c] = board[r][c] > 0 ? 1 : 0;
        }
    }
}
```

**Explanation**:

- **State Encoding**: Use additional states to record changes. For example, a cell changing from live to dead can be marked as -1, and dead to live as 2.
- **Applying Rules**: Iterate through the board, apply the rules based on the cell's neighbors, and update the state accordingly.
- **Final Update**: Make another pass to update the board to its final state by normalizing the encoded states.

### Problem 12: [Count Unguarded Cells in the Grid](https://leetcode.com/problems/count-unguarded-cells-in-the-grid/)

**Problem Statement**: Given the dimensions of a grid (`m x n`), along with the positions of guards and walls, you need to calculate the number of unguarded cells. Guards can observe in all four directions until their view is obstructed by a wall.

**Solution**:

```javascript
function countUnguarded(m, n, guards, walls) {
    const grid = Array.from({ length: m }, () => new Array(n).fill(''));

    for (const [x, y] of walls) {
        grid[x][y] = 'W';
    }
    for (const [x, y] of guards) {
        grid[x][y] = 'G';
    }

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    for (const [x, y] of guards) {
        for (const [dx, dy] of directions) {
            let nx = x + dx, ny = y + dy;
            while (nx >= 0 && nx < m && ny >= 0 && ny < n && grid[nx][ny] !== 'W' && grid[nx][ny] !== 'G') {
                grid[nx][ny] = 'V'; // Mark as visible
                nx += dx;
                ny += dy;
            }
        }
    }

    let unguarded = 0;
    for (const row of grid) {
        for (const cell of row) {
            if (cell === '') {
                unguarded += 1;
            }
        }
    }
    return unguarded;
}
```

**Explanation**:

Create a grid with markers for guards, walls, and empty spaces. For each guard, mark the visibility range in all four directions until a wall is encountered. After marking the visibility ranges for all guards, count the number of cells that remain unmarked.

### Problem 13: [Candy Crush](https://www.lintcode.com/problem/858/)

**Problem Statement**: This problem is a simplified version of the popular game Candy Crush. The board is represented as a 2D integer array where each integer represents a different color of candy. A candy is crushed if it has two identical candies on both sides horizontally or vertically. After crushing all candies simultaneously, the remaining candies on top will fall down to fill the empty spaces. The crushing and falling process continues until no more candies can be crushed. You need to simulate this process and return the final state of the board.

**Solution**:

```javascript
function candyCrush(board) {
    const rows = board.length, cols = board[0].length;
    let todo = true;

    while (todo) {
        todo = false;
        const crush = Array.from({ length: rows }, () => new Array(cols).fill(0));

        // Mark candies to be crushed (horizontal)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 2; c++) {
                const v = Math.abs(board[r][c]);
                if (v !== 0 && v === Math.abs(board[r][c + 1]) && v === Math.abs(board[r][c + 2])) {
                    crush[r][c] = crush[r][c + 1] = crush[r][c + 2] = 1;
                    todo = true;
                }
            }
        }

        // Mark candies to be crushed (vertical)
        for (let r = 0; r < rows - 2; r++) {
            for (let c = 0; c < cols; c++) {
                const v = Math.abs(board[r][c]);
                if (v !== 0 && v === Math.abs(board[r + 1][c]) && v === Math.abs(board[r + 2][c])) {
                    crush[r][c] = crush[r + 1][c] = crush[r + 2][c] = 1;
                    todo = true;
                }
            }
        }

        // Crush candies
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (crush[r][c] === 1) {
                    board[r][c] = 0;
                }
            }
        }

        // Fall down
        for (let c = 0; c < cols; c++) {
            let idx = rows - 1;
            for (let r = rows - 1; r >= 0; r--) {
                if (board[r][c] !== 0) {
                    board[idx][c] = board[r][c];
                    idx -= 1;
                }
            }
            for (let r = idx; r >= 0; r--) {
                board[r][c] = 0;
            }
        }
    }

    return board;
}
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
</content>
</invoke>
