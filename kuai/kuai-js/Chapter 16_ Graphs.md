# Chapter 16: Graphs

## Section 1: Introduction to Graphs

Graphs are a versatile data structure used to represent complex relationships between objects. They consist of nodes (also called vertices) and edges, which connect pairs of nodes. Graphs are widely used in various applications such as social networks, navigation systems, and recommendation engines.

### Definitions and Terminologies

- **Node**: A fundamental part of a graph that represents an entity or a point. Nodes can store data or represent a unique identifier within the graph.

- **Edge**: An edge is a connection between two nodes. It represents the relationship between the nodes. Edges can be directed or undirected.

- **Directed Graph**: A graph where edges have a direction, indicating the relationship flows from one node to another.

- **Undirected Graph**: A graph where edges have no direction, indicating a mutual relationship between the connected nodes.

- **Path**: A sequence of edges that connect a sequence of distinct nodes.

- **Cycle**: A path that starts and ends at the same node, without repeating any edges or nodes.

### Representation of a Graph using Adjacency Lists

Let's consider a sample graph for illustration. 

```
    A → B → C
    ↑ ↙ ↓
    E → D
```

An adjacency list represents a graph as a collection of lists. Each node has a list of all nodes it is directed to. This representation is efficient in terms of space, especially for sparse graphs.

Here’s a basic representation graph using an adjacency list:

```
{ A: ['B'], B: ['C', 'D', 'E'], C: [], D: [], E: ['A', 'D'] }
```

In JavaScript we can model an adjacency list with a `Map` (preferred when keys may be numbers or arbitrary values) or a plain object (fine for string keys). Here is a code snippet for creating an adjacency list from an edge list using a `Map` with a get-or-initialize pattern (the JS equivalent of Python's `defaultdict(list)`):

```javascript
function createAdjacencyList(edges) {
  const adj = new Map();
  for (const edge of edges) {
    if (!adj.has(edge[0])) adj.set(edge[0], []);
    adj.get(edge[0]).push(edge[1]);
  }
  return adj;
}
```


## Section 2: Graph Traversal Methods

Traversal methods are strategies used to visit all the nodes in a graph. The main types are Depth-First Search (DFS) and Breadth-First Search (BFS).

### Depth-First Search (DFS)

DFS explores as deep as possible along each branch before backtracking. It can be implemented through recursion or using a stack.

#### Recursive DFS

```javascript
function traverseGraph(graph, root) {
  const seen = new Set();
  function dfs(node) {
    seen.add(node);
    for (const nei of graph.get(node) ?? []) {
      if (!seen.has(nei)) {
        dfs(nei);
      }
    }
  }
  dfs(root);
}
```

#### Iterative DFS

```javascript
function traverseGraph(graph, root) {
  const visited = new Set();
  const stack = [root];

  while (stack.length > 0) {
    const node = stack.pop();
    // Process node
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}
```

### Breadth-First Search (BFS)

BFS explores the graph level by level using a queue. JavaScript has no built-in deque, and `Array.prototype.shift` is O(n). For BFS we use a plain array as the queue together with a head index (`head`) so that dequeuing stays O(1); we advance `head` instead of calling `shift`.

```javascript
function traverseGraph(graph, root) {
  const seen = new Set([root]);
  // usually need to add the level to queue
  const queue = [[root, 0]];
  let head = 0;
  while (head < queue.length) {
    const [node, level] = queue[head++];
    // Process the node
    for (const nei of graph.get(node) ?? []) {
      if (!seen.has(nei)) {
        queue.push([nei, level + 1]);
        seen.add(nei);
      }
    }
  }
}
```

## Section 3: Solved Problems

### Problem 1: [Detonate the Maximum Bombs](https://leetcode.com/problems/detonate-the-maximum-bombs/)

**Problem Statement**: You're given a list of bombs where each bomb is represented by its coordinates and a range. A bomb can detonate another if it lies within its range. When a bomb is detonated, it can cause a chain reaction by detonating other bombs within its range. The goal is to find out the maximum number of bombs that can be detonated in a single chain reaction.

**Solution**:

```javascript
function maxBombs(bombs) {
  function dist2(a, b, c, d) {
    return (a - c) ** 2 + (b - d) ** 2;
  }

  const adj = new Map();
  const addEdge = (i, j) => {
    if (!adj.has(i)) adj.set(i, []);
    adj.get(i).push(j);
  };

  for (let i = 0; i < bombs.length; i++) {
    for (let j = i + 1; j < bombs.length; j++) {
      const [x1, y1, r1] = bombs[i];
      const [x2, y2, r2] = bombs[j];
      const distSquared = dist2(x1, y1, x2, y2);
      if (distSquared <= r1 ** 2) {
        addEdge(i, j);
      }
      if (distSquared <= r2 ** 2) {
        addEdge(j, i);
      }
    }
  }

  function dfs(i, seen) {
    if (seen.has(i)) {
      return;
    }
    seen.add(i);
    for (const j of adj.get(i) ?? []) {
      dfs(j, seen);
    }
  }

  let res = 0;
  for (let i = 0; i < bombs.length; i++) {
    const seen = new Set();
    dfs(i, seen);
    res = Math.max(res, seen.size);
  }
  return res;
}
```

**Explanation**: This solution constructs a directed graph where each node represents a bomb and an edge from bomb `i` to bomb `j` exists if bomb `i` can detonate bomb `j`. Using DFS, we explore each bomb's chain reaction potential and keep track of the maximum number of bombs that can be detonated from any single bomb.

### Problem 2: [Keys and Rooms](https://leetcode.com/problems/keys-and-rooms/description/)

**Problem Statement**: You're given a list of rooms, each containing a list of keys to other rooms. Starting from room 0, determine if you can eventually enter every room.

**Solution**:

```javascript
function canVisitAllRooms(rooms) {
  const visited = new Set();

  function dfs(i) {
    if (visited.has(i)) {
      return;
    }
    visited.add(i);
    for (const j of rooms[i]) {
      dfs(j);
    }
  }

  dfs(0);
  return visited.size === rooms.length;
}
```

**Explanation**: We traverse the rooms using DFS, starting from room 0. Every time we enter a room, we mark it as visited and explore the rooms we can access with the keys from the current room. Finally, we check if we've visited all the rooms.

### Problem 3: [Clone Graph](https://leetcode.com/problems/clone-graph/)

**Problem Statement**: Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a val (int) and a list (`Node[]`) of its neighbors.

**Solution**:

```javascript
function cloneGraph(node) {
  // Map from original node -> cloned node. Object references make great Map keys.
  const nodes = new Map();

  function dfs(cur) {
    if (nodes.has(cur)) {
      return nodes.get(cur);
    }
    const res = new Node(cur.val);
    nodes.set(cur, res);
    res.neighbors = cur.neighbors.map((n) => dfs(n));
    return res;
  }

  return node ? dfs(node) : node;
}
```

**Explanation**: This solution creates a `Map` to store the relationship between original nodes and their copies to avoid duplications in cloning. Because JS `Map` keys use reference equality, the original node objects work directly as keys. DFS is used to traverse and clone each node along with its neighbors.

### Problem 4: [Find if Path Exists in Graph](https://leetcode.com/problems/find-if-path-exists-in-graph/)

**Problem Statement**: Given an integer `n` representing the total number of nodes in a graph labeled from 0 to n-1, and edges representing connections between nodes, determine if there is a valid path that exists between source `start` and target `end`.

**Solution**:

```javascript
function validPath(n, edges, start, end) {
  const d = new Map();
  const addEdge = (a, b) => {
    if (!d.has(a)) d.set(a, []);
    d.get(a).push(b);
  };
  for (const edge of edges) {
    addEdge(edge[0], edge[1]);
    addEdge(edge[1], edge[0]);
  }

  const seen = new Set();

  function dfs(i) {
    if (seen.has(i)) {
      return false;
    }
    seen.add(i);
    if (i === end) {
      return true;
    }
    for (const c of d.get(i) ?? []) {
      if (dfs(c)) {
        return true;
      }
    }
    return false;
  }

  return dfs(start);
}
```

**Explanation**: The graph is represented using an adjacency list, and DFS is used to explore the graph. If we reach the `end` node during our exploration, we return `true`. (Note: the original code referenced `destination`/`source`, but the function parameters are named `start`/`end`; the JavaScript version uses `end` and `start` consistently.)

### Problem 5: [All Paths from Source to Target](https://leetcode.com/problems/all-paths-from-source-to-target/)

**Problem Statement**: Given a directed acyclic graph (DAG) of `n` nodes labeled from 0 to n-1, find all possible paths from node 0 to node n-1, and return them in any order.

**Solution**:

```javascript
function allPathsSourceTarget(graph) {
  const res = [];

  function dfs(i, cur) {
    if (i === graph.length - 1) {
      res.push([...cur]);
      return;
    }
    for (const j of graph[i]) {
      cur.push(j);
      dfs(j, cur);
      cur.pop();
    }
  }

  dfs(0, [0]);
  return res;
}
```

**Explanation**: This solution uses DFS to explore all paths from the source to the target node. Each time we reach the target node, we add a copy of the current path to our results list.

### Problem 6: [Is Graph Bipartite?](https://leetcode.com/problems/is-graph-bipartite/)

**Problem Statement**: Given an undirected graph, return `true` if and only if it is bipartite. A graph is bipartite if we can split its set of nodes into two independent subsets A and B, such that every edge in the graph has one node in A and another node in B.

**Solution**:

```javascript
function isBipartite(graph) {
  const color = new Map();

  function dfs(pos, c) {
    if (color.has(pos)) {
      return color.get(pos) === c;
    }
    color.set(pos, c);
    return graph[pos].every((nei) => dfs(nei, c ^ 1));
  }

  for (let node = 0; node < graph.length; node++) {
    if (!color.has(node) && !dfs(node, 0)) {
      return false;
    }
  }
  return true;
}
```

**Explanation**: This solution uses DFS to try to color the graph using two colors. If we ever find a conflict where two adjacent nodes have the same color, the graph is not bipartite. We start a DFS from every uncolored node to cover disconnected components.

### Problem 7: [Possible Bipartition](https://leetcode.com/problems/possible-bipartition/)

**Problem Statement**: Given a set of `n` people numbered from 1 to n, and an array `dislikes` where `dislikes[i]` is a list of persons that person `i` does not like, determine if it is possible to split everyone into two groups in such a way that no one dislikes anyone in their own group.

**Solution**:

```javascript
function possibleBipartition(n, dislikes) {
  const graph = new Map();
  const addEdge = (a, b) => {
    if (!graph.has(a)) graph.set(a, new Set());
    graph.get(a).add(b);
  };
  // nodes to go through
  const nodes = new Set();
  for (const edge of dislikes) {
    addEdge(edge[0], edge[1]);
    addEdge(edge[1], edge[0]);
    nodes.add(edge[0]);
  }

  const seen = new Map();

  function dfs(cur, color) {
    seen.set(cur, color);
    for (const nei of graph.get(cur) ?? []) {
      if (seen.has(nei) && seen.get(nei) === color) {
        return false;
      }
      if (!seen.has(nei) && !dfs(nei, 1 - color)) {
        return false;
      }
    }
    return true;
  }

  for (const node of nodes) {
    if (!seen.has(node) && !dfs(node, 0)) {
      return false;
    }
  }
  return true;
}
```

**Explanation**: This solution mirrors the approach used to determine if a graph is bipartite. We attempt to color the graph such that no two adjacent nodes (people who dislike each other) have the same color. If we can do this for all nodes, then it is possible to partition them as required.


### Problem 8: [Word Ladder](https://leetcode.com/problems/word-ladder/description/)

**Problem Statement**: Given two words, `beginWord` and `endWord`, and a dictionary's word list, find the length of the shortest transformation sequence from `beginWord` to `endWord`. A transformation can only change one letter at a time, and each transformed word must be in the word list.

**Solution**:

```javascript
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList); // To achieve O(1) look-ups
  if (!wordSet.has(endWord)) {
    return 0;
  }

  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const queue = [[beginWord, 1]]; // stores current word and transformation count
  let head = 0;
  while (head < queue.length) {
    const [currentWord, steps] = queue[head++];

    if (currentWord === endWord) {
      return steps;
    }

    for (let i = 0; i < currentWord.length; i++) {
      for (const c of alphabet) {
        const nextWord = currentWord.slice(0, i) + c + currentWord.slice(i + 1);
        if (wordSet.has(nextWord)) {
          wordSet.delete(nextWord);
          queue.push([nextWord, steps + 1]);
        }
      }
    }
  }

  return 0;
}
```

**Explanation**: This solution uses BFS to explore possible transformations level by level, counting the steps. By changing one character at a time and checking against the dictionary, we ensure valid transformations. Early exit occurs when `endWord` is found.

### Problem 9: [Minimum Genetic Mutation](https://leetcode.com/problems/minimum-genetic-mutation/description/)

**Problem Statement**: A gene string can be represented by an 8-character long string of characters in "ACGT". Given a start gene string `start`, an end gene string `end`, and a gene bank, return the minimum number of mutations needed to mutate from `start` to `end`. A mutation is changing one gene in the string to another allowed gene.

**Solution**:

```javascript
function minMutation(start, end, bank) {
  const bankSet = new Set(bank);
  if (!bankSet.has(end)) {
    return -1;
  }

  const queue = [[start, 0]];
  let head = 0;
  while (head < queue.length) {
    const [current, count] = queue[head++];

    if (current === end) {
      return count;
    }

    for (let i = 0; i < current.length; i++) {
      for (const c of 'ACGT') {
        const mutation = current.slice(0, i) + c + current.slice(i + 1);
        if (bankSet.has(mutation)) {
          bankSet.delete(mutation);
          queue.push([mutation, count + 1]);
        }
      }
    }
  }

  return -1;
}
```

**Explanation**: This solution mirrors the approach used in Word Ladder, applying BFS to explore all possible mutations step-by-step, tracking the number of mutations with a queue.

### Problem 10: [Open The Lock](https://leetcode.com/problems/open-the-lock/description/)

**Problem Statement**: You have a lock in front of you with 4 circular wheels. Each wheel has 10 slots: '0' to '9'. The wheels can rotate freely and wrap around: for example we can turn '9' to be '0', or '0' to be '9'. Each move consists of turning one wheel one slot. The lock initially starts at '0000', a string representing the state of the wheels. Given a list of deadends, meaning if the lock displays these, it becomes inoperable, and a target combination, return the minimum number of moves required to open the lock, or -1 if it is impossible.

**Solution**:

```javascript
function openLock(deadends, target) {
  const deadSet = new Set(deadends);
  const queue = [['0000', 0]];
  let head = 0;
  const seen = new Set(['0000']);

  while (head < queue.length) {
    const [state, turns] = queue[head++];

    if (state === target) {
      return turns;
    }
    if (deadSet.has(state)) {
      continue;
    }

    for (let i = 0; i < 4; i++) {
      for (const move of [-1, 1]) {
        const digit = (Number(state[i]) + move + 10) % 10;
        const nextState = state.slice(0, i) + String(digit) + state.slice(i + 1);
        if (!seen.has(nextState) && !deadSet.has(nextState)) {
          seen.add(nextState);
          queue.push([nextState, turns + 1]);
        }
      }
    }
  }

  return -1;
}
```

**Explanation**: This BFS solution navigates through each possible state of the lock, checking against deadends and keeping track of the minimum turns needed to reach the target. Note that JS's `%` can return a negative value for negative operands, so we add `10` before taking the modulus to keep the digit in the range 0–9.

### Problem 11: [Get Watched Videos by Your Friends](https://leetcode.com/problems/get-watched-videos-by-your-friends/description/)

**Problem Statement**: Given a list of watched videos by friends, where `videos[i]` is a list of videos watched by the i-th friend, and `friends[i]` is a list of friends who are direct friends of the i-th friend, determine the most frequently watched video(s) among all friends up to a given level `k`.

**Solution**:

```javascript
function watchedVideosByFriends(watchedVideos, friends, id, level) {
  const queue = [[id, 0]];
  let head = 0;
  const visited = new Set([id]);
  const videos = [];

  while (head < queue.length) {
    const [person, depth] = queue[head++];
    if (depth === level) {
      for (const video of watchedVideos[person]) {
        videos.push(video);
      }
    } else if (depth < level) {
      for (const friend of friends[person]) {
        if (!visited.has(friend)) {
          visited.add(friend);
          queue.push([friend, depth + 1]);
        }
      }
    }
  }

  // Count frequencies with a Map (the JS equivalent of Counter).
  const videoCount = new Map();
  for (const v of videos) {
    videoCount.set(v, (videoCount.get(v) ?? 0) + 1);
  }

  // Sort by frequency ascending, then by name.
  return [...videoCount.keys()].sort((a, b) => {
    const diff = videoCount.get(a) - videoCount.get(b);
    return diff !== 0 ? diff : a < b ? -1 : a > b ? 1 : 0;
  });
}
```

**Explanation**: The solution uses BFS to find all friends up to depth `k` and collects their watched videos. It then sorts the videos by frequency and name using a frequency `Map` and a comparator function.

### Problem 12: [Shortest Path with Alternating Colors](https://leetcode.com/problems/shortest-path-with-alternating-colors/description/)

**Problem Statement**: Consider a directed graph where each edge is colored either red or blue, and you can only follow the paths of alternating colors. Given the number of nodes `n`, edges `redEdges`, and `blueEdges`, return an array answer of length `n`, where `answer[i]` is the length of the shortest path from node `0` to node `i` using alternating colors, or -1 if no such path exists.

**Solution**:

```javascript
function shortestAlternatingPaths(n, redEdges, blueEdges) {
  const redGraph = new Map();
  const blueGraph = new Map();
  const addEdge = (graph, u, v) => {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push(v);
  };
  for (const [u, v] of redEdges) {
    addEdge(redGraph, u, v);
  }
  for (const [u, v] of blueEdges) {
    addEdge(blueGraph, u, v);
  }

  const queue = [
    [0, 0, 'r'],
    [0, 0, 'b'],
  ]; // (node, distance, color)
  let head = 0;
  // JS Sets use reference equality for arrays, so we encode (node, color)
  // pairs as string keys like `${node},${color}`.
  const seen = new Set(['0,r', '0,b']);
  const answer = new Array(n).fill(-1);
  answer[0] = 0;

  while (head < queue.length) {
    const [node, dist, color] = queue[head++];

    const nextColor = color === 'r' ? 'b' : 'r';
    const nextGraph = color === 'r' ? blueGraph : redGraph;

    for (const nei of nextGraph.get(node) ?? []) {
      const key = `${nei},${nextColor}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push([nei, dist + 1, nextColor]);
        if (answer[nei] === -1 || answer[nei] > dist + 1) {
          answer[nei] = dist + 1;
        }
      }
    }
  }

  return answer;
}
```

**Explanation**: This BFS approach tracks the color of the last edge used and alternates between red and blue graphs, updating distances and ensuring each path alternates in color. Because JavaScript `Set`s compare arrays by reference, the `(node, color)` pairs in `seen` are stored as string keys such as `` `${node},${color}` ``. The structure ensures paths are minimal and correctly alternated.

### Problem 13: Consolidate Overlapping Shipping Rules

**Problem Statement:** In large e-commerce systems (e.g., Amazon, Shopify), merchants specify “must-ship-together” rules. If two or more rules share an item, they effectively merge all items in those rules into a single shipment. Efficiently consolidating these rules avoids splitting items that need to be shipped together and ensures a correct, simplified fulfillment plan.

You are given multiple lists (rules), each containing items that must be shipped together (e.g., `["laptop", "keyboard"]`). If any two rules share at least one common item, then all items from both rules merge into a single group. Your task is to output these merged groups.

### Examples

```
Input: rules = [
    ["laptop", "keyboard"],
    ["keyboard", "mouse"]
]
Output: [
    ["keyboard", "laptop", "mouse"]
]

Input: rules = [
    ["books", "bookmark"],
    ["headphones", "case"],
    ["case", "charger"],
    ["pens", "notebook"]
]
Output: [
    ["books", "bookmark"],
    ["case", "charger", "headphones"],
    ["notebook", "pens"]
]

Input: rules = [
    ["camera", "tripod", "bag"],
    ["bag", "lens"],
    ["memory_card"]
]
Output: [
    ["bag", "camera", "lens", "tripod"],
    ["memory_card"]
]
```

Your job is to return a list of all such consolidated groups.

## Solution

### Approaching the Problem

Model the situation as a graph problem where each item is represented by a node. For each rule, you only connect adjacent items—so for a rule like `["laptop", "keyboard", "mouse"]`, you would create edges `laptop–keyboard` and `keyboard–mouse`. After building these links, the task reduces to finding connected components. Any standard method—such as DFS, BFS, or Union Find (a.k.a. Disjoint-set Union)—can identify which nodes belong together.

Connecting only adjacent items in each rule is sufficient because it preserves full connectivity among all items within the rule while avoiding unnecessary edges. In other words, `"laptop”` will still be connected to `“mouse”` transitively through “keyboard,” and adding direct edges like `“laptop–mouse”` would provide no additional benefit. This approach ensures correctness and efficiency, allowing the solution to scale smoothly for larger inputs without redundant connections.

### Approach 1: Graph + DFS

1. **Build the Graph**

    - Create a graph where each unique item is a node.  
    - For each rule, connect adjacent pairs (e.g., “A–B,” “B–C,” etc.).  

2. **Find Connected Components (DFS)**

    - Perform a DFS starting from each unvisited node.  
    - All reachable nodes form one connected component.

3. **Collect and Sort**

    - Sort each group if desired to keep outputs consistent.

```javascript
function consolidateRulesDfs(rules) {
  const graph = buildGraph(rules);
  return findConnectedComponents(graph);
}

function buildGraph(rules) {
  const graph = new Map();
  const addEdge = (a, b) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a).push(b);
  };
  for (const rule of rules) {
    // Ensure single-item rules still appear as nodes.
    for (const item of rule) {
      if (!graph.has(item)) graph.set(item, []);
    }
    for (let i = 0; i < rule.length - 1; i++) {
      const a = rule[i];
      const b = rule[i + 1];
      addEdge(a, b);
      addEdge(b, a);
    }
  }
  return graph;
}

function findConnectedComponents(graph) {
  const visited = new Set();
  const components = [];
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      const component = dfsCollect(node, graph, visited);
      components.push(component.sort());
    }
  }
  return components;
}

function dfsCollect(start, graph, visited) {
  const stack = [start];
  visited.add(start);
  const component = [];
  while (stack.length > 0) {
    const current = stack.pop();
    component.push(current);
    for (const neighbor of graph.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return component;
}
```

**Time Complexity**:

Let $n$ be the number of rules, and let each rule contain at most $k$ items. Then the total number of items across all rules is at most $n\cdot k$. Building the graph requires looking at each rule and connecting adjacent pairs, so the graph-construction step takes $O(nk)$ time. The DFS phase involves visiting each node and each edge once. The number of nodes is at most $n \cdot k$, and the number of edges is bounded by $n \cdot k$ when connecting only adjacent pairs. Consequently, the overall complexity is $O(nk)$.
</content>
</invoke>
