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
{'A': ['B'], 'B': ['C', 'D', 'E'], 'C': [], 'D': [], 'E': ['A', 'D']}
```

Here is a code snippet for creating an adjacency list from an edge list:

```python
from collections import defaultdict

def create_adjacency_list(edges):
    adj = defaultdict(list)
    for edge in edges:
        adj[edge[0]].append(edge[1])
    return adj
```
            

## Section 2: Graph Traversal Methods

Traversal methods are strategies used to visit all the nodes in a graph. The main types are Depth-First Search (DFS) and Breadth-First Search (BFS).

### Depth-First Search (DFS)

DFS explores as deep as possible along each branch before backtracking. It can be implemented through recursion or using a stack.

#### Recursive DFS

```python
def traverse_graph(graph, root):
    seen = set()
    def dfs(node):
        seen.add(node)
        for nei in graph[node]:
            if nei not in seen:
                dfs(nei)
    dfs(root)
```

#### Iterative DFS

```python
def traverse_graph(graph, root):
    visited = set()
    stack = [root]
    
    while stack:
        node = stack.pop()
        # Process node
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

### Breadth-First Search (BFS)

BFS explores the graph level by level using a queue.

```python
from collections import deque

def traverse_graph(graph, root):
    seen = {root}
    # usually need to add the level to queue
    queue = deque([(root, 0)])
    while queue:
        node, level = queue.popleft()
        # Process the node
        for nei in graph[node]:
            if nei not in seen:
                queue.append((nei, level + 1))
                seen.add(nei)
```

## Section 3: Solved Problems

### Problem 1: [Detonate the Maximum Bombs](https://leetcode.com/problems/detonate-the-maximum-bombs/)

**Problem Statement**: You're given a list of bombs where each bomb is represented by its coordinates and a range. A bomb can detonate another if it lies within its range. When a bomb is detonated, it can cause a chain reaction by detonating other bombs within its range. The goal is to find out the maximum number of bombs that can be detonated in a single chain reaction.

**Solution**:

```python
def maxBombs(bombs):
    def dist2(a, b, c, d):
        return (a - c) ** 2 + (b - d) ** 2

    adj = defaultdict(list)
    for i in range(len(bombs)):
        for j in range(i + 1, len(bombs)):
            x1, y1, r1 = bombs[i]
            x2, y2, r2 = bombs[j]
            dist_squared = dist2(x1, y1, x2, y2)
            if dist_squared <= r1**2:
                adj[i].append(j)
            if dist_squared <= r2**2:
                adj[j].append(i)

    def dfs(i, seen):
        if i in seen:
            return
        seen.add(i)
        for j in adj[i]:
            dfs(j, seen)

    res = 0
    for i in range(len(bombs)):
        seen = set()
        dfs(i, seen)
        res = max(res, len(seen))
    return res
```

**Explanation**: This solution constructs a directed graph where each node represents a bomb and an edge from bomb `i` to bomb `j` exists if bomb `i` can detonate bomb `j`. Using DFS, we explore each bomb's chain reaction potential and keep track of the maximum number of bombs that can be detonated from any single bomb.

### Problem 2: [Keys and Rooms](https://leetcode.com/problems/keys-and-rooms/description/)

**Problem Statement**: You're given a list of rooms, each containing a list of keys to other rooms. Starting from room 0, determine if you can eventually enter every room.

**Solution**:

```python
def canVisitAllRooms(rooms):
    visited = set()

    def dfs(i):
        if i in visited:
            return
        visited.add(i)
        for j in rooms[i]:
            dfs(j)

    dfs(0)
    return len(visited) == len(rooms)
```

**Explanation**: We traverse the rooms using DFS, starting from room 0. Every time we enter a room, we mark it as visited and explore the rooms we can access with the keys from the current room. Finally, we check if we've visited all the rooms.

### Problem 3: [Clone Graph](https://leetcode.com/problems/clone-graph/)

**Problem Statement**: Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a val (int) and a list (List[Node]) of its neighbors.

**Solution**:

```python
def cloneGraph(node):
    nodes = {}

    def dfs(cur):
        if cur in nodes:
            return nodes[cur]
        res = Node(cur.val)
        nodes[cur] = res
        neighbors = [dfs(n) for n in cur.neighbors]
        res.neighbors = neighbors
        return res

    return dfs(node) if node else node
```

**Explanation**: This solution creates a map to store the relationship between original nodes and their copies to avoid duplications in cloning. DFS is used to traverse and clone each node along with its neighbors.

### Problem 4: [Find if Path Exists in Graph](https://leetcode.com/problems/find-if-path-exists-in-graph/)

**Problem Statement**: Given an integer `n` representing the total number of nodes in a graph labeled from 0 to n-1, and edges representing connections between nodes, determine if there is a valid path that exists between source `start` and target `end`.

**Solution**:

```python
def validPath(n, edges, start, end):
    d = defaultdict(list)
    for edge in edges:
        d[edge[0]].append(edge[1])
        d[edge[1]].append(edge[0])

    seen = set()

    def dfs(i):
        if i in seen:
            return False
        seen.add(i)
        if i == destination:
            return True
        for c in d[i]:
            if dfs(c):
                return True
        return False

    return dfs(source)
```

**Explanation**: The graph is represented using an adjacency list, and DFS is used to explore the graph. If we reach the `end` node during our exploration, we return `True`.

### Problem 5: [All Paths from Source to Target](https://leetcode.com/problems/all-paths-from-source-to-target/)

**Problem Statement**: Given a directed acyclic graph (DAG) of `n` nodes labeled from 0 to n-1, find all possible paths from node 0 to node n-1, and return them in any order.

**Solution**:

```python
def allPathsSourceTarget(graph):
    res = []

    def dfs(i, cur):
        if i == len(graph) - 1:
            res.append([c for c in cur])
            return
        for j in graph[i]:
            cur.append(j)
            dfs(j, cur)
            cur.pop()

    dfs(0, [0])
    return res
```

**Explanation**: This solution uses DFS to explore all paths from the source to the target node. Each time we reach the target node, we add the current path to our results list.

### Problem 6: [Is Graph Bipartite?](https://leetcode.com/problems/is-graph-bipartite/)

**Problem Statement**: Given an undirected graph, return `true` if and only if it is bipartite. A graph is bipartite if we can split its set of nodes into two independent subsets A and B, such that every edge in the graph has one node in A and another node in B.

**Solution**:

```python
def isBipartite(graph):
    color = {}

    def dfs(pos, c):
        if pos in color:
            return color[pos] == c
        color[pos] = c
        return all(dfs(nei, c ^ 1) for nei in graph[pos])

    return all(dfs(node, 0) for node in range(len(graph)) if node not in color)
```

**Explanation**: This solution uses DFS to try to color the graph using two colors. If we ever find a conflict where two adjacent nodes have the same color, the graph is not bipartite.

### Problem 7: [Possible Bipartition](https://leetcode.com/problems/possible-bipartition/)

**Problem Statement**: Given a set of `n` people numbered from 1 to n, and an array `dislikes` where `dislikes[i]` is a list of persons that person `i` does not like, determine if it is possible to split everyone into two groups in such a way that no one dislikes anyone in their own group.

**Solution**:

```python
def possibleBipartition(n, dislikes):
    graph = defaultdict(set)
    # nodes to go through
    nodes = set()
    for edge in dislikes:
        graph[edge[0]].add(edge[1])
        graph[edge[1]].add(edge[0])
        nodes.add(edge[0])

    seen = {}

    def dfs(cur, color):
        seen[cur] = color
        for nei in graph[cur]:
            if nei in seen and seen[nei] == color:
                return False
            if nei not in seen and not dfs(nei, 1 - color):
                return False
        return True

    for node in nodes:
        if node not in seen and not dfs(node, 0):
            return False
    return True
```

**Explanation**: This solution mirrors the approach used to determine if a graph is bipartite. We attempt to color the graph such that no two adjacent nodes (people who dislike each other) have the same color. If we can do this for all nodes, then it is possible to partition them as required.


### Problem 8: [Word Ladder](https://leetcode.com/problems/word-ladder/description/)

**Problem Statement**: Given two words, `beginWord` and `endWord`, and a dictionary's word list, find the length of the shortest transformation sequence from `beginWord` to `endWord`. A transformation can only change one letter at a time, and each transformed word must be in the word list.

**Solution**:

```python
from collections import deque

def ladderLength(beginWord, endWord, wordList):
    wordSet = set(wordList)  # To achieve O(1) look-ups
    if endWord not in wordSet:
        return 0
    
    queue = deque([(beginWord, 1)])  # stores current word and transformation count
    while queue:
        current_word, steps = queue.popleft()
        
        if current_word == endWord:
            return steps
        
        for i in range(len(current_word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                next_word = current_word[:i] + c + current_word[i+1:]
                if next_word in wordSet:
                    wordSet.remove(next_word)
                    queue.append((next_word, steps + 1))
    
    return 0
```

**Explanation**: This solution uses BFS to explore possible transformations level by level, counting the steps. By changing one character at a time and checking against the dictionary, we ensure valid transformations. Early exit occurs when `endWord` is found.

### Problem 9: [Minimum Genetic Mutation](https://leetcode.com/problems/minimum-genetic-mutation/description/)

**Problem Statement**: A gene string can be represented by an 8-character long string of characters in "ACGT". Given a start gene string `start`, an end gene string `end`, and a gene bank, return the minimum number of mutations needed to mutate from `start` to `end`. A mutation is changing one gene in the string to another allowed gene.

**Solution**:

```python
from collections import deque

def minMutation(start, end, bank):
    bank = set(bank)
    if end not in bank:
        return -1
    
    queue = deque([(start, 0)])
    while queue:
        current, count = queue.popleft()
        
        if current == end:
            return count
        
        for i in range(len(current)):
            for c in "ACGT":
                mutation = current[:i] + c + current[i+1:]
                if mutation in bank:
                    bank.remove(mutation)
                    queue.append((mutation, count + 1))
    
    return -1
```

**Explanation**: This solution mirrors the approach used in Word Ladder, applying BFS to explore all possible mutations step-by-step, tracking the number of mutations with a queue.

### Problem 10: [Open The Lock](https://leetcode.com/problems/open-the-lock/description/)

**Problem Statement**: You have a lock in front of you with 4 circular wheels. Each wheel has 10 slots: '0' to '9'. The wheels can rotate freely and wrap around: for example we can turn '9' to be '0', or '0' to be '9'. Each move consists of turning one wheel one slot. The lock initially starts at '0000', a string representing the state of the wheels. Given a list of deadends, meaning if the lock displays these, it becomes inoperable, and a target combination, return the minimum number of moves required to open the lock, or -1 if it is impossible.

**Solution**:

```python
from collections import deque

def openLock(deadends, target):
    dead_set = set(deadends)
    queue = deque([('0000', 0)])
    seen = {'0000'}
    
    while queue:
        state, turns = queue.popleft()
        
        if state == target:
            return turns
        if state in dead_set:
            continue
        
        for i in range(4):
            for move in (-1, 1):
                next_state = state[:i] + str((int(state[i]) + move) % 10) + state[i+1:]
                if next_state not in seen and next_state not in dead_set:
                    seen.add(next_state)
                    queue.append((next_state, turns + 1))
    
    return -1
```

**Explanation**: This BFS solution navigates through each possible state of the lock, checking against deadends and keeping track of the minimum turns needed to reach the target.

### Problem 11: [Get Watched Videos by Your Friends](https://leetcode.com/problems/get-watched-videos-by-your-friends/description/)

**Problem Statement**: Given a list of watched videos by friends, where `videos[i]` is a list of videos watched by the i-th friend, and `friends[i]` is a list of friends who are direct friends of the i-th friend, determine the most frequently watched video(s) among all friends up to a given level `k`.

**Solution**:

```python
from collections import deque, Counter

def watchedVideosByFriends(watchedVideos, friends, id, level):
    queue = deque([(id, 0)])
    visited = set([id])
    videos = []
    
    while queue:
        person, depth = queue.popleft()
        if depth == level:
            for video in watchedVideos[person]:
                videos.append(video)
        elif depth < level:
            for friend in friends[person]:
                if friend not in visited:
                    visited.add(friend)
                    queue.append((friend, depth + 1))
    
    video_count = Counter(videos)
    return sorted(video_count.keys(), key=lambda x: (video_count[x], x))
```

**Explanation**: The solution uses BFS to find all friends up to depth `k` and collects their watched videos. It then sorts the videos by frequency and name using a counter and a sorting function.

### Problem 12: [Shortest Path with Alternating Colors](https://leetcode.com/problems/shortest-path-with-alternating-colors/description/)

**Problem Statement**: Consider a directed graph where each edge is colored either red or blue, and you can only follow the paths of alternating colors. Given the number of nodes `n`, edges `redEdges`, and `blueEdges`, return an array answer of length `n`, where `answer[i]` is the length of the shortest path from node `0` to node `i` using alternating colors, or -1 if no such path exists.

**Solution**:

```python
from collections import deque, defaultdict

def shortestAlternatingPaths(n, redEdges, blueEdges):
    red_graph = defaultdict(list)
    blue_graph = defaultdict(list)
    for u, v in redEdges:
        red_graph[u].append(v)
    for u, v in blueEdges:
        blue_graph[u].append(v)
    
    queue = deque([(0, 0, 'r'), (0, 0, 'b')])  # (node, distance, color)
    seen = set((0, 'r'), (0, 'b'))
    answer = [-1] * n
    answer[0] = 0
    
    while queue:
        node, dist, color = queue.popleft()
        
        next_color = 'b' if color == 'r' else 'r'
        next_graph = blue_graph if color == 'r' else red_graph
        
        for nei in next_graph[node]:
            if (nei, next_color) not in seen:
                seen.add((nei, next_color))
                queue.append((nei, dist + 1, next_color))
                if answer[nei] == -1 or answer[nei] > dist + 1:
                    answer[nei] = dist + 1
                    
    return answer
```

**Explanation**: This BFS approach tracks the color of the last edge used and alternates between red and blue graphs, updating distances and ensuring each path alternates in color. The structure ensures paths are minimal and correctly alternated.

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

```python
from collections import defaultdict

def consolidate_rules_dfs(rules):
    graph = build_graph(rules)
    return find_connected_components(graph)

def build_graph(rules):
    graph = defaultdict(list)
    for rule in rules:
        for i in range(len(rule) - 1):
            a, b = rule[i], rule[i + 1]
            graph[a].append(b)
            graph[b].append(a)
    return graph

def find_connected_components(graph):
    visited = set()
    components = []
    for node in graph:
        if node not in visited:
            component = dfs_collect(node, graph, visited)
            components.append(sorted(component))
    return components

def dfs_collect(start, graph, visited):
    stack = [start]
    visited.add(start)
    component = []
    while stack:
        current = stack.pop()
        component.append(current)
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)
    return component
```

**Time Complexity**:

Let $n$ be the number of rules, and let each rule contain at most $k$ items. Then the total number of items across all rules is at most $n\cdot k$. Building the graph requires looking at each rule and connecting adjacent pairs, so the graph-construction step takes $O(nk)$ time. The DFS phase involves visiting each node and each edge once. The number of nodes is at most $n \cdot k$, and the number of edges is bounded by $n \cdot k$ when connecting only adjacent pairs. Consequently, the overall complexity is $O(nk)$.
